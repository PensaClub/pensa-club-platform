// server/src/controllers/crawlerController.js
//
// Admin-only HTTP surface for the bot crawler news monitor (Phase 1: RSS).
// Bots own keyword criteria + schedule; sources are RSS feeds attached to a
// bot; findings are matched articles waiting for an admin's editorial pass.

const crawlerController = require('express').Router();
const cron = require('node-cron');
const { Op } = require('sequelize');

const isAuth = require('../middlewares/isAuth');
const { checkPermission } = require('../middlewares/rbac');
const {
    crawler_bot,
    crawler_source,
    crawler_run,
    crawler_finding,
    user_account,
    article,
    sequelize,
} = require('../sequelize/models');
const {
    runBot,
    safeFetchBody,
    looksLikeFeed,
    discoverRssUrl,
} = require('../services/crawlerEngine');
const { parseRss } = require('../utils/rssParser');
const { extractItems, autoExtractItems } = require('../utils/htmlScraper');
const { evaluateRobots, OUR_AGENT } = require('../utils/robotsTxt');
const { safeFetchValidate } = require('../utils/networkSafety');

// ── Helpers ────────────────────────────────────────────────────────────────

const BOT_STATUSES = ['active', 'paused', 'archived'];
const FINDING_STATUSES = ['new', 'reviewed', 'dismissed', 'used'];
const SOURCE_TYPES = ['rss', 'html', 'auto'];
const MATCH_MODES = ['any', 'all'];
const HTML_SELECTOR_KEYS = ['item', 'title', 'link', 'image', 'description', 'published'];
const REQUIRED_SELECTOR_KEYS = ['item', 'title', 'link'];

// Sanitize and validate the htmlSelectors object; returns { errors, value }.
// Accepts only string values for known keys, rejects extra keys, requires
// item/title/link when the object is non-empty.
const sanitizeHtmlSelectors = (raw) => {
    if (raw === null) return { errors: [], value: null };
    if (typeof raw !== 'object' || Array.isArray(raw)) {
        return { errors: ['htmlSelectors must be an object'], value: null };
    }
    const out = {};
    const errors = [];
    for (const key of Object.keys(raw)) {
        if (!HTML_SELECTOR_KEYS.includes(key)) {
            errors.push(`htmlSelectors: unknown key "${key}"`);
            continue;
        }
        const v = raw[key];
        if (v === null || v === undefined || v === '') continue;
        if (typeof v !== 'string') {
            errors.push(`htmlSelectors.${key} must be a string`);
            continue;
        }
        out[key] = v.trim().slice(0, 300);
    }
    if (Object.keys(out).length > 0) {
        for (const req of REQUIRED_SELECTOR_KEYS) {
            if (!out[req]) errors.push(`htmlSelectors.${req} is required when htmlSelectors is set`);
        }
    } else if (Object.keys(raw).length > 0) {
        // Caller passed an object with no usable values.
        errors.push('htmlSelectors must include item, title, link');
    }
    return { errors, value: Object.keys(out).length ? out : null };
};

const parsePositiveInt = (raw, fallback) => {
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n) || n <= 0) return fallback;
    return n;
};

const parsePagination = (req, defaultLimit = 20, maxLimit = 100) => {
    const page = parsePositiveInt(req.query.page, 1);
    const limit = Math.min(parsePositiveInt(req.query.limit, defaultLimit), maxLimit);
    return { page, limit, offset: (page - 1) * limit };
};

const sanitizeCriteria = (raw) => {
    const out = { keywords: [], match: 'any', caseSensitive: false };
    if (!raw || typeof raw !== 'object') return out;

    if (Array.isArray(raw.keywords)) {
        out.keywords = raw.keywords
            .filter((k) => typeof k === 'string')
            .map((k) => k.trim())
            .filter(Boolean)
            .slice(0, 100);
    }
    if (MATCH_MODES.includes(raw.match)) out.match = raw.match;
    if (typeof raw.caseSensitive === 'boolean') out.caseSensitive = raw.caseSensitive;

    return out;
};

