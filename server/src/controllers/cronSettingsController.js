// server/src/controllers/cronSettingsController.js
//
// Admin endpoints for managing cron job settings (enabled/schedule + status).
// Cron jobs themselves read these rows on each tick (via getCronConfig helper)
// and update lastRunAt/lastRunStatus/lastRunSubscribers when they finish.

const cronSettingsController = require('express').Router();
const cron = require('node-cron');
const { cron_setting } = require('../sequelize/models');
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');

// ═══════════════════════════════════════════════════════════════════════
// GET /admin/cron — list all cron settings
// ═══════════════════════════════════════════════════════════════════════
cronSettingsController.get(
    '/',
    isAuth,
    rbac.checkPermission('cron', 'read'),
    async (req, res, next) => {
        try {
            const items = await cron_setting.findAll({
                order: [['key', 'ASC']],
            });
            res.status(200).json({ items });
        } catch (err) {
            next(err);
        }
    },
);

// ═══════════════════════════════════════════════════════════════════════
// GET /admin/cron/:key — single cron setting
// ═══════════════════════════════════════════════════════════════════════
cronSettingsController.get(
    '/:key',
    isAuth,
    rbac.checkPermission('cron', 'read'),
    async (req, res, next) => {
        try {
            const item = await cron_setting.findOne({
                where: { key: req.params.key },
            });
            if (!item) {
                return res.status(404).json({ message: 'Cron not found.' });
            }
            res.status(200).json({ item });
        } catch (err) {
            next(err);
        }
    },
);

// ═══════════════════════════════════════════════════════════════════════
// PUT /admin/cron/:key — update enabled/schedule/timezone
// Body: { enabled?, schedule?, timezone? }
// ═══════════════════════════════════════════════════════════════════════
cronSettingsController.put(
    '/:key',
    isAuth,
    rbac.checkPermission('cron', 'update'),
    async (req, res, next) => {
        try {
            const item = await cron_setting.findOne({
                where: { key: req.params.key },
            });
            if (!item) {
                return res.status(404).json({ message: 'Cron not found.' });
            }

            const updates = {};
            if (typeof req.body.enabled === 'boolean') {
                updates.enabled = req.body.enabled;
            }
            if (typeof req.body.schedule === 'string') {
                const sched = req.body.schedule.trim();
                if (!cron.validate(sched)) {
                    return res.status(400).json({
                        message: 'Invalid cron schedule expression.',
                    });
                }
                updates.schedule = sched;
            }
            if (typeof req.body.timezone === 'string') {
                updates.timezone = req.body.timezone.trim();
            }

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ message: 'Nothing to update.' });
            }

            await item.update(updates);
            res.status(200).json({ item });
        } catch (err) {
            next(err);
        }
    },
);

module.exports = cronSettingsController;
