const newsletterController = require('express').Router();
const { Op } = require('sequelize');
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');
const {
    newsletter,
    newsletter_log,
    user_account,
    seminar,
    course,
    article,
    mainImage,
    initiative,
    project,
    publication,
    image,
    subscriber,
    subscriber_preference,
} = require('../sequelize/models/index');
const { wrapNewsletter, beautifyBodyHtml, wrapDigestBody } = require('../utils/newsletterTemplates');
const { sendNewsletterEmail } = require('../utils/zohoEmails');
const { sendNewsletterToAll } = require('../utils/newsletterSender');

const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'https://pensa.club';
const absolutizeUrl = (url) => {
    if (!url) return null;
    const s = String(url).trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s)) return s;
    return `${PUBLIC_BASE_URL}${s.startsWith('/') ? '' : '/'}${s}`;
};

const ALLOWED_CATEGORIES = ['seminars', 'courses', 'articles', 'initiatives', 'clubs', 'games', 'platform'];

const renderPlatformUpdatesHtml = (text) => {
    if (!text || !String(text).trim()) return '';
    const lines = String(text)
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
    if (lines.length === 0) return '';
    const items = lines
        .map(
            (l) =>
                `<li style="margin:6px 0;color:#374151;font-size:14px;line-height:1.55;">${l
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')}</li>`,
        )
        .join('');
    return `
        <div style="margin:24px 0 8px;padding:18px 20px;background:#fff7ed;border:1px solid #fde4c7;border-radius:10px;">
            <p style="margin:0 0 10px;color:#9a3412;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">📢 Планирани ъпдейти</p>
            <ul style="margin:0;padding-left:20px;">${items}</ul>
        </div>`;
};

