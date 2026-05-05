const articleController = require('express').Router();
const { updateArticleRelationships, transformArticle } = require('../utils/articleUtils');
const customError = require('../utils/customError');
const { article, mainImage, section, image, user_details } = require('../sequelize/models');
const isAuth = require('../middlewares/isAuth');
const { checkPermission } = require('../middlewares/rbac');

const { Op, where } = require('sequelize');
const rateLimiter = require('../middlewares/rateLimiter');
const crypto = require('crypto');
const path = require('path');
const fsSync = require('fs');
const { Storage } = require('@google-cloud/storage');

// Reuse Firebase Storage credentials (same setup as storageController) so we
// can host og:image previews on our own bucket instead of hot-linking.
let _ogStorageBucket = null;
const getOgStorageBucket = () => {
    if (_ogStorageBucket) return _ogStorageBucket;
    let storage;
    if (process.env.NODE_ENV !== 'production') {
        const saPath = path.resolve(__dirname, '../config/firebase-service-account.json');
        storage = fsSync.existsSync(saPath)
            ? new Storage({ projectId: 'pensaclub-909e0', keyFilename: saPath })
            : new Storage({ projectId: 'pensaclub-909e0' });
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        storage = new Storage({
            projectId: process.env.FIREBASE_PROJECT_ID,
            credentials: {
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
        });
    } else {
        storage = new Storage({ projectId: 'pensaclub-909e0' });
    }
    const bucketName = process.env.GCS_BUCKET || 'pensaclub-909e0.appspot.com';
    _ogStorageBucket = storage.bucket(bucketName);
    return _ogStorageBucket;
};

const OG_IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5MB
const OG_IMAGE_FETCH_TIMEOUT_MS = 8000;
const OG_IMAGE_ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

const mimeToExt = (mime) => {
    if (!mime) return 'bin';
    const m = mime.toLowerCase().split(';')[0].trim();
    if (m === 'image/jpeg') return 'jpg';
    if (m === 'image/png') return 'png';
    if (m === 'image/webp') return 'webp';
    if (m === 'image/gif') return 'gif';
    if (m === 'image/svg+xml') return 'svg';
    return 'bin';
};

// Mirror an external image URL to our Firebase Storage. Returns the Firebase
// download URL on success, or the original URL on any failure (so the user
// at least sees something instead of an empty preview).
const proxyOgImageToFirebase = async (sourceUrl) => {
    if (!sourceUrl || typeof sourceUrl !== 'string') return null;
    if (!/^https?:\/\//i.test(sourceUrl)) return sourceUrl;

    let parsed;
    try { parsed = new URL(sourceUrl); }
    catch { return sourceUrl; }

    // SSRF guard — same private-IP rejection as the metadata endpoint.
    try {
        const dns = require('dns').promises;
        const lookups = await dns.lookup(parsed.hostname, { all: true });
        if (!lookups.length || lookups.some((r) => isPrivateIp(r.address))) return sourceUrl;
    } catch { return sourceUrl; }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), OG_IMAGE_FETCH_TIMEOUT_MS);

    try {
        const resp = await fetch(sourceUrl, {
            redirect: 'follow',
            signal: controller.signal,
            headers: {
                'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
                'Accept': 'image/*',
            },
        });
        if (!resp.ok) { clearTimeout(timer); return sourceUrl; }

        const contentType = (resp.headers.get('content-type') || '').toLowerCase().split(';')[0].trim();
        if (!OG_IMAGE_ALLOWED_MIMES.includes(contentType)) { clearTimeout(timer); return sourceUrl; }

        const declaredLen = parseInt(resp.headers.get('content-length') || '0', 10);
        if (declaredLen && declaredLen > OG_IMAGE_MAX_BYTES) { clearTimeout(timer); return sourceUrl; }

        // Read with size cap.
        let received = 0;
        const chunks = [];
        const reader = resp.body.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            received += value.length;
            if (received > OG_IMAGE_MAX_BYTES) {
                try { await reader.cancel(); } catch { /* noop */ }
                clearTimeout(timer);
                return sourceUrl;
            }
            chunks.push(value);
        }
        clearTimeout(timer);

        const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));
        const ext = mimeToExt(contentType);
        const random = crypto.randomBytes(6).toString('hex');
        const filename = `${Date.now()}-${random}.${ext}`;
        const storagePath = `articles/useful-links/og/${filename}`;

        const bucket = getOgStorageBucket();
        const file = bucket.file(storagePath);
        const downloadToken = crypto.randomUUID();
        await file.save(buffer, {
            contentType,
            resumable: false,
            metadata: {
                contentType,
                metadata: {
                    firebaseStorageDownloadTokens: downloadToken,
                    sourceUrl,
                },
            },
        });

        // Build the standard Firebase Storage download URL pattern that
        // matches what the client SDK produces.
        const encodedPath = encodeURIComponent(storagePath);
        return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`;
    } catch (err) {
        clearTimeout(timer);
        console.warn('[og-image proxy] failed:', err && err.message);
        return sourceUrl;
    }
};

const articleIncludeConfig = [
    {
        model: mainImage,
        as: 'mainImage',
        attributes: ['id', 'type', 'sources', 'alt', 'thumbnail', 'videoUrl'],
    },
    {
        model: section,
        as: 'sections',
        attributes: ['id', 'title', 'content', 'order'],
        where: { sectionLinkConnection: 'article' },
        include: [
            {
                model: image,
                as: 'sectionImages',
                attributes: ['id', 'src', 'alt', 'caption'],
                where: { imageLinkConnection: 'section' },
                required: false,
            },
        ],
        order: [['order', 'ASC']],
    },
    {
        model: article,
        as: 'relatedArticle',
        attributes: ['id', 'title', 'slug'],
    },
    {
        model: article,
        as: 'nextArticle',
        attributes: ['id', 'title', 'slug'],
    },
    {
        model: article,
        as: 'previousArticle',
        attributes: ['id', 'title', 'slug'],
    },
];

const articleAttributes = ['id', 'title', 'slug', 'summary', 'author', 'publishDate', 'tags', 'updatedBy', 'usefulLinks', 'createdAt', 'updatedAt'];

const MAX_USEFUL_LINKS = 50;
const MAX_URL_FETCH_BYTES = 5 * 1024 * 1024;
const URL_FETCH_TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 3;
const ALLOWED_IMAGE_SOURCES = ['og', 'url', 'upload', 'none'];

const sanitizeUsefulLinks = (input) => {
    if (!Array.isArray(input)) return [];
    const cleaned = [];
    for (const raw of input) {
        if (!raw || typeof raw !== 'object') continue;
        const url = typeof raw.url === 'string' ? raw.url.trim() : '';
        if (!url) continue;
        const label = typeof raw.label === 'string' ? raw.label.trim() : '';
        const description = typeof raw.description === 'string' ? raw.description.trim() : '';
        const image = typeof raw.image === 'string' && raw.image.trim() ? raw.image.trim() : null;
        const ogImage = typeof raw.ogImage === 'string' && raw.ogImage.trim() ? raw.ogImage.trim() : null;
        const imageSource = ALLOWED_IMAGE_SOURCES.includes(raw.imageSource) ? raw.imageSource : 'none';
        const fetchedAt = typeof raw.fetchedAt === 'string' && raw.fetchedAt.trim()
            ? raw.fetchedAt.trim()
            : new Date().toISOString();
        cleaned.push({ label, url, image, ogImage, description, imageSource, fetchedAt });
        if (cleaned.length >= MAX_USEFUL_LINKS) break;
    }
    return cleaned;
};

const isPrivateIp = (ip) => {
    if (!ip) return true;
    if (ip === '::1' || ip === '0:0:0:0:0:0:0:1') return true;
    if (ip.startsWith('::ffff:')) return isPrivateIp(ip.slice(7));
    if (/^f[cd][0-9a-f]{2}:/i.test(ip)) return true;
    if (/^fe80:/i.test(ip)) return true;

    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return false;
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    return false;
};

const decodeHtmlEntities = (str) => {
    if (!str) return '';
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
        .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
};

const extractMetaContent = (html, propertyName, attrName = 'property') => {
    const safeName = propertyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patterns = [
        new RegExp(`<meta[^>]+${attrName}=["']${safeName}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i'),
        new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*${attrName}=["']${safeName}["'][^>]*>`, 'i'),
    ];
    for (const re of patterns) {
        const m = html.match(re);
        if (m && m[1]) return decodeHtmlEntities(m[1].trim());
    }
    return '';
};

