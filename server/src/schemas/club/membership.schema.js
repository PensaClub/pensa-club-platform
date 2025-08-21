const { z } = require('zod');
const { optionalNumber, optionalEnum } = require('./helpers');

const membershipSchema = z.object({
    id: z.string().optional(),
    clubId: z.string().optional(),

    totalMembers: optionalNumber(0),

    ageGroups: z
        .object({
            'below-60': optionalNumber(0),
            '60-70': optionalNumber(0),
            '70-80': optionalNumber(0),
            '80+': optionalNumber(0),
        })
        .optional(),

    membershipFee: z
        .object({
            monthly: optionalNumber(0),
            yearly: optionalNumber(0),
            currency: optionalEnum(['BGN', 'EUR', 'USD'], 'Invalid currency'),
        })
        .optional(),

    requirements: z.array(z.string()).optional(),
    benefits: z.array(z.string()).optional(),
});

module.exports = membershipSchema;