const formatNewsletterDate = (date = new Date()) => {
    try {
        return new Intl.DateTimeFormat('bg-BG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(new Date(date));
    } catch {
        return '';
    }
};

const renderNewsletterHtml = ({ title, body, platformUpdates, sentAt, subscriberName, intro }) => {
    const safeTitle = title || 'Pensa Club';
    const beautified = `${beautifyBodyHtml(body || '')}${renderPlatformUpdatesHtml(platformUpdates)}`;
    const wrappedBody = wrapDigestBody({
        subscriberName: subscriberName || '',
        intro: intro || '',
        bodyHtml: beautified,
    });
    const subLabel = formatNewsletterDate(sentAt || new Date());
    return wrapNewsletter(safeTitle, wrappedBody, 'PREVIEW_TOKEN', subLabel);
};

const countRecipients = async (targetCategories) => {
    // Segment mode with 0 categories selected = explicit 0 recipients
    if (Array.isArray(targetCategories) && targetCategories.length === 0) {
        return 0;
    }
    const where = { status: 'active' };
    if (Array.isArray(targetCategories) && targetCategories.length > 0) {
        return subscriber.count({
            where,
            include: [
                {
                    model: subscriber_preference,
                    as: 'preferences',
                    required: true,
                    where: {
                        category: { [Op.in]: targetCategories },
                        enabled: true,
                    },
                },
            ],
            distinct: true,
        });
    }
    return subscriber.count({ where });
};

// Constants
const ALLOWED_STATUSES = ['draft', 'scheduled', 'sent', 'failed', 'sending'];
const ALLOWED_TYPES = ['manual', 'weekly', 'monthly', 'event'];

const buildFilters = (query) => {
    const where = {};

    if (query.status && ALLOWED_STATUSES.includes(query.status)) {
        where.status = query.status;
    }
    if (query.type && ALLOWED_TYPES.includes(query.type)) {
        where.type = query.type;
    }
    if (query.search && String(query.search).trim()) {
        where.title = { [Op.iLike]: `%${String(query.search).trim()}%` };
    }
    if (query.dateFrom || query.dateTo) {
        where.createdAt = {};
        if (query.dateFrom) where.createdAt[Op.gte] = new Date(query.dateFrom);
        if (query.dateTo) {
            const to = new Date(query.dateTo);
            to.setHours(23, 59, 59, 999);
            where.createdAt[Op.lte] = to;
        }
    }

    return where;
};

const MAX_TITLE_LEN = 500;
const MAX_SUBJECT_LEN = 500;
const MAX_BODY_LEN = 500000;

const validateCategories = (value) => {
    if (value === null || value === undefined) return null;
    if (!Array.isArray(value)) return undefined; // invalid
    const ALLOWED = ['seminars', 'courses', 'articles', 'initiatives', 'clubs', 'games', 'platform'];
    const filtered = value.filter((v) => ALLOWED.includes(v));
    // Preserve the array (even when empty) — segmented mode with 0 picks is valid.
    return filtered;
};

const sanitizePayload = (body = {}, { partial = false } = {}) => {
    const out = {};
    const errors = [];

    if (body.title !== undefined) {
        const title = String(body.title || '').trim();
        if (!title) errors.push('title');
        else if (title.length > MAX_TITLE_LEN) errors.push('title_too_long');
        else out.title = title;
    } else if (!partial) {
        errors.push('title');
    }

    if (body.subject !== undefined) {
        const subject = body.subject === null ? null : String(body.subject).trim();
        if (subject && subject.length > MAX_SUBJECT_LEN) errors.push('subject_too_long');
        else out.subject = subject || null;
    }

    if (body.body !== undefined) {
        const content = body.body === null ? '' : String(body.body);
        if (content.length > MAX_BODY_LEN) errors.push('body_too_long');
        else out.body = content;
    }

    if (body.targetCategories !== undefined) {
        const cats = validateCategories(body.targetCategories);
        if (cats === undefined) errors.push('targetCategories');
        else out.targetCategories = cats;
    }

    if (body.platformUpdates !== undefined) {
        out.platformUpdates = body.platformUpdates === null
            ? null
            : String(body.platformUpdates).trim() || null;
    }

    return { data: out, errors };
};

// ═══════════════════════════════════════════════════════════════════════
// POST /newsletter/admin/preview — render preview HTML from payload or draft
// ═══════════════════════════════════════════════════════════════════════
newsletterController.post(
    '/admin/preview',
    isAuth,
    rbac.checkPermission('newsletter', 'read'),
    async (req, res, next) => {
        try {
            const { title, body, platformUpdates } = req.body || {};
            const html = renderNewsletterHtml({
                title: title || '',
                body: body || '',
                platformUpdates: platformUpdates || '',
            });
            res.status(200).json({ html });
        } catch (err) {
            next(err);
        }
    },
);

// ═══════════════════════════════════════════════════════════════════════
// GET /newsletter/admin/recipient-count?categories=a,b,c — match count
// ═══════════════════════════════════════════════════════════════════════
newsletterController.get(
    '/admin/recipient-count',
    isAuth,
    rbac.checkPermission('newsletter', 'read'),
    async (req, res, next) => {
        try {
            let categories = null;
            if (req.query.categories) {
                const arr = String(req.query.categories)
                    .split(',')
                    .map((s) => s.trim())
                    .filter((s) => ALLOWED_CATEGORIES.includes(s));
                categories = arr.length > 0 ? arr : null;
            }
            const count = await countRecipients(categories);
            res.status(200).json({ count, categories: categories || [] });
        } catch (err) {
            next(err);
        }
    },
);

// ═══════════════════════════════════════════════════════════════════════
// GET /newsletter/track/:newsletterId/:subscriberId — 1×1 tracking pixel
// Public (no auth) — email clients hit this when they render the image.
// ═══════════════════════════════════════════════════════════════════════
const TRANSPARENT_GIF = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64',
);
newsletterController.get('/track/:newsletterId/:subscriberId', async (req, res) => {
    try {
        const newsletterId = parseInt(req.params.newsletterId, 10);
        const subscriberId = parseInt(req.params.subscriberId, 10);

        if (Number.isInteger(newsletterId) && Number.isInteger(subscriberId)) {
            await newsletter_log
                .findOne({
                    where: { newsletterId, subscriberId, status: 'opened' },
                })
                .then(async (existing) => {
                    if (!existing) {
                        await newsletter_log.create({
                            newsletterId,
                            subscriberId,
                            channel: 'email',
                            status: 'opened',
                            sentAt: new Date(),
                        });
                    }
                })
                .catch(() => {});
        }
    } catch {
        // swallow — never break pixel delivery
    }
    res.set({
        'Content-Type': 'image/gif',
        'Content-Length': TRANSPARENT_GIF.length,
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        Pragma: 'no-cache',
        Expires: '0',
    });
    return res.status(200).send(TRANSPARENT_GIF);
});