const extractTitleTag = (html) => {
    const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (m && m[1]) return decodeHtmlEntities(m[1].trim().replace(/\s+/g, ' '));
    return '';
};

// Find <link rel="icon|apple-touch-icon|shortcut icon" href="..." sizes="NxN">
// Returns array of {href, area} sorted by area desc (largest first).
const extractIconLinks = (html) => {
    const out = [];
    const linkRe = /<link\b([^>]+)>/gi;
    let m;
    while ((m = linkRe.exec(html))) {
        const attrs = m[1];
        const relMatch = attrs.match(/\brel\s*=\s*["']([^"']+)["']/i);
        if (!relMatch) continue;
        const rel = relMatch[1].toLowerCase();
        if (!/\b(?:apple-touch-icon|icon|shortcut)\b/.test(rel)) continue;
        const hrefMatch = attrs.match(/\bhref\s*=\s*["']([^"']+)["']/i);
        if (!hrefMatch) continue;
        const href = decodeHtmlEntities(hrefMatch[1].trim());
        if (!href) continue;
        const sizesMatch = attrs.match(/\bsizes\s*=\s*["']([^"']+)["']/i);
        let area = 0;
        if (sizesMatch) {
            const dims = sizesMatch[1].toLowerCase().split(/\s+/);
            for (const d of dims) {
                const dm = d.match(/^(\d+)x(\d+)$/);
                if (dm) area = Math.max(area, parseInt(dm[1], 10) * parseInt(dm[2], 10));
            }
        }
        // Apple touch icons are typically high-quality even without sizes attr
        if (!area && /apple-touch-icon/.test(rel)) area = 180 * 180;
        out.push({ href, area });
    }
    out.sort((a, b) => b.area - a.area);
    return out;
};

