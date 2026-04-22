// server/src/controllers/emailTemplateController.js
//
// Admin endpoints for managing the global email template (header, footer,
// logo, colors, signature). Templates are stored in `email_templates` with
// `template_key = 'global'` for now — a single row that every outbound email
// reads from.

const emailTemplateController = require('express').Router();
const { email_template, user_account } = require('../sequelize/models');
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');

const DEFAULT_KEY = 'global';

// Default values — what wrapNewsletter uses when the DB row is missing or
// a field is null. Keep these in sync with newsletterTemplates.js.
const DEFAULTS = {
    logoUrl: 'https://pensa.club/images/homePage/logo.png',
    primaryColor: '#E26020',
    secondaryColor: '#14b8a6',
    signature: 'С уважение,\nЕкипът на Pensa Club',
    headerHtml: '',
    footerHtml: '',
};

// ═══════════════════════════════════════════════════════════════════════
// GET /admin/email-template — returns current global template (or defaults)
// ═══════════════════════════════════════════════════════════════════════
emailTemplateController.get(
    '/',
    isAuth,
    rbac.checkPermission('emailTemplate', 'read'),
    async (req, res, next) => {
        try {
            const [row] = await email_template.findOrCreate({
                where: { templateKey: DEFAULT_KEY },
                defaults: { templateKey: DEFAULT_KEY },
                include: [
                    { model: user_account, as: 'editor', attributes: ['id', 'email'] },
                ],
            });

            const item = row.toJSON();
            res.status(200).json({
                item: {
                    ...item,
                    // Expose defaults so the UI can show the effective value
                    // (stored override vs. baked-in default).
                    defaults: DEFAULTS,
                },
            });
        } catch (err) {
            next(err);
        }
    },
);

// ═══════════════════════════════════════════════════════════════════════
// PUT /admin/email-template — update global template
// Body: { headerHtml?, footerHtml?, logoUrl?, primaryColor?, secondaryColor?, signature? }
// Passing `null` or empty string reverts that field to default on render.
// ═══════════════════════════════════════════════════════════════════════
emailTemplateController.put(
    '/',
    isAuth,
    rbac.checkPermission('emailTemplate', 'update'),
    async (req, res, next) => {
        try {
            const updates = {};
            const allowed = [
                'headerHtml',
                'footerHtml',
                'logoUrl',
                'primaryColor',
                'secondaryColor',
                'signature',
            ];
            allowed.forEach((key) => {
                if (Object.prototype.hasOwnProperty.call(req.body, key)) {
                    const val = req.body[key];
                    updates[key] = val === '' ? null : val;
                }
            });

            // Light validation: colors must look like hex
            const hexRe = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
            for (const colorKey of ['primaryColor', 'secondaryColor']) {
                if (updates[colorKey] != null && !hexRe.test(String(updates[colorKey]))) {
                    return res.status(400).json({
                        message: `Invalid ${colorKey} — must be hex like #E26020.`,
                    });
                }
            }

            if (req.user?.userId) {
                updates.updatedBy = req.user.userId;
            }

            const [row] = await email_template.findOrCreate({
                where: { templateKey: DEFAULT_KEY },
                defaults: { templateKey: DEFAULT_KEY },
            });
            await row.update(updates);

            // Force wrapNewsletter to re-read on next render
            try {
                const { invalidateTemplate } = require('../utils/emailTemplateCache');
                invalidateTemplate();
            } catch {
                /* cache module may not be loaded yet — no-op */
            }

            const refreshed = await email_template.findOne({
                where: { templateKey: DEFAULT_KEY },
                include: [
                    { model: user_account, as: 'editor', attributes: ['id', 'email'] },
                ],
            });

            res.status(200).json({
                item: { ...refreshed.toJSON(), defaults: DEFAULTS },
            });
        } catch (err) {
            next(err);
        }
    },
);

module.exports = emailTemplateController;
module.exports.DEFAULTS = DEFAULTS;
module.exports.DEFAULT_KEY = DEFAULT_KEY;