// ═══════════════════════════════════════════════════════════════════════
// GET /newsletter/admin/:id/stats — send / open / fail breakdown
// ═══════════════════════════════════════════════════════════════════════
newsletterController.get(
    '/admin/:id/stats',
    isAuth,
    rbac.checkPermission('newsletter', 'read'),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (!Number.isInteger(id)) {
                return res.status(400).json({ message: 'Invalid id.' });
            }

            const item = await newsletter.findByPk(id);
            if (!item) return res.status(404).json({ message: 'Newsletter not found.' });

            const [sentLogs, openedLogs, failedLogs] = await Promise.all([
                newsletter_log.count({ where: { newsletterId: id, status: 'sent' } }),
                newsletter_log.count({ where: { newsletterId: id, status: 'opened' } }),
                newsletter_log.count({ where: { newsletterId: id, status: 'failed' } }),
            ]);

            const sentCount = item.sentCount || sentLogs;
            const openRate = sentCount > 0 ? Math.round((openedLogs / sentCount) * 100) : 0;

            res.status(200).json({
                newsletterId: id,
                status: item.status,
                sentCount,
                failedCount: item.failedCount || failedLogs,
                openedCount: openedLogs,
                openRate,
            });
        } catch (err) {
            next(err);
        }
    },
);

// ═══════════════════════════════════════════════════════════════════════
// POST /newsletter/admin/:id/send-now — send the draft immediately
// ═══════════════════════════════════════════════════════════════════════
newsletterController.post(
    '/admin/:id/send-now',
    isAuth,
    rbac.checkPermission('newsletter', 'send'),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (!Number.isInteger(id)) {
                return res.status(400).json({ message: 'Invalid id.' });
            }

            const item = await newsletter.findByPk(id);
            if (!item) return res.status(404).json({ message: 'Newsletter not found.' });

            if (!['draft', 'scheduled', 'failed'].includes(item.status)) {
                return res.status(400).json({
                    message: 'Newsletter is not in a sendable state.',
                });
            }
            if (!item.title || !item.body) {
                return res.status(400).json({
                    message: 'Title and body are required before sending.',
                });
            }

            // Fire-and-forget send so the HTTP request doesn't hang on long batches.
            // The newsletter record is updated as it runs; client can poll stats.
            sendNewsletterToAll({
                models: {
                    newsletter,
                    newsletter_log,
                    subscriber,
                    subscriber_preference,
                },
                item,
            }).catch((err) => {
                console.error('[newsletter/send-now] batch error:', err);
            });

            return res.status(202).json({
                message: 'Send started.',
                newsletterId: id,
            });
        } catch (err) {
            next(err);
        }
    },
);