const resolveAbsoluteUrl = (maybeRelative, baseUrl) => {
    if (!maybeRelative) return '';
    try {
        return new URL(maybeRelative, baseUrl).toString();
    } catch (_) {
        return maybeRelative;
    }
};

const fetchUrlMetadata = async (rawUrl) => {
    let parsed;
    try {
        parsed = new URL(rawUrl);
    } catch (_) {
        return { status: 400, body: { success: false, code: 'BLOCKED', message: 'Invalid URL' } };
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { status: 400, body: { success: false, code: 'BLOCKED', message: 'Only http and https are allowed' } };
    }

    const dns = require('dns').promises;
    try {
        const lookups = await dns.lookup(parsed.hostname, { all: true });
        if (!lookups.length || lookups.some((r) => isPrivateIp(r.address))) {
            return { status: 400, body: { success: false, code: 'BLOCKED', message: 'Private or loopback target rejected' } };
        }
    } catch (_) {
        return { status: 400, body: { success: false, code: 'BLOCKED', message: 'DNS resolution failed' } };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), URL_FETCH_TIMEOUT_MS);

    let currentUrl = parsed.toString();
    let response;
    let redirects = 0;
    try {
        while (true) {
            response = await fetch(currentUrl, {
                method: 'GET',
                redirect: 'manual',
                signal: controller.signal,
                headers: {
                    // Facebook's crawler UA — most sites optimize their meta
                    // tags for it (incl. our own botDetector), giving
                    // article-specific og:* instead of an SPA shell.
                    'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'en;q=0.8',
                },
            });
            if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
                redirects += 1;
                if (redirects > MAX_REDIRECTS) {
                    clearTimeout(timer);
                    return { status: 200, body: { success: false, code: 'NETWORK', message: 'Too many redirects' } };
                }
                const next = resolveAbsoluteUrl(response.headers.get('location'), currentUrl);
                let nextParsed;
                try { nextParsed = new URL(next); } catch (_) {
                    clearTimeout(timer);
                    return { status: 200, body: { success: false, code: 'NETWORK', message: 'Invalid redirect target' } };
                }
                if (nextParsed.protocol !== 'http:' && nextParsed.protocol !== 'https:') {
                    clearTimeout(timer);
                    return { status: 400, body: { success: false, code: 'BLOCKED', message: 'Redirect to non-http target' } };
                }
                try {
                    const lookups = await dns.lookup(nextParsed.hostname, { all: true });
                    if (!lookups.length || lookups.some((r) => isPrivateIp(r.address))) {
                        clearTimeout(timer);
                        return { status: 400, body: { success: false, code: 'BLOCKED', message: 'Redirect to private target rejected' } };
                    }
                } catch (_) {
                    clearTimeout(timer);
                    return { status: 400, body: { success: false, code: 'BLOCKED', message: 'Redirect DNS failed' } };
                }
                currentUrl = nextParsed.toString();
                continue;
            }
            break;
        }
    } catch (err) {
        clearTimeout(timer);
        if (err && err.name === 'AbortError') {
            return { status: 504, body: { success: false, code: 'TIMEOUT', message: 'Fetch timed out' } };
        }
        return { status: 200, body: { success: false, code: 'NETWORK', message: err && err.message ? err.message : 'Network error' } };
    }

    if (!response.ok) {
        clearTimeout(timer);
        return { status: 200, body: { success: false, code: 'NETWORK', message: `HTTP ${response.status}` } };
    }

    const ctype = (response.headers.get('content-type') || '').toLowerCase();
    if (ctype && !ctype.includes('text/html') && !ctype.includes('application/xhtml')) {
        clearTimeout(timer);
        return { status: 200, body: { success: false, code: 'NOT_HTML', message: `Unsupported content-type: ${ctype}` } };
    }

    let received = 0;
    const chunks = [];
    try {
        const reader = response.body.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            received += value.length;
            if (received > MAX_URL_FETCH_BYTES) {
                try { await reader.cancel(); } catch (_) {}
                break;
            }
            chunks.push(value);
        }
    } catch (err) {
        clearTimeout(timer);
        if (err && err.name === 'AbortError') {
            return { status: 504, body: { success: false, code: 'TIMEOUT', message: 'Body read timed out' } };
        }
        return { status: 200, body: { success: false, code: 'NETWORK', message: err && err.message ? err.message : 'Body read error' } };
    }
    clearTimeout(timer);

    const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
    const buffer = new Uint8Array(totalLen);
    let offset = 0;
    for (const c of chunks) { buffer.set(c, offset); offset += c.length; }
    const html = new TextDecoder('utf-8', { fatal: false }).decode(buffer);

    const headSnippet = html.slice(0, 256 * 1024);

    let image = extractMetaContent(headSnippet, 'og:image')
        || extractMetaContent(headSnippet, 'og:image:secure_url')
        || extractMetaContent(headSnippet, 'twitter:image', 'name')
        || extractMetaContent(headSnippet, 'twitter:image', 'property')
        || extractMetaContent(headSnippet, 'twitter:image:src', 'name');
    let title = extractMetaContent(headSnippet, 'og:title')
        || extractMetaContent(headSnippet, 'twitter:title', 'name')
        || extractTitleTag(headSnippet);
    let description = extractMetaContent(headSnippet, 'og:description')
        || extractMetaContent(headSnippet, 'twitter:description', 'name')
        || extractMetaContent(headSnippet, 'description', 'name');
    const siteName = extractMetaContent(headSnippet, 'og:site_name')
        || extractMetaContent(headSnippet, 'application-name', 'name');

    if (image) image = resolveAbsoluteUrl(image, currentUrl);

    // Fallback: largest favicon / apple-touch-icon on the page
    if (!image) {
        const icons = extractIconLinks(headSnippet);
        for (const icon of icons) {
            const abs = resolveAbsoluteUrl(icon.href, currentUrl);
            if (abs && /^https?:\/\//i.test(abs)) { image = abs; break; }
        }
    }
    // Final fallback: Google's public favicon service (always returns SOMETHING)
    if (!image) {
        try {
            const host = new URL(currentUrl).hostname;
            if (host) image = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
        } catch (_) { /* noop */ }
    }

    // Mirror the meta image to our Firebase bucket so we never depend on
    // the source server staying up / not blocking hotlinks. On any failure
    // proxyOgImageToFirebase returns the original URL — degraded but usable.
    let mirroredImage = image;
    if (image) {
        try {
            mirroredImage = await proxyOgImageToFirebase(image);
        } catch (_) {
            mirroredImage = image;
        }
    }

    return {
        status: 200,
        body: {
            success: true,
            image: mirroredImage || null,
            title: title || null,
            description: description || null,
            siteName: siteName || null,
        },
    };
};