const validateBotPayload = (body, { partial = false } = {}) => {
    const errors = [];
    const out = {};

    if (body.name !== undefined) {
        if (typeof body.name !== 'string' || !body.name.trim()) {
            errors.push('name must be a non-empty string');
        } else {
            out.name = body.name.trim().slice(0, 120);
        }
    } else if (!partial) {
        errors.push('name is required');
    }

    if (body.description !== undefined) {
        out.description = typeof body.description === 'string' ? body.description : null;
    }

    if (body.status !== undefined) {
        if (!BOT_STATUSES.includes(body.status)) {
            errors.push(`status must be one of: ${BOT_STATUSES.join(', ')}`);
        } else {
            out.status = body.status;
        }
    }

    if (body.scheduleCron !== undefined) {
        if (typeof body.scheduleCron !== 'string' || !cron.validate(body.scheduleCron.trim())) {
            errors.push('scheduleCron must be a valid cron expression');
        } else {
            out.scheduleCron = body.scheduleCron.trim();
        }
    }

    if (body.criteria !== undefined) {
        out.criteria = sanitizeCriteria(body.criteria);
    }

    if (body.useLlm !== undefined) {
        out.useLlm = !!body.useLlm;
    }

    if (body.lookBackDays !== undefined) {
        if (body.lookBackDays === null || body.lookBackDays === '') {
            out.lookBackDays = null;
        } else {
            const n = parseInt(body.lookBackDays, 10);
            if (!Number.isFinite(n) || n < 1 || n > 3650) {
                errors.push({ field: 'lookBackDays', message: 'must be between 1 and 3650 days, or null for no limit' });
            } else {
                out.lookBackDays = n;
            }
        }
    }

    return { errors, data: out };
};

const validateSourcePayload = (body, { partial = false } = {}) => {
    const errors = [];
    const out = {};

    if (body.name !== undefined) {
        if (typeof body.name !== 'string' || !body.name.trim()) {
            errors.push('name must be a non-empty string');
        } else {
            out.name = body.name.trim().slice(0, 120);
        }
    } else if (!partial) {
        errors.push('name is required');
    }

    if (body.url !== undefined) {
        if (typeof body.url !== 'string' || !body.url.trim()) {
            errors.push('url must be a non-empty string');
        } else {
            try {
                const parsed = new URL(body.url.trim());
                if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                    errors.push('url must use http(s)');
                } else {
                    out.url = body.url.trim().slice(0, 500);
                }
            } catch (_) {
                errors.push('url is not a valid URL');
            }
        }
    } else if (!partial) {
        errors.push('url is required');
    }

    if (body.sourceType !== undefined) {
        if (!SOURCE_TYPES.includes(body.sourceType)) {
            errors.push(`sourceType must be one of: ${SOURCE_TYPES.join(', ')}`);
        } else {
            out.sourceType = body.sourceType;
        }
    } else if (!partial) {
        out.sourceType = 'rss';
    }

    if (body.rssUrl !== undefined) {
        out.rssUrl = body.rssUrl ? String(body.rssUrl).slice(0, 500) : null;
    }

    if (body.htmlSelectors !== undefined) {
        const { errors: selErrs, value } = sanitizeHtmlSelectors(body.htmlSelectors);
        if (selErrs.length) {
            errors.push(...selErrs);
        } else {
            out.htmlSelectors = value;
        }
    }

    if (body.active !== undefined) {
        out.active = !!body.active;
    }

    if (body.robotsCrawlDelay !== undefined) {
        const n = parseInt(body.robotsCrawlDelay, 10);
        if (Number.isFinite(n) && n >= 0 && n <= 600) out.robotsCrawlDelay = n;
        else errors.push('robotsCrawlDelay must be between 0 and 600 seconds');
    }

    if (body.maxPages !== undefined) {
        const n = parseInt(body.maxPages, 10);
        if (Number.isFinite(n) && n >= 1 && n <= 50) out.maxPages = n;
        else errors.push('maxPages must be between 1 and 50');
    }

    return { errors, data: out };
};

const serializeBot = (bot, extras = {}) => ({
    id: bot.id,
    name: bot.name,
    description: bot.description,
    status: bot.status,
    scheduleCron: bot.scheduleCron,
    criteria: bot.criteria,
    useLlm: bot.useLlm,
    lookBackDays: bot.lookBackDays,
    lastRunAt: bot.lastRunAt,
    lastRunStatus: bot.lastRunStatus,
    createdById: bot.createdById,
    creator: bot.creator
        ? {
            id: bot.creator.id,
            email: bot.creator.email,
        }
        : null,
    createdAt: bot.createdAt,
    updatedAt: bot.updatedAt,
    ...extras,
});