// ═══════════════════════════════════════════════════════════════════════
// POST /newsletter/admin/:id/send-test — send preview to requesting admin
// Body: { to?: string } — optional override recipient (defaults to admin email)
// ═══════════════════════════════════════════════════════════════════════
newsletterController.post(
    '/admin/:id/send-test',
    isAuth,
    rbac.checkPermission('newsletter', 'send'),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (!Number.isInteger(id)) {
                return res.status(400).json({ message: 'Invalid id.' });
            }

            const item = await newsletter.findByPk(id);
            if (!item) return res.status(404).json({ message: 'Newsletter not found.' });

            const overrideTo = typeof req.body?.to === 'string' ? req.body.to.trim() : '';
            let target = overrideTo || '';
            let displayName = '';

            const { user_details } = require('../sequelize/models/index');
            const adminUser = await user_account.findByPk(req.user?.userId, {
                attributes: ['id', 'email'],
                include: [
                    {
                        model: user_details,
                        as: 'details',
                        attributes: ['firstName', 'lastName'],
                        required: false,
                    },
                ],
            });
            if (!target) target = adminUser?.email || '';
            const fn = adminUser?.details?.firstName || '';
            const ln = adminUser?.details?.lastName || '';
            displayName = `${fn} ${ln}`.trim();

            if (!target) {
                return res.status(400).json({ message: 'No recipient email available.' });
            }

            const html = renderNewsletterHtml({
                title: item.title,
                body: item.body,
                platformUpdates: item.platformUpdates,
                sentAt: item.sentAt,
                subscriberName: displayName,
            });
            const subject = `[TEST] ${item.subject || item.title || 'Pensa Club'}`;

            try {
                await sendNewsletterEmail({ to: target, subject, html });
                return res.status(200).json({
                    message: 'Test email sent.',
                    to: target,
                });
            } catch (sendErr) {
                return res.status(502).json({
                    message: 'Email provider rejected the message.',
                    error: sendErr?.message || String(sendErr),
                    to: target,
                });
            }
        } catch (err) {
            next(err);
        }
    },
);