articleController.get('/all', checkPermission('article', 'read'), async (req, res, next) => {
    try {
        const excludeSections = articleIncludeConfig.filter((config) => config.as !== 'sections');

        const articles = await article.findAll({
            include: excludeSections,
            attributes: articleAttributes,
            order: [['publishDate', 'DESC']],
        });

        return res.json(articles || []);
    } catch (err) {
        console.error('Error in /all endpoint:', err);
        next(err);
    }
});

articleController.get('/single/:id', isAuth.allowGuest, rateLimiter, checkPermission('article', 'read'), async (req, res, next) => {
    try {
        const articleId = parseInt(req.params.id);
        if (isNaN(articleId)) {
            throw new customError({
                message: 'Invalid article ID',
                statusCode: 400,
            });
        }

        const foundArticle = await article.findByPk(articleId, {
            include: articleIncludeConfig,
            attributes: articleAttributes,
        });

        if (!foundArticle) {
            throw new customError({
                message: 'Article not found',
                statusCode: 404,
            });
        }

        return res.json(transformArticle(foundArticle)); // Използвай transform
    } catch (err) {
        next(err);
    }
});


articleController.post('/create', isAuth, checkPermission('article', 'create'), async (req, res, next) => {
    try {
        const {
            title,
            slug,
            summary,
            author,
            publishDate,
            mainImage: mainImageData,
            sections,
            tags,
            relatedArticleId,
            nextArticleId,
            previousArticleId,
            usefulLinks,
        } = req.body;

        const errors = {};
        if (!title) errors.title = 'Title is required';
        if (!slug) errors.slug = 'Slug is required';

        if (Object.keys(errors).length > 0) {
            throw new customError({
                message: 'Validation errors',
                statusCode: 400,
                details: errors,
            });
        }

        const existingArticle = await article.findOne({ where: { slug } });
        if (existingArticle) {
            throw new customError({
                message: `Article with slug '${slug}' already exists`,
                statusCode: 409,
            });
        }

        const userDetails = await user_details.findOne({
            where: { user_accounts_id: req.user.userId },
        });

        const newArticle = await article.sequelize.transaction(async (t) => {
            const created = await article.create(
                {
                    title,
                    slug,
                    summary,
                    author: author,
                    publishDate,
                    tags: tags || [],
                    updatedBy: userDetails.username,
                    relatedArticleId,
                    nextArticleId,
                    previousArticleId,
                    usefulLinks: sanitizeUsefulLinks(usefulLinks),
                },
                { transaction: t }
            );

            if (mainImageData) {
                await mainImage.create(
                    {
                        ...mainImageData,
                        articleId: created.id,
                    },
                    { transaction: t }
                );
            }

            if (sections && sections.length > 0) {
                await Promise.all(
                    sections.map(async (sectionData, index) => {
                        const newSection = await section.create(
                            {
                                title: sectionData.title ?? null,
                                content: sectionData.content ?? null,
                                order: sectionData.order || index + 1,
                                sectionableId: created.id,
                                sectionLinkConnection: 'article',
                            },
                            { transaction: t }
                        );

                        if (sectionData.image && Array.isArray(sectionData.image)) {
                            await Promise.all(
                                sectionData.image.map(async (imageData) => {
                                    await image.create(
                                        {
                                            src: imageData.src ?? null,
                                            alt: imageData.alt ?? null,
                                            caption: imageData.caption ?? null,
                                            imageableId: newSection.id,
                                            imageLinkConnection: 'section',
                                        },
                                        { transaction: t }
                                    );
                                })
                            );
                        }
                    })
                );
            }

            await updateArticleRelationships(created, { relatedArticleId, nextArticleId, previousArticleId }, t);

            return created;
        });

        const createdArticle = await article.findByPk(newArticle.id, {
            include: articleIncludeConfig,
            attributes: articleAttributes,
        });

        // Phase 4 — enqueue reactive publish event for subscriber notifications
        try {
            const { enqueuePublishEvent } = require('../utils/notificationQueue');
            const thumb =
                createdArticle?.mainImage?.thumbnail ||
                (Array.isArray(createdArticle?.mainImage?.sources)
                    ? createdArticle.mainImage.sources[0]
                    : null);
            await enqueuePublishEvent({
                type: 'article',
                referenceId: createdArticle.id,
                referenceTitle: createdArticle.title,
                referenceSlug: createdArticle.slug,
                thumbnail: thumb || null,
            });
        } catch (e) {
            console.error('[notification_queue] article publish enqueue:', e?.message || e);
        }

        return res.status(201).json(transformArticle(createdArticle));
    } catch (err) {
        next(err);
    }
});