const serializeSource = (s) => ({
    id: s.id,
    botId: s.botId,
    name: s.name,
    url: s.url,
    sourceType: s.sourceType,
    rssUrl: s.rssUrl,
    htmlSelectors: s.htmlSelectors || null,
    robotsAllowed: s.robotsAllowed,
    robotsCrawlDelay: s.robotsCrawlDelay,
    validationStatus: s.validationStatus,
    validationMessage: s.validationMessage,
    lastValidatedAt: s.lastValidatedAt,
    etag: s.etag,
    lastModified: s.lastModified,
    active: s.active,
    maxPages: s.maxPages,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
});

const serializeRun = (r) => ({
    id: r.id,
    botId: r.botId,
    trigger: r.trigger,
    startedAt: r.startedAt,
    finishedAt: r.finishedAt,
    status: r.status,
    sourcesScanned: r.sourcesScanned,
    itemsSeen: r.itemsSeen,
    itemsNew: r.itemsNew,
    errorLog: r.errorLog,
});

const serializeFinding = (f) => ({
    id: f.id,
    botId: f.botId,
    sourceId: f.sourceId,
    runId: f.runId,
    externalUrl: f.externalUrl,
    urlHash: f.urlHash,
    title: f.title,
    description: f.description,
    imageUrl: f.imageUrl,
    topic: f.topic,
    publishedAt: f.publishedAt,
    relevanceScore: f.relevanceScore,
    foundAt: f.foundAt,
    status: f.status,
    usedInArticleId: f.usedInArticleId,
    source: f.source
        ? { id: f.source.id, name: f.source.name, url: f.source.url }
        : null,
    bot: f.bot
        ? { id: f.bot.id, name: f.bot.name }
        : null,
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
});

// ─────────────────────────────────────────────────────────────────────────
// SOURCE VALIDATION
// ─────────────────────────────────────────────────────────────────────────
//
// Probes a URL the way the crawler will hit it: (1) SSRF guard, (2) fetch
// body, (3) check robots.txt, (4) detect feed vs HTML, (5) sample-extract a
// few items. Returns a summary the admin UI can show before persisting the
// source. Reused for the async post-create validation that updates the
// source row in place.

const fetchRobots = async (urlString) => {
    let robotsUrl;
    try {
        const u = new URL(urlString);
        robotsUrl = `${u.protocol}//${u.host}/robots.txt`;
    } catch (_) {
        return { allowed: true, crawlDelay: 0, matchedAgent: null, fetched: false };
    }
    const result = await safeFetchBody(robotsUrl);
    if (result.error || !result.body) {
        // Missing robots.txt = implicit allow (per RFC 9309).
        return { allowed: true, crawlDelay: 0, matchedAgent: null, fetched: false };
    }
    const evaluated = evaluateRobots(result.body, urlString, OUR_AGENT);
    return { ...evaluated, fetched: true };
};