// ═══════════════════════════════════════════════════════════════════════
// GET /newsletter/admin/search-content — unified content search for editor
// ═══════════════════════════════════════════════════════════════════════
newsletterController.get(
    '/admin/search-content',
    isAuth,
    rbac.checkPermission('newsletter', 'read'),
    async (req, res, next) => {
        try {
            const type = String(req.query.type || '').trim();
            const q = String(req.query.q || '').trim();
            const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 30);

            const ilikeFor = (col) =>
                q ? { [col]: { [Op.iLike]: `%${q}%` } } : {};

            let items = [];

            if (type === 'seminars') {
                const rows = await seminar.findAll({
                    where: { ...ilikeFor('title') },
                    attributes: [
                        'id', 'title', 'slug', 'shortDescription',
                        'thumbnailUrl', 'scheduledDate', 'isPublished', 'createdAt',
                    ],
                    order: [['scheduledDate', 'DESC']],
                    limit,
                });
                items = rows.map((r) => ({
                    id: r.id,
                    type: 'seminars',
                    title: r.title,
                    description: r.shortDescription || '',
                    thumbnail: absolutizeUrl(r.thumbnailUrl),
                    url: `/academy/seminars/${r.slug}`,
                    date: r.scheduledDate || r.createdAt,
                    published: !!r.isPublished,
                }));
            } else if (type === 'courses') {
                const rows = await course.findAll({
                    where: { ...ilikeFor('name') },
                    attributes: [
                        'id', 'name', 'slug', 'shortDescription',
                        'thumbnailUrl', 'status', 'publishedAt', 'createdAt',
                    ],
                    order: [['createdAt', 'DESC']],
                    limit,
                });
                items = rows.map((r) => ({
                    id: r.id,
                    type: 'courses',
                    title: r.name,
                    description: r.shortDescription || '',
                    thumbnail: absolutizeUrl(r.thumbnailUrl),
                    url: `/academy/courses/${r.slug}`,
                    date: r.publishedAt || r.createdAt,
                    published: r.status === 'published',
                }));
            } else if (type === 'articles') {
                const rows = await article.findAll({
                    where: { ...ilikeFor('title') },
                    include: [
                        {
                            model: mainImage,
                            as: 'mainImage',
                            required: false,
                            attributes: ['thumbnail', 'sources'],
                        },
                    ],
                    order: [['createdAt', 'DESC']],
                    limit,
                });
                items = rows.map((r) => {
                    const img = r.mainImage || {};
                    const thumb = img.thumbnail || (Array.isArray(img.sources) ? img.sources[0] : null);
                    return {
                        id: r.id,
                        type: 'articles',
                        title: r.title,
                        description: r.shortDescription || r.description?.substring(0, 180) || '',
                        thumbnail: absolutizeUrl(thumb),
                        url: `/articles/${r.slug}`,
                        date: r.publishedDate || r.createdAt,
                        published: true,
                    };
                });
            } else if (type === 'initiatives') {
                const rows = await initiative.findAll({
                    where: { ...ilikeFor('title') },
                    include: [
                        {
                            model: image,
                            as: 'mainImage',
                            required: false,
                            attributes: ['thumbnailUrl'],
                        },
                    ],
                    order: [['createdAt', 'DESC']],
                    limit,
                });
                items = rows.map((r) => ({
                    id: r.id,
                    type: 'initiatives',
                    title: r.title,
                    description: r.shortDescription || '',
                    thumbnail: absolutizeUrl(r.mainImage?.thumbnailUrl),
                    url: `/initiatives/${r.slug}`,
                    date: r.createdAt,
                    published: true,
                }));
            } else if (type === 'projects') {
                const rows = await project.findAll({
                    where: { ...ilikeFor('title') },
                    include: [
                        {
                            model: image,
                            as: 'mainImage',
                            required: false,
                            attributes: ['thumbnailUrl'],
                        },
                    ],
                    order: [['createdAt', 'DESC']],
                    limit,
                });
                items = rows.map((r) => ({
                    id: r.id,
                    type: 'projects',
                    title: r.title,
                    description: r.shortDescription || '',
                    thumbnail: absolutizeUrl(r.mainImage?.thumbnailUrl),
                    url: `/projects/${r.slug}`,
                    date: r.createdAt,
                    published: true,
                }));
            } else if (type === 'publications') {
                const rows = await publication.findAll({
                    where: { ...ilikeFor('title') },
                    include: [
                        {
                            model: image,
                            as: 'image',
                            required: false,
                            attributes: ['thumbnailUrl'],
                        },
                    ],
                    order: [['createdAt', 'DESC']],
                    limit,
                });
                items = rows.map((r) => ({
                    id: r.id,
                    type: 'publications',
                    title: r.title,
                    description: r.shortDescription || '',
                    thumbnail: absolutizeUrl(r.image?.thumbnailUrl),
                    url: `/publications/${r.slug}`,
                    date: r.publishedAt || r.createdAt,
                    published: true,
                }));
            } else {
                return res.status(400).json({ message: 'Unknown content type.' });
            }

            res.status(200).json({ items });
        } catch (err) {
            next(err);
        }
    }
);

// ═══════════════════════════════════════════════════════════════════════
// GET /newsletter/admin — list with filters + pagination
// ═══════════════════════════════════════════════════════════════════════
newsletterController.get(
    '/admin',
    isAuth,
    rbac.checkPermission('newsletter', 'read'),
    async (req, res, next) => {
        try {
            const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
            const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 15, 1), 100);
            const offset = (page - 1) * limit;

            const where = buildFilters(req.query);

            const { rows, count } = await newsletter.findAndCountAll({
                where,
                include: [
                    {
                        model: user_account,
                        as: 'author',
                        attributes: ['id', 'email'],
                        required: false,
                    },
                ],
                order: [['createdAt', 'DESC']],
                limit,
                offset,
            });

            const newsletters = rows.map((row) => {
                const n = row.toJSON();
                return {
                    id: n.id,
                    title: n.title,
                    subject: n.subject,
                    type: n.type,
                    status: n.status,
                    targetCategories: n.targetCategories,
                    scheduledAt: n.scheduledAt,
                    sentAt: n.sentAt,
                    sentCount: n.sentCount,
                    failedCount: n.failedCount,
                    createdAt: n.createdAt,
                    updatedAt: n.updatedAt,
                    author: n.author,
                };
            });

            res.status(200).json({
                newsletters,
                pagination: {
                    page,
                    limit,
                    total: count,
                    totalPages: Math.ceil(count / limit) || 1,
                },
            });
        } catch (err) {
            next(err);
        }
    }
);