articleController.put('/:id', isAuth, checkPermission('article', 'update'), async (req, res, next) => {
    try {
        const articleId = parseInt(req.params.id);
        if (isNaN(articleId)) {
            throw new customError({
                message: 'Invalid article ID',
                statusCode: 400,
            });
        }

        const {
            title,
            slug,
            summary,
            author,
            publishDate,
            mainImage: mainImageData,
            sections,
            tags,
            relatedArticleId,
            nextArticleId,
            previousArticleId,
            usefulLinks,
        } = req.body;

        const existingArticle = await article.findByPk(articleId, {
            include: articleIncludeConfig,
            attributes: articleAttributes,
        });

        if (!existingArticle) {
            throw new customError({
                message: 'Article not found',
                statusCode: 404,
            });
        }

        if (slug && slug !== existingArticle.slug) {
            const slugExists = await article.findOne({
                where: {
                    slug,
                    id: { [Op.ne]: articleId },
                },
            });
            if (slugExists) {
                throw new customError('Article with this slug already exists', 400);
            }
        }

        const userDetails = await user_details.findOne({
            where: { user_accounts_id: req.user.userId },
        });

        const updatedArticle = await article.sequelize.transaction(async (t) => {
            await updateArticleRelationships(existingArticle, { relatedArticleId, nextArticleId, previousArticleId }, t);

             const articleUpdate = {
            ...(title !== undefined && { title }),
            ...(slug !== undefined && { slug }),
            ...(summary !== undefined && { summary }),
            ...(author !== undefined && { author }),
            ...(publishDate !== undefined && { publishDate }),
            ...(tags !== undefined && { tags }),
            ...(usefulLinks !== undefined && { usefulLinks: sanitizeUsefulLinks(usefulLinks) }),
            updatedBy: userDetails.username,
        };
            await existingArticle.update(articleUpdate, { transaction: t });

            if (mainImageData) {
                if (existingArticle.mainImage) {
                    await existingArticle.mainImage.update(mainImageData, { transaction: t });
                } else {
                    await mainImage.create(
                        {
                            ...mainImageData,
                            articleId: existingArticle.id,
                        },
                        { transaction: t }
                    );
                }
            }

            if (sections && Array.isArray(sections)) {
                const existingSections = await section.findAll({
                    where: { sectionableId: existingArticle.id, sectionLinkConnection: 'article' },
                    include: [{ model: image, as: 'sectionImages' }],
                    transaction: t,
                });

                const existingSectionIds = new Set(existingSections.map((s) => s.id));
                const newSectionIds = new Set(sections.filter((s) => s.id).map((s) => s.id));

                const sectionsToDelete = existingSections.filter((s) => !newSectionIds.has(s.id));

                if (sectionsToDelete.length > 0) {
                    await section.destroy({
                        where: {
                            id: sectionsToDelete.map((s) => s.id),
                        },
                        transaction: t,
                    });
                }

                for (const sectionData of sections) {
                    if (!sectionData.id) {
                        const newSection = await section.create(
                            {
                                title: sectionData.title ?? null,
                                content: sectionData.content ?? null,
                                order: sectionData.order,
                                sectionableId: existingArticle.id,
                                sectionLinkConnection: 'article',
                            },
                            { transaction: t }
                        );

                        if (sectionData.image && Array.isArray(sectionData.image)) {
                            await Promise.all(
                                sectionData.image.map(async (imageData) => {
                                    await image.create(
                                        {
                                            src: imageData.src ?? null,
                                            alt: imageData.alt ?? null,
                                            caption: imageData.caption ?? null,
                                            imageableId: newSection.id,
                                            imageLinkConnection: 'section',
                                        },
                                        { transaction: t }
                                    );
                                })
                            );
                        }
                    } else if (existingSectionIds.has(sectionData.id)) {
                        const existingSection = existingSections.find((s) => s.id === sectionData.id);

                        await existingSection.update(
                            {
                                title: sectionData.title ?? null,
                                content: sectionData.content ?? null,
                                order: sectionData.order,
                            },
                            { transaction: t }
                        );

                        if (sectionData.image && Array.isArray(sectionData.image)) {
                            await image.destroy({
                                where: {
                                    imageableId: existingSection.id,
                                    imageLinkConnection: 'section',
                                    id: {
                                        [Op.notIn]: sectionData.image.filter((img) => img.id).map((img) => img.id),
                                    },
                                },
                                transaction: t,
                            });

                            await Promise.all(
                                sectionData.image.map(async (imageData) => {
                                    if (imageData.id) {
                                        await image.update(
                                            {
                                                src: imageData.src ?? null,
                                                alt: imageData.alt ?? null,
                                                caption: imageData.caption ?? null,
                                            },
                                            {
                                                where: {
                                                    id: imageData.id,
                                                    imageLinkConnection: 'section',
                                                },
                                                transaction: t,
                                            }
                                        );
                                    } else {
                                        await image.create(
                                            {
                                                src: imageData.src ?? null,
                                                alt: imageData.alt ?? null,
                                                caption: imageData.caption ?? null,
                                                imageableId: existingSection.id,
                                                imageLinkConnection: 'section',
                                            },
                                            { transaction: t }
                                        );
                                    }
                                })
                            );
                        } else if (existingSection.images) {
                            await image.destroy({
                                where: {
                                    imageableId: existingSection.id,
                                    imageLinkConnection: 'section',
                                },
                                transaction: t,
                            });
                        }
                    }
                }
            }

            return await article.findByPk(articleId, {
                include: articleIncludeConfig,
                attributes: articleAttributes,
                transaction: t,
            });
        });

        return res.json(transformArticle(updatedArticle));
    } catch (err) {
        next(err);
    }
});