const performSourceValidation = async ({ url, sourceType = 'auto', htmlSelectors = null }) => {
    const validation = await safeFetchValidate(url);
    if (!validation.ok) {
        return {
            ok: false,
            code: validation.code,
            message: validation.message,
            status: validation.code === 'INVALID_URL' ? 400 : 502,
        };
    }

    const robots = await fetchRobots(url);
    const robotsWarnings = [];
    if (!robots.allowed) {
        robotsWarnings.push(`robots.txt disallows ${OUR_AGENT} for this path`);
    }
    if (robots.crawlDelay > 0) {
        robotsWarnings.push(`robots.txt requests crawl-delay=${robots.crawlDelay}s`);
    }

    const fetched = await safeFetchBody(url);
    if (fetched.error) {
        return {
            ok: false,
            code: fetched.error.code || 'FETCH_ERROR',
            message: fetched.error.message || 'Fetch failed',
            robots: { allowed: robots.allowed, crawlDelay: robots.crawlDelay, warnings: robotsWarnings },
            status: 502,
        };
    }
    const body = fetched.body || '';

    // Decide detected type and try to extract a few samples.
    let detectedType = sourceType;
    let resolvedFeedUrl = null;
    let suggestedSelectors = null;
    let samples = [];

    const tryFeed = sourceType === 'rss' || sourceType === 'auto';
    const tryHtml = sourceType === 'html' || sourceType === 'auto';

    let feedBody = null;
    if (tryFeed && looksLikeFeed(body)) {
        feedBody = body;
        detectedType = 'rss';
    } else if (tryFeed) {
        const discovered = await discoverRssUrl(url, body);
        if (discovered) {
            const probe = await safeFetchBody(discovered);
            if (probe.body && looksLikeFeed(probe.body)) {
                feedBody = probe.body;
                resolvedFeedUrl = discovered;
                detectedType = 'rss';
            }
        }
    }

    if (feedBody) {
        try {
            const parsed = parseRss(feedBody);
            samples = parsed.items.slice(0, 3).map((it) => ({
                title: it.title || null,
                link: it.link || null,
                image: it.image || null,
                description: it.description || null,
                publishedAt: it.pubDate || null,
            }));
            if (samples.length === 0) {
                return {
                    ok: false,
                    code: 'PARSER_ERROR',
                    message: 'Feed returned no parseable items',
                    detectedType: 'rss',
                    resolvedFeedUrl,
                    robots: { allowed: robots.allowed, crawlDelay: robots.crawlDelay, warnings: robotsWarnings },
                    status: 422,
                };
            }
        } catch (err) {
            return {
                ok: false,
                code: 'PARSER_ERROR',
                message: err?.message || 'Could not parse feed',
                detectedType: 'rss',
                resolvedFeedUrl,
                robots: { allowed: robots.allowed, crawlDelay: robots.crawlDelay, warnings: robotsWarnings },
                status: 422,
            };
        }
    } else if (tryHtml) {
        const useConfigured = htmlSelectors
            && typeof htmlSelectors === 'object'
            && htmlSelectors.item
            && htmlSelectors.title
            && htmlSelectors.link;
        const extracted = useConfigured
            ? extractItems(body, url, htmlSelectors)
            : autoExtractItems(body, url);

        if (!extracted.items.length) {
            return {
                ok: false,
                code: useConfigured ? 'PARSER_ERROR' : 'NO_RSS_FOUND',
                message: useConfigured
                    ? 'Configured selectors did not match any items'
                    : 'No RSS feed found and HTML auto-scrape produced no items',
                detectedType: 'html',
                robots: { allowed: robots.allowed, crawlDelay: robots.crawlDelay, warnings: robotsWarnings },
                status: 422,
            };
        }
        detectedType = 'html';
        samples = extracted.items.slice(0, 3).map((i) => ({
            title: i.title || null,
            link: i.link || null,
            image: i.image || null,
            description: i.description || null,
            publishedAt: i.publishedAt || null,
        }));
        suggestedSelectors = !useConfigured ? extracted.suggestedSelectors || null : null;
    } else {
        return {
            ok: false,
            code: 'NO_RSS_FOUND',
            message: 'URL did not return a feed and HTML scraping was not requested',
            robots: { allowed: robots.allowed, crawlDelay: robots.crawlDelay, warnings: robotsWarnings },
            status: 422,
        };
    }

    return {
        ok: true,
        url,
        resolvedFeedUrl,
        detectedType,
        robots: {
            allowed: robots.allowed,
            crawlDelay: robots.crawlDelay,
            warnings: robotsWarnings,
        },
        samples,
        selectors: suggestedSelectors,
    };
};

// Map a validation result to the persisted lifecycle fields on a source row.
const validationToSourceFields = (result) => {
    if (!result) {
        return {
            validationStatus: 'unknown',
            validationMessage: null,
            lastValidatedAt: new Date(),
        };
    }
    if (result.ok) {
        return {
            validationStatus: 'ok',
            validationMessage: result.detectedType
                ? `Validated as ${result.detectedType}`
                : 'Validated',
            lastValidatedAt: new Date(),
            ...(result.resolvedFeedUrl ? { rssUrl: result.resolvedFeedUrl } : {}),
            ...(result.detectedType ? { sourceType: result.detectedType } : {}),
            robotsAllowed: result.robots?.allowed !== false,
            robotsCrawlDelay: Math.min(Math.round(result.robots?.crawlDelay || 0), 600),
        };
    }
    let status = 'parser_error';
    if (result.code === 'NO_RSS_FOUND') status = 'no_rss';
    else if (result.code === 'BLOCKED_BY_ROBOTS') status = 'blocked_by_robots';
    else if (result.code && /(FETCH_ERROR|HTTP_|DNS_FAILED|BLOCKED_PRIVATE|BLOCKED_PROTOCOL|INVALID_URL|BODY_TOO_LARGE)/.test(result.code)) {
        status = 'unreachable';
    }
    return {
        validationStatus: status,
        validationMessage: result.message || result.code || 'Validation failed',
        lastValidatedAt: new Date(),
    };
};

