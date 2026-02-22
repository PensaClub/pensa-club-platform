const siteSettingsController = require('express').Router();
const { site_setting } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');
const { updateSettingsSchema } = require('../schemas/siteSettings.schema');

/**
 * GET /admin/site-settings
 * Returns all site settings as key-value pairs
 * Public access (with guest support) for frontend components to read settings
 */
siteSettingsController.get('/', isAuth.allowGuest, rbac.checkPermission('siteSettings', 'read'), async (req, res, next) => {
    try {
        const allSettings = await site_setting.findAll();

        const settings = {};
        allSettings.forEach((setting) => {
            let parsedValue = setting.value;

            if (setting.type === 'boolean') {
                parsedValue = setting.value === 'true';
            } else if (setting.type === 'number') {
                parsedValue = Number(setting.value);
            }

            settings[setting.key] = parsedValue;
        });

        res.status(200).json({ settings });
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /admin/site-settings
 * Updates one or more site settings
 * Admin-only access
 * Body: { settings: { snowfall_enabled: true, christmas_greeting_enabled: false } }
 */
siteSettingsController.put('/', isAuth, rbac.checkPermission('siteSettings', 'update'), async (req, res, next) => {
    try {
        const validation = updateSettingsSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                message: 'Invalid data.',
                errors: validation.error.errors,
            });
        }

        const { settings } = validation.data;
        const updatedKeys = [];

        for (const [key, value] of Object.entries(settings)) {
            const setting = await site_setting.findOne({ where: { key } });

            if (!setting) {
                return res.status(404).json({ message: `Setting "${key}" not found.` });
            }

            await setting.update({ value: String(value) });
            updatedKeys.push(key);
        }

        // Return updated settings
        const allSettings = await site_setting.findAll();
        const result = {};
        allSettings.forEach((setting) => {
            let parsedValue = setting.value;
            if (setting.type === 'boolean') {
                parsedValue = setting.value === 'true';
            } else if (setting.type === 'number') {
                parsedValue = Number(setting.value);
            }
            result[setting.key] = parsedValue;
        });

        res.status(200).json({
            message: 'Settings updated successfully.',
            updatedKeys,
            settings: result,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = siteSettingsController;
