const subscriberController = require('express').Router();
const { Op } = require('sequelize');
const isAuth = require('../middlewares/isAuth');
const { subscriber, subscriber_preference } = require('../sequelize/models/index');
const rbac = require('../middlewares/rbac');

const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-'.]{2,50}$/;

// ═══════════════════════════════════════════════════════════════════════════
// ANTI-SPAM — subscribe rate limiter: max 3 per 10 min per IP
// ═══════════════════════════════════════════════════════════════════════════
const subscribeRateStore = new Map();
const SUBSCRIBE_RATE_LIMIT = 3;
const SUBSCRIBE_RATE_WINDOW = 10 * 60 * 1000; // 10 minutes

setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of subscribeRateStore) {
        if (now - record.windowStart > SUBSCRIBE_RATE_WINDOW) {
            subscribeRateStore.delete(ip);
        }
    }
}, 10 * 60 * 1000);

const subscribeRateLimiter = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const record = subscribeRateStore.get(ip);

    if (!record || (now - record.windowStart) > SUBSCRIBE_RATE_WINDOW) {
        subscribeRateStore.set(ip, { count: 1, windowStart: now });
        return next();
    }

    if (record.count < SUBSCRIBE_RATE_LIMIT) {
        record.count++;
        return next();
    }

    const remainingMs = SUBSCRIBE_RATE_WINDOW - (now - record.windowStart);
    const remainingMinutes = Math.ceil(remainingMs / 60000);

    return res.status(429).json({
        message: `Твърде много опити. Моля, опитайте отново след ${remainingMinutes} минути.`,
        statusCode: 429,
        remainingMinutes,
    });
};

const ALL_CATEGORIES = ['seminars', 'courses', 'articles', 'initiatives', 'clubs', 'games', 'platform'];

// ===============================
// POST /subscribe/addSubscriber
// ===============================
subscriberController.post('/addSubscriber', subscribeRateLimiter, async (req, res, next) => {
    try {
        const { username, email, source } = req.body;

        if (!username || !email) return res.status(400).json({ message: 'Username and email are required.' });
        if (!emailRegex.test(email)) return res.status(400).json({ message: 'Email format is incorrect.' });
        if (username.length < 2 || username.length > 50) {
            return res.status(400).json({ message: 'Name must be between 2 and 50 characters long.' });
        }
        if (!nameRegex.test(username))
            return res.status(400).json({
                message: 'Name can only contain letters, spaces, hyphens and apostrophes.',
            });

        const [sub, created] = await subscriber.findOrCreate({
            where: { email },
            defaults: { name: username, email, source: source || 'website' },
        });

        if (!created) {
            return res.status(200).json({ message: 'Вече сте абониран/а с този имейл.', alreadySubscribed: true });
        }

        // Create default preferences (all enabled)
        await subscriber_preference.bulkCreate(
            ALL_CATEGORIES.map(cat => ({
                subscriberId: sub.id,
                category: cat,
                enabled: true,
            })),
            { ignoreDuplicates: true }
        );

        res.status(201).json({
            message: 'Subscriber added successfully.',
            unsubscribeToken: sub.unsubscribeToken,
        });
    } catch (err) {
        next(err);
    }
});

// ===============================
// GET /subscribe/getSubscribers (admin)
// ===============================
subscriberController.get('/getSubscribers', isAuth, rbac.checkPermission('subscription', 'read'), async (req, res, next) => {
    try {
        const subscribers = await subscriber.findAll({
            include: [{
                model: subscriber_preference,
                as: 'preferences',
                attributes: ['category', 'enabled'],
            }],
            order: [['createdAt', 'DESC']],
        });

        if (!subscribers) return res.status(404).json({ message: 'No subscribers found.' });

        res.status(200).json({ message: 'Subscribers successfully retrieved.', subscribers });
    } catch (err) {
        next(err);
    }
});

// ===============================
// DELETE /subscribe/admin/:id (admin)
// ===============================
subscriberController.delete('/admin/:id', isAuth, rbac.checkPermission('subscription', 'read'), async (req, res, next) => {
    try {
        const sub = await subscriber.findByPk(parseInt(req.params.id));
        if (!sub) return res.status(404).json({ message: 'Subscriber not found.' });

        await sub.destroy();
        res.status(200).json({ message: 'Subscriber deleted.' });
    } catch (err) {
        next(err);
    }
});