articleController.delete('/:id', isAuth, checkPermission('article', 'delete'), async (req, res, next) => {
    try {
        const articleId = parseInt(req.params.id);
        if (isNaN(articleId)) {
            throw new customError({
                message: 'Invalid article ID',
                statusCode: 400,
            });
        }

        const articleToDelete = await article.findByPk(articleId, {
            include: articleIncludeConfig,
        });

        if (!articleToDelete) {
            throw new customError({
                message: 'Article not found',
                statusCode: 404,
            });
        }

        const affectedArticles = await article.findAll({
            where: {
                [Op.or]: [{ nextArticleId: articleId }, { previousArticleId: articleId }, { relatedArticleId: articleId }],
            },
            include: articleIncludeConfig,
            attributes: articleAttributes,
        });

        await article.sequelize.transaction(async (t) => {
            if (articleToDelete.nextArticle && articleToDelete.previousArticle) {
                await articleToDelete.previousArticle.update(
                    {
                        nextArticleId: articleToDelete.nextArticle.id,
                    },
                    { transaction: t }
                );

                await articleToDelete.nextArticle.update(
                    {
                        previousArticleId: articleToDelete.previousArticle.id,
                    },
                    { transaction: t }
                );
            } else if (articleToDelete.nextArticle) {
                await articleToDelete.nextArticle.update(
                    {
                        previousArticleId: null,
                    },
                    { transaction: t }
                );
            } else if (articleToDelete.previousArticle) {
                await articleToDelete.previousArticle.update(
                    {
                        nextArticleId: null,
                    },
                    { transaction: t }
                );
            }

            await article.update(
                {
                    relatedArticleId: null,
                },
                {
                    where: { relatedArticleId: articleId },
                    transaction: t,
                }
            );

            await articleToDelete.destroy({ transaction: t });
        });

        return res.json({
            message: 'Article deleted successfully',
            affectedArticles: affectedArticles,
        });
    } catch (err) {
        next(err);
    }
});

articleController.get('/url-metadata', isAuth, checkPermission('article', 'create'), async (req, res, next) => {
    try {
        const url = typeof req.query.url === 'string' ? req.query.url.trim() : '';
        if (!url) {
            return res.status(400).json({ success: false, code: 'BLOCKED', message: 'Missing url query param' });
        }
        if (!/^https?:\/\//i.test(url)) {
            return res.status(400).json({ success: false, code: 'BLOCKED', message: 'URL must start with http:// or https://' });
        }

        const result = await fetchUrlMetadata(url);
        const body = result.body || {};
        if (body.success) {
            console.log(`[url-metadata] fetched: ${url} -> image=${!!body.image} title=${!!body.title}`);
        } else {
            console.log(`[url-metadata] failed: ${url} -> code=${body.code || 'UNKNOWN'}`);
        }
        return res.status(result.status).json(body);
    } catch (err) {
        console.error('[url-metadata] unexpected error:', err && err.message ? err.message : err);
        return res.status(200).json({ success: false, code: 'NETWORK', message: 'Unexpected error' });
    }
});

module.exports = articleController;
