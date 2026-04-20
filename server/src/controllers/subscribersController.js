const subscriberController = require('express').Router();
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
