const { z } = require('zod');
const { optionalNumber, optionalString, optionalEnum } = require('./helpers');

const membershipSchema = z.object({
    id: z.string().optional(),
    clubId: z.string().optional(),

    totalMembers: optionalNumber(0),
    maxMembers: optionalNumber(0),

    ageGroups: z
        .object({
            'под-60': optionalNumber(0),
            '60-70': optionalNumber(0),
            '70-80': optionalNumber(0),
            '80+': optionalNumber(0),
        })
        .optional(),

    membershipFee: z
        .object({
            monthly: optionalNumber(0),
            yearly: optionalNumber(0),
            currency: optionalString(), // TODO: change to enum when FE values are finalized
        })
        .optional(),

    type: optionalString(), // TODO: change to enum when FE values are finalized
    minimumAge: optionalNumber(0),

    trialPeriod: z
        .object({
            enabled: z.boolean().optional(),
            days: optionalNumber(0),
        })
        .optional(),

    fees: z
        .object({
            list: z
                .array(
                    z.object({
                        id: z.number().optional(),
                        type: optionalString(),
                        amount: optionalString(),
                        period: optionalString(), // TODO: change to enum when FE values are finalized
                        description: optionalString(),
                        currency: optionalString(), // TODO: change to enum when FE values are finalized
                    })
                )
                .optional(),
        })
        .optional(),

    management: z
        .object({
            roles: z
                .object({
                    president: z
                        .object({
                            personName: optionalString(),
                            contactInfo: optionalString(),
                        })
                        .optional(),
                })
                .optional(),
        })
        .optional(),

    requirements: z.array(z.string()).optional(),
    benefits: z.array(z.string()).optional(),
});

module.exports = membershipSchema;