// ═══════════════════════════════════════════════════════════════════════
// GET /newsletter/admin/stats — summary counts for dashboard
// ═══════════════════════════════════════════════════════════════════════
newsletterController.get(
    '/admin/stats',
    isAuth,
    rbac.checkPermission('newsletter', 'read'),
    async (req, res, next) => {
        try {
            const [total, sent, scheduled, drafts] = await Promise.all([
                newsletter.count(),
                newsletter.count({ where: { status: 'sent' } }),
                newsletter.count({ where: { status: 'scheduled' } }),
                newsletter.count({ where: { status: 'draft' } }),
            ]);

            res.status(200).json({ total, sent, scheduled, drafts });
        } catch (err) {
            next(err);
        }
    }
);

// ═══════════════════════════════════════════════════════════════════════
// GET /newsletter/admin/:id — single newsletter
// ═══════════════════════════════════════════════════════════════════════
newsletterController.get(
    '/admin/:id',
    isAuth,
    rbac.checkPermission('newsletter', 'read'),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (!Number.isInteger(id)) {
                return res.status(400).json({ message: 'Invalid id.' });
            }

            const item = await newsletter.findByPk(id, {
                include: [
                    {
                        model: user_account,
                        as: 'author',
                        attributes: ['id', 'email'],
                        required: false,
                    },
                ],
            });

            if (!item) return res.status(404).json({ message: 'Newsletter not found.' });

            const openedCount = await newsletter_log.count({
                where: { newsletterId: id, status: 'opened' },
            });

            res.status(200).json({ newsletter: { ...item.toJSON(), openedCount } });
        } catch (err) {
            next(err);
        }
    }
);

// ═══════════════════════════════════════════════════════════════════════
// POST /newsletter/admin — create new draft
// ═══════════════════════════════════════════════════════════════════════
newsletterController.post(
    '/admin',
    isAuth,
    rbac.checkPermission('newsletter', 'create'),
    async (req, res, next) => {
        try {
            const { data, errors } = sanitizePayload(req.body);
            if (errors.length > 0) {
                return res.status(400).json({ message: 'Validation failed.', errors });
            }

            const created = await newsletter.create({
                ...data,
                type: 'manual',
                status: 'draft',
                createdBy: req.user?.userId || null,
            });

            res.status(201).json({ newsletter: created.toJSON() });
        } catch (err) {
            next(err);
        }
    }
);

// ═══════════════════════════════════════════════════════════════════════
// PUT /newsletter/admin/:id — update draft/scheduled
// ═══════════════════════════════════════════════════════════════════════
newsletterController.put(
    '/admin/:id',
    isAuth,
    rbac.checkPermission('newsletter', 'update'),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (!Number.isInteger(id)) {
                return res.status(400).json({ message: 'Invalid id.' });
            }

            const item = await newsletter.findByPk(id);
            if (!item) return res.status(404).json({ message: 'Newsletter not found.' });

            if (item.status !== 'draft' && item.status !== 'scheduled') {
                return res.status(400).json({
                    message: 'Only drafts or scheduled newsletters can be edited.',
                });
            }

            const { data, errors } = sanitizePayload(req.body, { partial: true });
            if (errors.length > 0) {
                return res.status(400).json({ message: 'Validation failed.', errors });
            }

            await item.update(data);
            res.status(200).json({ newsletter: item.toJSON() });
        } catch (err) {
            next(err);
        }
    }
);

