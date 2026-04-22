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
const {
    wrapNewsletter,
    beautifyBodyHtml,
    wrapDigestBody,
    monthlyReport,
    formatMonthLabel,
} = require('../utils/newsletterTemplates');
const monthlyAggregator = require('../utils/monthlyReportAggregator');
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

// Fallback placeholder per type — used only when no thumbnail/image exists.
const DEFAULT_THUMBNAILS = {
    seminars: `${PUBLIC_BASE_URL}/images/homePage/logo-2.png`,
    courses: `${PUBLIC_BASE_URL}/images/homePage/logo-2.png`,
    articles: `${PUBLIC_BASE_URL}/images/homePage/logo-2.png`,
    initiatives: `${PUBLIC_BASE_URL}/images/homePage/logo-2.png`,
    projects: `${PUBLIC_BASE_URL}/images/homePage/logo-2.png`,
    publications: `${PUBLIC_BASE_URL}/images/homePage/logo-2.png`,
};
const resolveThumb = (primary, type) => {
    const abs = absolutizeUrl(primary);
    if (abs) return abs;
    return DEFAULT_THUMBNAILS[type] || null;
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
// GET /newsletter/click/:newsletterId/:subscriberId?to=<encoded-url>
// Logs a click + 302-redirects. Host-whitelisted to pensa.club (+ locals).
// ═══════════════════════════════════════════════════════════════════════
const PUBLIC_HOST = (() => {
    try {
        return new URL(PUBLIC_BASE_URL).host;
    } catch {
        return 'pensa.club';
    }
})();
const ALLOWED_REDIRECT_HOSTS = new Set([
    PUBLIC_HOST,
    'pensa.club',
    'www.pensa.club',
    'localhost:3000',
    'localhost:8080',
]);

const isAllowedRedirect = (rawUrl) => {
    if (!rawUrl) return false;
    try {
        const parsed = new URL(rawUrl);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
        return ALLOWED_REDIRECT_HOSTS.has(parsed.host);
    } catch {
        return false;
    }
};

newsletterController.get('/click/:newsletterId/:subscriberId', async (req, res) => {
    const newsletterId = parseInt(req.params.newsletterId, 10);
    const subscriberId = parseInt(req.params.subscriberId, 10);
    const to = String(req.query.to || '');

    if (!isAllowedRedirect(to)) {
        return res.status(400).send('Invalid redirect target.');
    }

    if (Number.isInteger(newsletterId) && Number.isInteger(subscriberId)) {
        try {
            await newsletter_log.create({
                newsletterId,
                subscriberId,
                channel: 'email',
                status: 'clicked',
                targetUrl: to.substring(0, 2000),
                sentAt: new Date(),
            });
        } catch {
            // Never block the redirect — tracking is best-effort.
        }
    }

    return res.redirect(302, to);
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

            const { fn, col, literal } = require('sequelize');

            const [sentLogs, openedLogs, failedLogs, clickedLogs, uniqueClickerRows, topLinkRows] =
                await Promise.all([
                    newsletter_log.count({ where: { newsletterId: id, status: 'sent' } }),
                    newsletter_log.count({ where: { newsletterId: id, status: 'opened' } }),
                    newsletter_log.count({ where: { newsletterId: id, status: 'failed' } }),
                    newsletter_log.count({ where: { newsletterId: id, status: 'clicked' } }),
                    newsletter_log.findAll({
                        where: { newsletterId: id, status: 'clicked' },
                        attributes: [
                            [fn('COUNT', literal('DISTINCT subscriber_id')), 'uniqueClickers'],
                        ],
                        raw: true,
                    }),
                    newsletter_log.findAll({
                        where: { newsletterId: id, status: 'clicked' },
                        attributes: [
                            'targetUrl',
                            [fn('COUNT', col('id')), 'clicks'],
                        ],
                        group: ['target_url'],
                        order: [[literal('clicks'), 'DESC']],
                        limit: 5,
                        raw: true,
                    }),
                ]);

            const sentCount = item.sentCount || sentLogs;
            const openRate = sentCount > 0 ? Math.round((openedLogs / sentCount) * 100) : 0;
            const clickRate = sentCount > 0 ? Math.round((clickedLogs / sentCount) * 100) : 0;
            const uniqueClickers = Number(uniqueClickerRows?.[0]?.uniqueClickers) || 0;

            const topLinks = (topLinkRows || [])
                .map((r) => ({
                    targetUrl: r.targetUrl || '',
                    clicks: Number(r.clicks) || 0,
                }))
                .filter((r) => r.targetUrl);

            res.status(200).json({
                newsletterId: id,
                status: item.status,
                sentCount,
                failedCount: item.failedCount || failedLogs,
                openedCount: openedLogs,
                openRate,
                clickedCount: clickedLogs,
                clickRate,
                uniqueClickers,
                topLinks,
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
// QUEUE MANAGEMENT — admins can remove auto-enqueued items or add manual ones.
// `status` distinguishes the target batch:
//   'pending'         → daily event batch (09:00 Sofia)
//   'weekly_pending'  → weekly digest (Monday 10:00 Sofia)
// ═══════════════════════════════════════════════════════════════════════
const QUEUE_CATEGORIES = ['seminars', 'courses', 'articles', 'initiatives', 'clubs', 'games', 'platform'];

// GET /newsletter/admin/queue?status=pending|weekly_pending
newsletterController.get(
    '/admin/queue',
    isAuth,
    rbac.checkPermission('newsletter', 'read'),
    async (req, res, next) => {
        try {
            const { notification_queue } = require('../sequelize/models/index');
            const status = req.query.status === 'weekly_pending' ? 'weekly_pending' : 'pending';
            const rows = await notification_queue.findAll({
                where: { status },
                order: [['createdAt', 'ASC']],
            });
            res.status(200).json({ items: rows, status });
        } catch (err) {
            next(err);
        }
    },
);

// POST /newsletter/admin/queue — body: { status, category, type='custom', title, description?, url?, thumbnail? }
newsletterController.post(
    '/admin/queue',
    isAuth,
    rbac.checkPermission('newsletter', 'create'),
    async (req, res, next) => {
        try {
            const { notification_queue } = require('../sequelize/models/index');
            const status =
                req.body?.status === 'weekly_pending' ? 'weekly_pending' : 'pending';
            const category =
                QUEUE_CATEGORIES.includes(req.body?.category) ? req.body.category : 'platform';
            const title = String(req.body?.title || '').trim();
            if (!title) {
                return res.status(400).json({ message: 'Title is required.' });
            }
            const description = req.body?.description
                ? String(req.body.description).trim()
                : null;
            const url = req.body?.url ? String(req.body.url).trim().slice(0, 500) : null;
            const thumbnail = req.body?.thumbnail
                ? String(req.body.thumbnail).trim().slice(0, 2048)
                : null;

            const row = await notification_queue.create({
                type: 'custom',
                referenceId: null,
                referenceTitle: title.slice(0, 500),
                referenceSlug: url,
                description,
                category,
                thumbnail,
                status,
            });
            res.status(201).json({ item: row });
        } catch (err) {
            next(err);
        }
    },
);

// DELETE /newsletter/admin/queue/:id
newsletterController.delete(
    '/admin/queue/:id',
    isAuth,
    rbac.checkPermission('newsletter', 'delete'),
    async (req, res, next) => {
        try {
            const { notification_queue } = require('../sequelize/models/index');
            const id = parseInt(req.params.id, 10);
            if (!Number.isInteger(id)) {
                return res.status(400).json({ message: 'Invalid id.' });
            }
            const row = await notification_queue.findByPk(id);
            if (!row) return res.status(404).json({ message: 'Queue item not found.' });
            if (row.status !== 'pending' && row.status !== 'weekly_pending') {
                return res
                    .status(400)
                    .json({ message: 'Only pending items can be removed.' });
            }
            await row.destroy();
            res.status(200).json({ message: 'Item removed.' });
        } catch (err) {
            next(err);
        }
    },
);

// ═══════════════════════════════════════════════════════════════════════
// GET /newsletter/admin/monthly-preview?month=YYYY-MM&limit=N
// Returns aggregated stats + rendered HTML for the monthly report.
// Defaults: previous month, limit 3.
// ═══════════════════════════════════════════════════════════════════════
const parseMonthParam = (raw) => {
    if (!raw) return null;
    const match = /^(\d{4})-(\d{1,2})$/.exec(String(raw).trim());
    if (!match) return null;
    const y = Number(match[1]);
    const m = Number(match[2]);
    if (m < 1 || m > 12) return null;
    return new Date(y, m - 1, 1, 0, 0, 0, 0);
};

const buildMonthlyReportData = async ({ monthDate, limit }) => {
    const from = monthDate;
    const to = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
    const nextRange = {
        from: to,
        to: new Date(monthDate.getFullYear(), monthDate.getMonth() + 2, 1),
    };
    const topLimit = Math.max(1, Math.min(Number(limit) || 3, 10));

    const [stats, topSeminars, topArticles, topCourses, upcoming] = await Promise.all([
        monthlyAggregator.getMonthlyStats(from, to),
        monthlyAggregator.getTopSeminarsByAttendance(from, to, topLimit),
        monthlyAggregator.getTopArticlesByViews(from, to, topLimit),
        monthlyAggregator.getTopCoursesByViews(from, to, topLimit),
        monthlyAggregator.getUpcomingNextMonth(nextRange.from, nextRange.to),
    ]);

    return {
        from,
        to,
        monthLabel: formatMonthLabel(from),
        stats,
        topSeminars,
        topArticles,
        topCourses,
        upcoming,
    };
};

newsletterController.get(
    '/admin/monthly-preview',
    isAuth,
    rbac.checkPermission('newsletter', 'read'),
    async (req, res, next) => {
        try {
            const monthDate =
                parseMonthParam(req.query.month) ||
                monthlyAggregator.getPreviousMonthRange().from;
            const limit = Number(req.query.limit) || 3;

            const data = await buildMonthlyReportData({ monthDate, limit });
            const recipientCount = await countRecipients(['platform']);

            const html = monthlyReport({
                subscriberName: '',
                monthLabel: data.monthLabel,
                stats: data.stats,
                topSeminars: data.topSeminars,
                topArticles: data.topArticles,
                topCourses: data.topCourses,
                upcoming: data.upcoming,
                platformUpdatesHtml: '',
                unsubscribeToken: null,
            });

            res.status(200).json({
                monthLabel: data.monthLabel,
                from: data.from,
                to: data.to,
                stats: data.stats,
                topSeminars: data.topSeminars,
                topArticles: data.topArticles,
                topCourses: data.topCourses,
                upcoming: data.upcoming,
                recipientCount,
                html,
            });
        } catch (err) {
            next(err);
        }
    },
);

// ═══════════════════════════════════════════════════════════════════════
// POST /newsletter/admin/monthly-run-now  Body: { month?: "YYYY-MM", limit?, platformUpdatesHtml? }
// Persists a newsletter row (type=monthly) and fires sendNewsletterToAll
// to subscribers with the 'platform' category enabled. Fire-and-forget.
// ═══════════════════════════════════════════════════════════════════════
newsletterController.post(
    '/admin/monthly-run-now',
    isAuth,
    rbac.checkPermission('newsletter', 'send'),
    async (req, res, next) => {
        try {
            const monthDate =
                parseMonthParam(req.body?.month) ||
                monthlyAggregator.getPreviousMonthRange().from;
            const limit = Number(req.body?.limit) || 3;
            const platformUpdatesHtml = String(req.body?.platformUpdatesHtml || '').trim();

            const data = await buildMonthlyReportData({ monthDate, limit });

            const title = `📊 Месечно от Pensa Club — ${data.monthLabel}`;
            const renderedBody = monthlyReport({
                subscriberName: '',
                monthLabel: data.monthLabel,
                stats: data.stats,
                topSeminars: data.topSeminars,
                topArticles: data.topArticles,
                topCourses: data.topCourses,
                upcoming: data.upcoming,
                platformUpdatesHtml,
                unsubscribeToken: null,
            });

            const record = await newsletter.create({
                title,
                subject: title,
                body: renderedBody,
                type: 'monthly',
                status: 'sending',
                targetCategories: ['platform'],
                createdBy: req.user?.userId || null,
                platformUpdates: platformUpdatesHtml || null,
            });

            sendNewsletterToAll({
                models: require('../sequelize/models/index'),
                item: record,
                renderPerSubscriber: ({ subscriberName, unsubscribeToken }) =>
                    monthlyReport({
                        subscriberName,
                        monthLabel: data.monthLabel,
                        stats: data.stats,
                        topSeminars: data.topSeminars,
                        topArticles: data.topArticles,
                        topCourses: data.topCourses,
                        upcoming: data.upcoming,
                        platformUpdatesHtml,
                        unsubscribeToken,
                    }),
            })
                .then((r) => {
                    console.log(
                        `[monthly/manual] newsletter=${record.id} sent=${r.sent} failed=${r.failed}`,
                    );
                })
                .catch((err) => {
                    console.error('[monthly/manual] error:', err?.message || err);
                });

            res.status(202).json({
                message: 'Monthly report dispatch started.',
                newsletterId: record.id,
                monthLabel: data.monthLabel,
            });
        } catch (err) {
            next(err);
        }
    },
);

// ═══════════════════════════════════════════════════════════════════════
// GET /newsletter/admin/event-preview — pending queue + preview HTML of
// what the next reactive batch email would look like
// ═══════════════════════════════════════════════════════════════════════
newsletterController.get(
    '/admin/event-preview',
    isAuth,
    rbac.checkPermission('newsletter', 'read'),
    async (req, res, next) => {
        try {
            const { buildBatchPreview } = require('../utils/eventBatchSender');
            const preview = await buildBatchPreview({ subscriberName: '' });
            res.status(200).json(preview);
        } catch (err) {
            next(err);
        }
    },
);

// ═══════════════════════════════════════════════════════════════════════
// POST /newsletter/admin/event-run-now — manually trigger the batch
// (fire-and-forget, admin testing)
// ═══════════════════════════════════════════════════════════════════════
newsletterController.post(
    '/admin/event-run-now',
    isAuth,
    rbac.checkPermission('newsletter', 'send'),
    async (req, res, next) => {
        try {
            const { processEventBatch } = require('../utils/eventBatchSender');
            processEventBatch()
                .then((r) => {
                    console.log(
                        `[event-batch/manual] processed=${r.processed} sent=${r.sent} failed=${r.failed}`,
                    );
                })
                .catch((err) => {
                    console.error('[event-batch/manual] error:', err?.message || err);
                });
            res.status(202).json({ message: 'Batch triggered.' });
        } catch (err) {
            next(err);
        }
    },
);

// ═══════════════════════════════════════════════════════════════════════
// POST /newsletter/admin/personal/:subscriberId — quick one-off email to a
// single subscriber (no draft is created in DB). Body: { title, body }.
// ═══════════════════════════════════════════════════════════════════════
newsletterController.post(
    '/admin/personal/:subscriberId',
    isAuth,
    rbac.checkPermission('newsletter', 'send'),
    async (req, res, next) => {
        try {
            const subscriberId = parseInt(req.params.subscriberId, 10);
            if (!Number.isInteger(subscriberId)) {
                return res.status(400).json({ message: 'Invalid subscriber id.' });
            }

            const sub = await subscriber.findByPk(subscriberId);
            if (!sub) return res.status(404).json({ message: 'Subscriber not found.' });
            if (sub.status !== 'active') {
                return res.status(400).json({
                    message: 'Subscriber is not active and cannot receive emails.',
                });
            }

            const title = String(req.body?.title || '').trim();
            const body = String(req.body?.body || '').trim();
            if (!title || !body) {
                return res.status(400).json({ message: 'Title and body are required.' });
            }

            const html = renderNewsletterHtml({
                title,
                body,
                platformUpdates: '',
                subscriberName: sub.name || '',
            });

            try {
                await sendNewsletterEmail({ to: sub.email, subject: title, html });
                return res.status(200).json({
                    message: 'Personal email sent.',
                    to: sub.email,
                });
            } catch (sendErr) {
                return res.status(502).json({
                    message: 'Email provider rejected the message.',
                    error: sendErr?.message || String(sendErr),
                });
            }
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
                    thumbnail: resolveThumb(r.thumbnailUrl, 'seminars'),
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
                    thumbnail: resolveThumb(r.thumbnailUrl, 'courses'),
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
                    const thumb =
                        (Array.isArray(img.sources) ? img.sources[0] : null) ||
                        img.thumbnail ||
                        null;
                    return {
                        id: r.id,
                        type: 'articles',
                        title: r.title,
                        description: r.shortDescription || r.description?.substring(0, 180) || '',
                        thumbnail: resolveThumb(thumb, 'articles'),
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
                            attributes: ['src', 'thumbnailUrl'],
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
                    thumbnail: resolveThumb(
                        r.mainImage?.src || r.mainImage?.thumbnailUrl,
                        'initiatives',
                    ),
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
                            attributes: ['src', 'thumbnailUrl'],
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
                    thumbnail: resolveThumb(
                        r.mainImage?.src || r.mainImage?.thumbnailUrl,
                        'projects',
                    ),
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
                            attributes: ['src', 'thumbnailUrl'],
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
                    thumbnail: resolveThumb(
                        r.image?.src || r.image?.thumbnailUrl,
                        'publications',
                    ),
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
// GET /newsletter/admin/stats/overview?from=&to=
// Returns aggregated open/click rates per newsletter type + open-rate
// time series (per-week buckets) across the requested range.
// ═══════════════════════════════════════════════════════════════════════
newsletterController.get(
    '/admin/stats/overview',
    isAuth,
    rbac.checkPermission('newsletter', 'read'),
    async (req, res, next) => {
        try {
            const { fn, col, literal } = require('sequelize');

            const fromRaw = req.query.from;
            const toRaw = req.query.to;
            const from = fromRaw ? new Date(fromRaw) : (() => {
                const d = new Date();
                d.setDate(d.getDate() - 90);
                return d;
            })();
            const to = toRaw ? new Date(toRaw) : new Date();

            // Per-type breakdown
            const typeRows = await newsletter.findAll({
                where: { sentAt: { [Op.between]: [from, to] }, status: 'sent' },
                attributes: [
                    'type',
                    [fn('SUM', col('sent_count')), 'sentCount'],
                    [fn('COUNT', col('id')), 'newsletters'],
                ],
                group: ['type'],
                raw: true,
            });

            const sentNewsletterIds = await newsletter.findAll({
                where: { sentAt: { [Op.between]: [from, to] }, status: 'sent' },
                attributes: ['id', 'type'],
                raw: true,
            });

            const idsByType = sentNewsletterIds.reduce((acc, n) => {
                (acc[n.type] = acc[n.type] || []).push(n.id);
                return acc;
            }, {});

            const breakdown = await Promise.all(
                Object.entries(idsByType).map(async ([type, ids]) => {
                    const [opened, clicked] = await Promise.all([
                        newsletter_log.count({
                            where: { newsletterId: { [Op.in]: ids }, status: 'opened' },
                        }),
                        newsletter_log.count({
                            where: { newsletterId: { [Op.in]: ids }, status: 'clicked' },
                        }),
                    ]);
                    const row = typeRows.find((r) => r.type === type);
                    const sent = Number(row?.sentCount) || 0;
                    return {
                        type,
                        newsletters: Number(row?.newsletters) || ids.length,
                        sent,
                        opened,
                        clicked,
                        openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
                        clickRate: sent > 0 ? Math.round((clicked / sent) * 100) : 0,
                    };
                }),
            );

            // Time series — open rate per week across the range
            const allSentIds = sentNewsletterIds.map((n) => n.id);
            const weekExpr = fn('DATE_TRUNC', 'week', col('created_at'));
            const weeklyRows = allSentIds.length
                ? await newsletter_log.findAll({
                      where: {
                          newsletterId: { [Op.in]: allSentIds },
                          status: { [Op.in]: ['sent', 'opened', 'clicked'] },
                          createdAt: { [Op.between]: [from, to] },
                      },
                      attributes: [
                          [weekExpr, 'week'],
                          'status',
                          [fn('COUNT', col('id')), 'cnt'],
                      ],
                      group: [weekExpr, 'status'],
                      order: [[weekExpr, 'ASC']],
                      raw: true,
                  })
                : [];

            const seriesMap = new Map();
            weeklyRows.forEach((r) => {
                const key = new Date(r.week).toISOString().substring(0, 10);
                const prev = seriesMap.get(key) || { week: key, sent: 0, opened: 0, clicked: 0 };
                prev[r.status] = Number(r.cnt) || 0;
                seriesMap.set(key, prev);
            });
            const timeSeries = [...seriesMap.values()]
                .map((row) => ({
                    ...row,
                    openRate: row.sent > 0 ? Math.round((row.opened / row.sent) * 100) : 0,
                    clickRate: row.sent > 0 ? Math.round((row.clicked / row.sent) * 100) : 0,
                }))
                .sort((a, b) => (a.week < b.week ? -1 : 1));

            res.status(200).json({
                from,
                to,
                breakdown,
                timeSeries,
            });
        } catch (err) {
            next(err);
        }
    },
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