// Fire-and-forget validator used after creating a source. Errors are
// swallowed (logged) so they never bubble to the HTTP response.
const validateSourceInBackground = (sourceId, payload) => {
    setImmediate(async () => {
        try {
            const result = await performSourceValidation(payload);
            const updates = validationToSourceFields(result);
            await crawler_source.update(updates, { where: { id: sourceId } });
        } catch (err) {
            console.error('[crawler] background validation failed for source', sourceId, err);
            try {
                await crawler_source.update(
                    {
                        validationStatus: 'unreachable',
                        validationMessage: err?.message || 'Background validation crashed',
                        lastValidatedAt: new Date(),
                    },
                    { where: { id: sourceId } },
                );
            } catch (_) { /* give up */ }
        }
    });
};

// ─────────────────────────────────────────────────────────────────────────
// BOTS
// ─────────────────────────────────────────────────────────────────────────

crawlerController.get(
    '/bots',
    isAuth,
    checkPermission('crawler', 'read'),
    async (req, res, next) => {
        try {
            const { page, limit, offset } = parsePagination(req);
            const where = {};
            if (req.query.status) {
                if (!BOT_STATUSES.includes(req.query.status)) {
                    return res.status(400).json({ message: 'Invalid status filter', code: 'BAD_FILTER' });
                }
                where.status = req.query.status;
            }
            const { rows, count } = await crawler_bot.findAndCountAll({
                where,
                include: [{ model: user_account, as: 'creator', attributes: ['id', 'email'] }],
                order: [['updatedAt', 'DESC']],
                limit,
                offset,
            });

            const botIds = rows.map((b) => b.id);
            const sourcesAgg = botIds.length
                ? await crawler_source.findAll({
                    attributes: ['botId', [sequelize.fn('COUNT', sequelize.col('id')), 'cnt']],
                    where: { botId: { [Op.in]: botIds } },
                    group: ['botId'],
                    raw: true,
                })
                : [];
            const findingsTotalAgg = botIds.length
                ? await crawler_finding.findAll({
                    attributes: ['botId', [sequelize.fn('COUNT', sequelize.col('id')), 'cnt']],
                    where: { botId: { [Op.in]: botIds } },
                    group: ['botId'],
                    raw: true,
                })
                : [];
            const findingsNewAgg = botIds.length
                ? await crawler_finding.findAll({
                    attributes: ['botId', [sequelize.fn('COUNT', sequelize.col('id')), 'cnt']],
                    where: { botId: { [Op.in]: botIds }, status: 'new' },
                    group: ['botId'],
                    raw: true,
                })
                : [];

            const toMap = (agg) => {
                const m = new Map();
                for (const r of agg) m.set(Number(r.botId), Number(r.cnt));
                return m;
            };
            const sourcesMap = toMap(sourcesAgg);
            const findingsTotalMap = toMap(findingsTotalAgg);
            const findingsNewMap = toMap(findingsNewAgg);

            res.json({
                items: rows.map((b) => serializeBot(b, {
                    sourcesCount: sourcesMap.get(b.id) || 0,
                    findingsTotal: findingsTotalMap.get(b.id) || 0,
                    findingsNew: findingsNewMap.get(b.id) || 0,
                })),
                pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
            });
        } catch (err) { next(err); }
    },
);