// ═══════════════════════════════════════════════════════════════════════
// GET /subscribe/admin/list — paginated list with filters (admin)
// Query: page, limit, status, category, search (email/name), dateFrom, dateTo
// ═══════════════════════════════════════════════════════════════════════
subscriberController.get(
    '/admin/list',
    isAuth,
    rbac.checkPermission('subscription', 'read'),
    async (req, res, next) => {
        try {
            const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
            const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 200);
            const offset = (page - 1) * limit;

            const where = {};
            const allowedStatuses = ['active', 'unsubscribed', 'blocked'];
            if (req.query.status && allowedStatuses.includes(req.query.status)) {
                where.status = req.query.status;
            }
            if (req.query.search) {
                const term = String(req.query.search).trim();
                if (term) {
                    where[Op.or] = [
                        { email: { [Op.iLike]: `%${term}%` } },
                        { name: { [Op.iLike]: `%${term}%` } },
                    ];
                }
            }
            if (req.query.dateFrom || req.query.dateTo) {
                where.createdAt = {};
                if (req.query.dateFrom) where.createdAt[Op.gte] = new Date(req.query.dateFrom);
                if (req.query.dateTo) {
                    const to = new Date(req.query.dateTo);
                    to.setHours(23, 59, 59, 999);
                    where.createdAt[Op.lte] = to;
                }
            }

            const includePreferences = {
                model: subscriber_preference,
                as: 'preferences',
                attributes: ['category', 'enabled'],
                required: false,
            };

            // Filter by category — INNER JOIN on enabled preference
            const categoryFilter = req.query.category
                ? {
                      ...includePreferences,
                      required: true,
                      where: { category: req.query.category, enabled: true },
                  }
                : includePreferences;

            const { rows, count } = await subscriber.findAndCountAll({
                where,
                include: [categoryFilter],
                order: [['createdAt', 'DESC']],
                limit,
                offset,
                distinct: true,
            });

            // If filtered by category, the include is INNER JOIN with category=X only.
            // We still want to return ALL preferences for each subscriber so the UI
            // can show the full category set. Re-fetch preferences separately.
            let subscribers = rows.map((r) => r.toJSON());
            if (req.query.category && subscribers.length > 0) {
                const ids = subscribers.map((s) => s.id);
                const allPrefs = await subscriber_preference.findAll({
                    where: { subscriberId: { [Op.in]: ids } },
                    attributes: ['subscriberId', 'category', 'enabled'],
                });
                const grouped = {};
                allPrefs.forEach((p) => {
                    if (!grouped[p.subscriberId]) grouped[p.subscriberId] = [];
                    grouped[p.subscriberId].push({ category: p.category, enabled: p.enabled });
                });
                subscribers = subscribers.map((s) => ({ ...s, preferences: grouped[s.id] || [] }));
            }

            res.status(200).json({
                subscribers,
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
    },
);

// ═══════════════════════════════════════════════════════════════════════
// GET /subscribe/admin/stats — quick counters for dashboard
// ═══════════════════════════════════════════════════════════════════════
subscriberController.get(
    '/admin/stats',
    isAuth,
    rbac.checkPermission('subscription', 'read'),
    async (req, res, next) => {
        try {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);

            const [active, unsubscribed, blocked, newThisWeek, newThisMonth, total] =
                await Promise.all([
                    subscriber.count({ where: { status: 'active' } }),
                    subscriber.count({ where: { status: 'unsubscribed' } }),
                    subscriber.count({ where: { status: 'blocked' } }),
                    subscriber.count({ where: { createdAt: { [Op.gte]: weekAgo } } }),
                    subscriber.count({ where: { createdAt: { [Op.gte]: monthAgo } } }),
                    subscriber.count(),
                ]);

            // By category — count active subs with each enabled preference
            const categories = ['seminars', 'courses', 'articles', 'initiatives', 'clubs', 'games', 'platform'];
            const byCategoryRaw = await Promise.all(
                categories.map(async (cat) => {
                    const c = await subscriber.count({
                        where: { status: 'active' },
                        include: [
                            {
                                model: subscriber_preference,
                                as: 'preferences',
                                required: true,
                                where: { category: cat, enabled: true },
                            },
                        ],
                        distinct: true,
                    });
                    return { category: cat, count: c };
                }),
            );

            res.status(200).json({
                total,
                active,
                unsubscribed,
                blocked,
                newThisWeek,
                newThisMonth,
                byCategory: byCategoryRaw,
            });
        } catch (err) {
            next(err);
        }
    },
);

// ═══════════════════════════════════════════════════════════════════════
// GET /subscribe/admin/stats/growth?days=90
// Returns weekly buckets with: new subscribers + unsubscribes per week.
// Used for the "growth trend" chart in admin Stats tab.
// ═══════════════════════════════════════════════════════════════════════
subscriberController.get(
    '/admin/stats/growth',
    isAuth,
    rbac.checkPermission('subscription', 'read'),
    async (req, res, next) => {
        try {
            const { fn, col, literal } = require('sequelize');

            const days = Math.max(7, Math.min(parseInt(req.query.days, 10) || 90, 730));
            const from = new Date();
            from.setDate(from.getDate() - days);
            from.setHours(0, 0, 0, 0);

            // New subscribers per week — `subscribers` table is camelCase
            // (`underscored: false`), so the column is "createdAt" (quoted).
            const newWeekExpr = fn('DATE_TRUNC', 'week', col('createdAt'));
            const newRows = await subscriber.findAll({
                where: { createdAt: { [Op.gte]: from } },
                attributes: [
                    [newWeekExpr, 'week'],
                    [fn('COUNT', col('id')), 'cnt'],
                ],
                group: [newWeekExpr],
                order: [[newWeekExpr, 'ASC']],
                raw: true,
            });

            // Unsubscribes per week (only those who actually unsubscribed in range)
            const unsubWeekExpr = fn('DATE_TRUNC', 'week', col('unsubscribed_at'));
            const unsubRows = await subscriber.findAll({
                where: {
                    status: 'unsubscribed',
                    unsubscribedAt: { [Op.gte]: from, [Op.ne]: null },
                },
                attributes: [
                    [unsubWeekExpr, 'week'],
                    [fn('COUNT', col('id')), 'cnt'],
                ],
                group: [unsubWeekExpr],
                order: [[unsubWeekExpr, 'ASC']],
                raw: true,
            });

            // Merge into a single timeseries
            const seriesMap = new Map();
            const addRow = (row, key) => {
                const week = new Date(row.week).toISOString().substring(0, 10);
                const prev = seriesMap.get(week) || { week, newSubs: 0, unsubs: 0 };
                prev[key] = Number(row.cnt) || 0;
                seriesMap.set(week, prev);
            };
            newRows.forEach((r) => addRow(r, 'newSubs'));
            unsubRows.forEach((r) => addRow(r, 'unsubs'));

            const timeSeries = [...seriesMap.values()].sort((a, b) =>
                a.week < b.week ? -1 : 1,
            );

            res.status(200).json({ from, days, timeSeries });
        } catch (err) {
            next(err);
        }
    },
);

// ═══════════════════════════════════════════════════════════════════════
// POST /subscribe/admin/:id/block — block a subscriber
// ═══════════════════════════════════════════════════════════════════════
subscriberController.post(
    '/admin/:id/block',
    isAuth,
    rbac.checkPermission('subscription', 'read'),
    async (req, res, next) => {
        try {
            const sub = await subscriber.findByPk(parseInt(req.params.id, 10));
            if (!sub) return res.status(404).json({ message: 'Subscriber not found.' });
            await sub.update({ status: 'blocked' });
            res.status(200).json({ subscriber: sub.toJSON() });
        } catch (err) {
            next(err);
        }
    },
);

// ═══════════════════════════════════════════════════════════════════════
// POST /subscribe/admin/:id/unblock — restore to active
// ═══════════════════════════════════════════════════════════════════════
subscriberController.post(
    '/admin/:id/unblock',
    isAuth,
    rbac.checkPermission('subscription', 'read'),
    async (req, res, next) => {
        try {
            const sub = await subscriber.findByPk(parseInt(req.params.id, 10));
            if (!sub) return res.status(404).json({ message: 'Subscriber not found.' });
            await sub.update({ status: 'active', unsubscribedAt: null });
            res.status(200).json({ subscriber: sub.toJSON() });
        } catch (err) {
            next(err);
        }
    },
);

// ═══════════════════════════════════════════════════════════════════════
// GET /subscribe/admin/export.csv — download CSV
// ═══════════════════════════════════════════════════════════════════════
subscriberController.get(
    '/admin/export.csv',
    isAuth,
    rbac.checkPermission('subscription', 'read'),
    async (req, res, next) => {
        try {
            const subscribers = await subscriber.findAll({
                include: [
                    {
                        model: subscriber_preference,
                        as: 'preferences',
                        attributes: ['category', 'enabled'],
                    },
                ],
                order: [['createdAt', 'DESC']],
            });

            // Use ';' as field delimiter — that is the default Excel locale
            // expects in BG/DE/FR/RU. Quote every field to be defensive.
            // The leading "sep=;" directive forces Excel to honor it on
            // any locale, even US/EN which would otherwise default to comma.
            const SEP = ';';
            const csvEscape = (v) => {
                if (v === null || v === undefined) return '""';
                const s = String(v).replace(/"/g, '""');
                return `"${s}"`;
            };

            const header = ['id', 'name', 'email', 'status', 'source', 'phone', 'createdAt', 'unsubscribedAt', 'enabledCategories'];
            const lines = [
                `sep=${SEP}`, // Excel directive — must be the very first line
                header.map(csvEscape).join(SEP),
            ];

            subscribers.forEach((s) => {
                const enabledCats = (s.preferences || [])
                    .filter((p) => p.enabled)
                    .map((p) => p.category)
                    .join(','); // inside the quoted field — comma is safe
                lines.push(
                    [
                        s.id,
                        csvEscape(s.name),
                        csvEscape(s.email),
                        csvEscape(s.status),
                        csvEscape(s.source),
                        csvEscape(s.phone),
                        s.createdAt ? `"${new Date(s.createdAt).toISOString()}"` : '""',
                        s.unsubscribedAt ? `"${new Date(s.unsubscribedAt).toISOString()}"` : '""',
                        csvEscape(enabledCats),
                    ].join(SEP),
                );
            });

            // BOM for Excel UTF-8 + CRLF line endings (Excel-friendly).
            const csv = '\uFEFF' + lines.join('\r\n');
            const filename = `subscribers_${new Date().toISOString().slice(0, 10)}.csv`;

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.status(200).send(csv);
        } catch (err) {
            next(err);
        }
    },
);

// ═══════════════════════════════════════════════════════════════════════
// GET /subscribe/admin/export.pdf — Pensa-branded PDF report
// ═══════════════════════════════════════════════════════════════════════
subscriberController.get(
    '/admin/export.pdf',
    isAuth,
    rbac.checkPermission('subscription', 'read'),
    async (req, res, next) => {
        try {
            const PDFDocument = require('pdfkit');
            const path = require('path');
            const fs = require('fs');

            // Apply same filters as /admin/list (without pagination — full export)
            const where = {};
            const allowedStatuses = ['active', 'unsubscribed', 'blocked'];
            if (req.query.status && allowedStatuses.includes(req.query.status)) {
                where.status = req.query.status;
            }
            if (req.query.search) {
                const term = String(req.query.search).trim();
                if (term) {
                    where[Op.or] = [
                        { email: { [Op.iLike]: `%${term}%` } },
                        { name: { [Op.iLike]: `%${term}%` } },
                    ];
                }
            }
            if (req.query.dateFrom || req.query.dateTo) {
                where.createdAt = {};
                if (req.query.dateFrom) where.createdAt[Op.gte] = new Date(req.query.dateFrom);
                if (req.query.dateTo) {
                    const to = new Date(req.query.dateTo);
                    to.setHours(23, 59, 59, 999);
                    where.createdAt[Op.lte] = to;
                }
            }

            const subscribers = await subscriber.findAll({
                where,
                include: [
                    {
                        model: subscriber_preference,
                        as: 'preferences',
                        attributes: ['category', 'enabled'],
                    },
                ],
                order: [['createdAt', 'DESC']],
            });

            const counts = {
                total: subscribers.length,
                active: subscribers.filter((s) => s.status === 'active').length,
                unsubscribed: subscribers.filter((s) => s.status === 'unsubscribed').length,
                blocked: subscribers.filter((s) => s.status === 'blocked').length,
            };

            const statusLabels = {
                all: 'Всички',
                active: 'Активни',
                unsubscribed: 'Отписани',
                blocked: 'Блокирани',
            };
            const statusFilterLabel = statusLabels[req.query.status || 'all'] || 'Всички';

            // Generate PDF
            const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.pdf"`,
            );
            doc.pipe(res);

            // Cyrillic font
            const fontPath = path.join(__dirname, '..', 'fonts', 'DejaVuSans.ttf');
            const hasFont = fs.existsSync(fontPath);
            if (hasFont) doc.registerFont('CyrFont', fontPath);
            const font = hasFont ? 'CyrFont' : 'Helvetica';

            // Header with logos
            const cifLogoPath = path.join(__dirname, '..', '..', '..', 'client', 'public', 'images', 'partners', 'CIF_logo_black_rgb.png');
            const pensaLogoPath = path.join(__dirname, '..', '..', '..', 'client', 'public', 'images', 'homePage', 'logo-2.png');
            const headerY = 30;
            const pageW = doc.page.width;

            if (fs.existsSync(cifLogoPath)) {
                doc.image(cifLogoPath, 40, headerY, { height: 40 });
            }
            doc.font(font).fontSize(13).fillColor('#1f2937');
            doc.text('Pensa Club', 0, headerY + 5, { align: 'center', width: pageW });
            doc.font(font).fontSize(8).fillColor('#6b7280');
            doc.text('Фондация ПЕНСА', 0, headerY + 22, { align: 'center', width: pageW });
            if (fs.existsSync(pensaLogoPath)) {
                doc.image(pensaLogoPath, pageW - 40 - 40, headerY, { height: 40 });
            }

            doc.y = headerY + 50;
            doc.moveDown(0.5);
            doc.font(font).fontSize(12).fillColor('#8b2040').text('Доклад за абонати', { align: 'center' });
            doc.font(font).fontSize(8).fillColor('#6b7280').text(
                `Генериран: ${new Date().toLocaleString('bg-BG')}`,
                { align: 'center' },
            );
            doc.moveDown(1);

            // Overview
            doc.font(font).fontSize(9).fillColor('#374151');
            doc.text(
                `Статус: ${statusFilterLabel}    |    Общо: ${counts.total}    |    Активни: ${counts.active}    |    Отписани: ${counts.unsubscribed}    |    Блокирани: ${counts.blocked}`,
                { align: 'center' },
            );
            doc.moveDown(1);

            // Table
            const headers = ['Име', 'Имейл', 'Статус', 'Категории', 'Дата'];
            const colWidths = [110, 145, 55, 130, 65];
            const pageWidth = doc.page.width - 80;
            const totalW = colWidths.reduce((a, b) => a + b, 0);
            const scale = pageWidth / totalW;
            const sw = colWidths.map((w) => Math.floor(w * scale));
            const startX = 40;
            let y = doc.y + 5;
            const rh = 22;

            // Header row
            doc.fontSize(7).font(font);
            let x = startX;
            headers.forEach((h, i) => {
                doc.rect(x, y, sw[i], rh).fillAndStroke('#8b2040', '#8b2040');
                doc.fillColor('#fff').text(h, x + 4, y + 6, {
                    width: sw[i] - 8,
                    height: rh - 6,
                    ellipsis: true,
                });
                x += sw[i];
            });
            y += rh;

            // Status labels
            const subStatusLabels = {
                active: 'Активен',
                unsubscribed: 'Отписан',
                blocked: 'Блокиран',
            };
            const categoryLabels = {
                seminars: 'Семинари',
                courses: 'Курсове',
                articles: 'Статии',
                initiatives: 'Инициативи',
                clubs: 'Клубове',
                games: 'Игри',
                platform: 'Ъпдейти',
            };

            // Data rows
            doc.font(font).fontSize(6.5);
            subscribers.forEach((sub, ri) => {
                if (y + rh > doc.page.height - 40) {
                    doc.addPage({ size: 'A4', margin: 40 });
                    y = 40;
                }
                const bg = ri % 2 === 0 ? '#ffffff' : '#f5f3f0';
                const enabledCats = (sub.preferences || [])
                    .filter((p) => p.enabled)
                    .map((p) => categoryLabels[p.category] || p.category)
                    .join(', ');

                const vals = [
                    sub.name || '—',
                    sub.email || '—',
                    subStatusLabels[sub.status] || sub.status,
                    enabledCats || '—',
                    sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('bg-BG') : '—',
                ];

                x = startX;
                vals.forEach((v, ci) => {
                    doc.rect(x, y, sw[ci], rh).fillAndStroke(bg, '#ddd');
                    doc.fillColor('#222').text(String(v), x + 4, y + 6, {
                        width: sw[ci] - 8,
                        height: rh - 6,
                        ellipsis: true,
                    });
                    x += sw[ci];
                });
                y += rh;
            });

            doc.end();
        } catch (err) {
            next(err);
        }
    },
);

// ═══════════════════════════════════════════════════════════════════════
// PUT /subscribe/admin/:id/preferences — admin updates preferences
// ═══════════════════════════════════════════════════════════════════════
subscriberController.put(
    '/admin/:id/preferences',
    isAuth,
    rbac.checkPermission('subscription', 'read'),
    async (req, res, next) => {
        try {
            const sub = await subscriber.findByPk(parseInt(req.params.id, 10));
            if (!sub) return res.status(404).json({ message: 'Subscriber not found.' });

            const { preferences } = req.body;
            if (!Array.isArray(preferences)) {
                return res.status(400).json({ message: 'Preferences must be an array.' });
            }

            for (const pref of preferences) {
                if (!ALL_CATEGORIES.includes(pref.category)) continue;
                const existing = await subscriber_preference.findOne({
                    where: { subscriberId: sub.id, category: pref.category },
                });
                if (existing) {
                    await existing.update({ enabled: !!pref.enabled });
                } else {
                    await subscriber_preference.create({
                        subscriberId: sub.id,
                        category: pref.category,
                        enabled: !!pref.enabled,
                    });
                }
            }

            res.status(200).json({ message: 'Preferences updated.' });
        } catch (err) {
            next(err);
        }
    },
);

// ===============================
// GET /subscribe/preferences/:token (public)
// ===============================
subscriberController.get('/preferences/:token', async (req, res, next) => {
    try {
        const sub = await subscriber.findOne({
            where: { unsubscribeToken: req.params.token, status: 'active' },
            include: [{
                model: subscriber_preference,
                as: 'preferences',
                attributes: ['category', 'enabled'],
            }],
        });

        if (!sub) {
            return res.status(404).json({ message: 'Subscriber not found or already unsubscribed.' });
        }

        res.status(200).json({
            name: sub.name,
            email: sub.email,
            preferences: sub.preferences,
            categories: ALL_CATEGORIES,
        });
    } catch (err) {
        next(err);
    }
});

// ===============================
// PUT /subscribe/preferences/:token (public)
// ===============================
subscriberController.put('/preferences/:token', async (req, res, next) => {
    try {
        const sub = await subscriber.findOne({
            where: { unsubscribeToken: req.params.token, status: 'active' },
        });

        if (!sub) {
            return res.status(404).json({ message: 'Subscriber not found or already unsubscribed.' });
        }

        const { preferences } = req.body;
        if (!Array.isArray(preferences)) {
            return res.status(400).json({ message: 'Preferences must be an array.' });
        }

        for (const pref of preferences) {
            if (!ALL_CATEGORIES.includes(pref.category)) continue;

            const existing = await subscriber_preference.findOne({
                where: { subscriberId: sub.id, category: pref.category },
            });

            if (existing) {
                await existing.update({ enabled: !!pref.enabled });
            } else {
                await subscriber_preference.create({
                    subscriberId: sub.id,
                    category: pref.category,
                    enabled: !!pref.enabled,
                });
            }
        }

        res.status(200).json({ message: 'Preferences updated.' });
    } catch (err) {
        next(err);
    }
});

// ===============================
// POST /subscribe/unsubscribe/:token (public)
// ===============================
subscriberController.post('/unsubscribe/:token', async (req, res, next) => {
    try {
        const sub = await subscriber.findOne({
            where: { unsubscribeToken: req.params.token },
        });

        if (!sub) {
            return res.status(404).json({ message: 'Subscriber not found.' });
        }

        if (sub.status === 'unsubscribed') {
            return res.status(200).json({ message: 'Already unsubscribed.' });
        }

        await sub.update({
            status: 'unsubscribed',
            unsubscribedAt: new Date(),
        });

        // Disable all preferences
        await subscriber_preference.update(
            { enabled: false },
            { where: { subscriberId: sub.id } }
        );

        res.status(200).json({ message: 'Successfully unsubscribed.' });
    } catch (err) {
        next(err);
    }
});

module.exports = subscriberController;
