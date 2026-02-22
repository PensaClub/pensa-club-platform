const { z } = require('zod');

const updateSettingsSchema = z.object({
    settings: z.record(
        z.string(),
        z.union([z.boolean(), z.string(), z.number()])
    ),
});

module.exports = {
    updateSettingsSchema,
};