crawlerController.get(
    '/bots/:id',
    isAuth,
    checkPermission('crawler', 'read'),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id', code: 'BAD_ID' });

            const bot = await crawler_bot.findByPk(id, {
                include: [{ model: user_account, as: 'creator', attributes: ['id', 'email'] }],
            });
            if (!bot) return res.status(404).json({ message: 'Bot not found', code: 'NOT_FOUND' });

            const sourcesCount = await crawler_source.count({ where: { botId: id } });
            const findingsTotal = await crawler_finding.count({ where: { botId: id } });
            const findingsNew = await crawler_finding.count({ where: { botId: id, status: 'new' } });

            res.json({
                item: serializeBot(bot, { sourcesCount, findingsTotal, findingsNew }),
            });
        } catch (err) { next(err); }
    },
);

crawlerController.post(
    '/bots',
    isAuth,
    checkPermission('crawler', 'create'),
    async (req, res, next) => {
        try {
            const { errors, data } = validateBotPayload(req.body || {});
            if (errors.length) {
                return res.status(400).json({ message: 'Invalid payload', code: 'VALIDATION', errors });
            }
            const bot = await crawler_bot.create({
                ...data,
                createdById: req.user?.userId || null,
            });
            res.status(201).json({ item: serializeBot(bot) });
        } catch (err) { next(err); }
    },
);

crawlerController.put(
    '/bots/:id',
    isAuth,
    checkPermission('crawler', 'update'),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id', code: 'BAD_ID' });
            const bot = await crawler_bot.findByPk(id);
            if (!bot) return res.status(404).json({ message: 'Bot not found', code: 'NOT_FOUND' });

            const { errors, data } = validateBotPayload(req.body || {}, { partial: true });
            if (errors.length) {
                return res.status(400).json({ message: 'Invalid payload', code: 'VALIDATION', errors });
            }
            await bot.update(data);
            res.json({ item: serializeBot(bot) });
        } catch (err) { next(err); }
    },
);

crawlerController.delete(
    '/bots/:id',
    isAuth,
    checkPermission('crawler', 'delete'),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id', code: 'BAD_ID' });
            const bot = await crawler_bot.findByPk(id);
            if (!bot) return res.status(404).json({ message: 'Bot not found', code: 'NOT_FOUND' });
            await bot.destroy();
            res.json({ ok: true });
        } catch (err) { next(err); }
    },
);

crawlerController.post(
    '/bots/:id/run-now',
    isAuth,
    checkPermission('crawler', 'run'),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id', code: 'BAD_ID' });
            const bot = await crawler_bot.findByPk(id);
            if (!bot) return res.status(404).json({ message: 'Bot not found', code: 'NOT_FOUND' });

            const result = await runBot(id, { trigger: 'manual' });
            const run = await crawler_run.findByPk(result.runId);
            res.json({ run: run ? serializeRun(run) : null, summary: result });
        } catch (err) { next(err); }
    },
);

// Wipe all findings for a bot. Useful when the admin tweaks keywords and
// wants the next run to re-evaluate every item from the feeds (otherwise
// dedupe by urlHash skips items the bot has already seen, even if the new
// criteria would now match them).
crawlerController.post(
    '/bots/:id/clear-findings',
    isAuth,
    checkPermission('crawler', 'delete'),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id', code: 'BAD_ID' });
            const bot = await crawler_bot.findByPk(id);
            if (!bot) return res.status(404).json({ message: 'Bot not found', code: 'NOT_FOUND' });

            const deleted = await crawler_finding.destroy({ where: { botId: id } });
            // Also clear ETag/Last-Modified on sources so the next fetch is
            // guaranteed to return fresh bodies (some servers reply 304 if
            // we send our previously-stored conditional headers).
            await crawler_source.update(
                { etag: null, lastModified: null },
                { where: { botId: id } }
            );
            res.json({ success: true, deleted });
        } catch (err) { next(err); }
    },
);

// ─────────────────────────────────────────────────────────────────────────
// SOURCES
// ─────────────────────────────────────────────────────────────────────────