// ═══════════════════════════════════════════════════════════════════════
// POST /newsletter/admin/:id/schedule — schedule draft to be sent later
// ═══════════════════════════════════════════════════════════════════════
newsletterController.post(
    '/admin/:id/schedule',
    isAuth,
    rbac.checkPermission('newsletter', 'update'),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (!Number.isInteger(id)) {
                return res.status(400).json({ message: 'Invalid id.' });
            }

            const item = await newsletter.findByPk(id);
            if (!item) return res.status(404).json({ message: 'Newsletter not found.' });

            if (item.status !== 'draft') {
                return res
                    .status(400)
                    .json({ message: 'Only drafts can be scheduled.' });
            }

            const { scheduledAt } = req.body || {};
            const when = scheduledAt ? new Date(scheduledAt) : null;
            if (!when || Number.isNaN(when.getTime())) {
                return res.status(400).json({ message: 'Invalid scheduledAt.' });
            }
            if (when.getTime() <= Date.now()) {
                return res
                    .status(400)
                    .json({ message: 'scheduledAt must be in the future.' });
            }
            if (!item.title || !item.body) {
                return res.status(400).json({
                    message: 'Title and body are required before scheduling.',
                });
            }

            await item.update({ status: 'scheduled', scheduledAt: when });
            res.status(200).json({ newsletter: item.toJSON() });
        } catch (err) {
            next(err);
        }
    }
);

// ═══════════════════════════════════════════════════════════════════════
// DELETE /newsletter/admin/:id
// ═══════════════════════════════════════════════════════════════════════
newsletterController.delete(
    '/admin/:id',
    isAuth,
    rbac.checkPermission('newsletter', 'delete'),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (!Number.isInteger(id)) {
                return res.status(400).json({ message: 'Invalid id.' });
            }

            const item = await newsletter.findByPk(id);
            if (!item) return res.status(404).json({ message: 'Newsletter not found.' });

            await item.destroy();
            res.status(200).json({ message: 'Newsletter deleted.' });
        } catch (err) {
            next(err);
        }
    }
);

// ═══════════════════════════════════════════════════════════════════════
// POST /newsletter/admin/:id/duplicate — clone as draft
// ═══════════════════════════════════════════════════════════════════════
newsletterController.post(
    '/admin/:id/duplicate',
    isAuth,
    rbac.checkPermission('newsletter', 'create'),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (!Number.isInteger(id)) {
                return res.status(400).json({ message: 'Invalid id.' });
            }

            const source = await newsletter.findByPk(id);
            if (!source) return res.status(404).json({ message: 'Newsletter not found.' });

            const clone = await newsletter.create({
                title: `${source.title} (copy)`,
                subject: source.subject,
                body: source.body,
                type: 'manual',
                status: 'draft',
                targetCategories: source.targetCategories,
                platformUpdates: source.platformUpdates,
                createdBy: req.user?.userId || source.createdBy,
            });

            res.status(201).json({ newsletter: clone.toJSON() });
        } catch (err) {
            next(err);
        }
    }
);

// ═══════════════════════════════════════════════════════════════════════
// POST /newsletter/admin/:id/cancel — cancel scheduled (revert to draft)
// ═══════════════════════════════════════════════════════════════════════
newsletterController.post(
    '/admin/:id/cancel',
    isAuth,
    rbac.checkPermission('newsletter', 'update'),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (!Number.isInteger(id)) {
                return res.status(400).json({ message: 'Invalid id.' });
            }

            const item = await newsletter.findByPk(id);
            if (!item) return res.status(404).json({ message: 'Newsletter not found.' });

            if (item.status !== 'scheduled') {
                return res
                    .status(400)
                    .json({ message: 'Only scheduled newsletters can be cancelled.' });
            }

            await item.update({ status: 'draft', scheduledAt: null });
            res.status(200).json({ newsletter: item.toJSON() });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = newsletterController;