// Standalone validation: lets the admin UI verify a URL (and optional
// selectors) before persisting a source. Does NOT touch the database.
crawlerController.post(
    '/sources/validate',
    isAuth,
    checkPermission('crawler', 'create'),
    async (req, res, next) => {
        try {
            const body = req.body || {};
            const url = typeof body.url === 'string' ? body.url.trim() : '';
            if (!url) {
                return res.status(400).json({
                    ok: false,
                    code: 'VALIDATION',
                    message: 'url is required',
                });
            }

            const sourceType = body.sourceType && SOURCE_TYPES.includes(body.sourceType)
                ? body.sourceType
                : 'auto';

            let htmlSelectors = null;
            if (body.htmlSelectors !== undefined && body.htmlSelectors !== null) {
                const { errors: selErrs, value } = sanitizeHtmlSelectors(body.htmlSelectors);
                if (selErrs.length) {
                    return res.status(400).json({
                        ok: false,
                        code: 'VALIDATION',
                        message: selErrs.join('; '),
                    });
                }
                htmlSelectors = value;
            }

            const result = await performSourceValidation({ url, sourceType, htmlSelectors });
            const status = result.ok ? 200 : (result.status || 422);
            // Strip internal `status` field from the response payload.
            const { status: _omit, ...payload } = result;
            res.status(status).json(payload);
        } catch (err) { next(err); }
    },
);

// Re-validate an existing source on demand and persist the lifecycle
// fields. Returns the updated row plus the full validation summary.
crawlerController.post(
    '/sources/:id/validate',
    isAuth,
    checkPermission('crawler', 'update'),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id', code: 'BAD_ID' });
            const source = await crawler_source.findByPk(id);
            if (!source) return res.status(404).json({ message: 'Source not found', code: 'NOT_FOUND' });

            const result = await performSourceValidation({
                url: source.url,
                sourceType: source.sourceType || 'auto',
                htmlSelectors: source.htmlSelectors || null,
            });
            const updates = validationToSourceFields(result);
            await source.update(updates);

            const { status: _omit, ...payload } = result;
            res.json({ item: serializeSource(source), validation: payload });
        } catch (err) { next(err); }
    },
);

crawlerController.get(
    '/bots/:botId/sources',
    isAuth,
    checkPermission('crawler', 'read'),
    async (req, res, next) => {
        try {
            const botId = parseInt(req.params.botId, 10);
            if (!Number.isFinite(botId)) return res.status(400).json({ message: 'Invalid botId', code: 'BAD_ID' });
            const items = await crawler_source.findAll({
                where: { botId },
                order: [['id', 'ASC']],
            });
            res.json({ items: items.map(serializeSource) });
        } catch (err) { next(err); }
    },
);

crawlerController.post(
    '/bots/:botId/sources',
    isAuth,
    checkPermission('crawler', 'create'),
    async (req, res, next) => {
        try {
            const botId = parseInt(req.params.botId, 10);
            if (!Number.isFinite(botId)) return res.status(400).json({ message: 'Invalid botId', code: 'BAD_ID' });
            const bot = await crawler_bot.findByPk(botId);
            if (!bot) return res.status(404).json({ message: 'Bot not found', code: 'NOT_FOUND' });

            const { errors, data } = validateSourcePayload(req.body || {});
            if (errors.length) {
                return res.status(400).json({ message: 'Invalid payload', code: 'VALIDATION', errors });
            }
            // For Phase 1 RSS, mirror url -> rssUrl when not explicitly given.
            if (data.sourceType === 'rss' && !data.rssUrl) data.rssUrl = data.url;

            const source = await crawler_source.create({ ...data, botId });

            // Kick off background validation; the response returns the
            // freshly created source immediately so the admin UI can keep
            // moving. A subsequent refetch will surface validationStatus.
            validateSourceInBackground(source.id, {
                url: source.url,
                sourceType: source.sourceType || 'auto',
                htmlSelectors: source.htmlSelectors || null,
            });

            res.status(201).json({ item: serializeSource(source) });
        } catch (err) { next(err); }
    },
);

crawlerController.put(
    '/sources/:id',
    isAuth,
    checkPermission('crawler', 'update'),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id', code: 'BAD_ID' });
            const source = await crawler_source.findByPk(id);
            if (!source) return res.status(404).json({ message: 'Source not found', code: 'NOT_FOUND' });

            const { errors, data } = validateSourcePayload(req.body || {}, { partial: true });
            if (errors.length) {
                return res.status(400).json({ message: 'Invalid payload', code: 'VALIDATION', errors });
            }
            await source.update(data);
            res.json({ item: serializeSource(source) });
        } catch (err) { next(err); }
    },
);

crawlerController.delete(
    '/sources/:id',
    isAuth,
    checkPermission('crawler', 'delete'),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id', code: 'BAD_ID' });
            const source = await crawler_source.findByPk(id);
            if (!source) return res.status(404).json({ message: 'Source not found', code: 'NOT_FOUND' });
            await source.destroy();
            res.json({ ok: true });
        } catch (err) { next(err); }
    },
);

// ─────────────────────────────────────────────────────────────────────────
// FINDINGS
// ─────────────────────────────────────────────────────────────────────────

crawlerController.get(
    '/findings',
    isAuth,
    checkPermission('crawler', 'read'),
    async (req, res, next) => {
        try {
            const { page, limit, offset } = parsePagination(req, 20, 100);
            const where = {};

            if (req.query.botId) {
                const botId = parseInt(req.query.botId, 10);
                if (!Number.isFinite(botId)) {
                    return res.status(400).json({ message: 'Invalid botId', code: 'BAD_FILTER' });
                }
                where.botId = botId;
            }

            if (req.query.status) {
                if (!FINDING_STATUSES.includes(req.query.status)) {
                    return res.status(400).json({ message: 'Invalid status filter', code: 'BAD_FILTER' });
                }
                where.status = req.query.status;
            }

            if (req.query.search && typeof req.query.search === 'string') {
                const term = req.query.search.trim();
                if (term) {
                    where[Op.or] = [
                        { title: { [Op.iLike]: `%${term}%` } },
                        { description: { [Op.iLike]: `%${term}%` } },
                    ];
                }
            }

            const { rows, count } = await crawler_finding.findAndCountAll({
                where,
                include: [
                    { model: crawler_source, as: 'source', attributes: ['id', 'name', 'url'] },
                    { model: crawler_bot, as: 'bot', attributes: ['id', 'name'] },
                ],
                order: [['foundAt', 'DESC']],
                limit,
                offset,
            });

            res.json({
                items: rows.map(serializeFinding),
                pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
            });
        } catch (err) { next(err); }
    },
);

crawlerController.put(
    '/findings/:id/status',
    isAuth,
    checkPermission('crawler', 'update'),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id', code: 'BAD_ID' });
            const finding = await crawler_finding.findByPk(id);
            if (!finding) return res.status(404).json({ message: 'Finding not found', code: 'NOT_FOUND' });

            const status = req.body?.status;
            if (!FINDING_STATUSES.includes(status)) {
                return res.status(400).json({
                    message: `status must be one of: ${FINDING_STATUSES.join(', ')}`,
                    code: 'VALIDATION',
                });
            }

            const updates = { status };
            if (status === 'used') {
                if (req.body?.usedInArticleId !== undefined && req.body.usedInArticleId !== null) {
                    const aid = parseInt(req.body.usedInArticleId, 10);
                    if (!Number.isFinite(aid)) {
                        return res.status(400).json({ message: 'Invalid usedInArticleId', code: 'VALIDATION' });
                    }
                    const exists = await article.findByPk(aid, { attributes: ['id'] });
                    if (!exists) {
                        return res.status(400).json({ message: 'Referenced article not found', code: 'VALIDATION' });
                    }
                    updates.usedInArticleId = aid;
                }
            } else if (status !== 'used' && finding.usedInArticleId) {
                // Demoting away from "used" -> drop the link to keep the
                // editorial trail consistent with the new state.
                updates.usedInArticleId = null;
            }

            await finding.update(updates);
            res.json({ item: serializeFinding(finding) });
        } catch (err) { next(err); }
    },
);

// ─────────────────────────────────────────────────────────────────────────
// RUNS
// ─────────────────────────────────────────────────────────────────────────

crawlerController.get(
    '/bots/:botId/runs',
    isAuth,
    checkPermission('crawler', 'read'),
    async (req, res, next) => {
        try {
            const botId = parseInt(req.params.botId, 10);
            if (!Number.isFinite(botId)) return res.status(400).json({ message: 'Invalid botId', code: 'BAD_ID' });
            const limit = Math.min(parsePositiveInt(req.query.limit, 20), 100);
            const items = await crawler_run.findAll({
                where: { botId },
                order: [['startedAt', 'DESC']],
                limit,
            });
            res.json({ items: items.map(serializeRun) });
        } catch (err) { next(err); }
    },
);

module.exports = crawlerController;
