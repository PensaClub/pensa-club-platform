const { z } = require('zod');
const { optionalString, optionalNumber, optionalEnum } = require('./helpers');

const activitiesSchema = z.object({
    regular: z
        .array(
            z.object({
                id: optionalString(),
                name: optionalString(),
                description: optionalString(),
                type: optionalString(), // TODO: change to enum when FE values are finalized
                category: optionalString(), // TODO: change to enum when FE values are finalized
                schedule: z
                    .object({
                        frequency: optionalString(), // TODO: change to enum when FE values are finalized
                        dayOfWeek: z
                            .number()
                            .min(0)
                            .max(7)
                            .transform((val) => (val === 0 ? null : val))
                            .nullable()
                            .optional(),
                        startTime: optionalString(),
                        duration: optionalNumber(0), // in minutes
                    })
                    .optional(),
                ageGroup: z
                    .object({
                        min: optionalNumber(0),
                        max: optionalNumber(0, 150),
                    })
                    .optional(),
                capacity: z
                    .object({
                        min: optionalNumber(0),
                        max: optionalNumber(0, 1000),
                    })
                    .optional(),
                fee: z
                    .object({
                        amount: optionalNumber(0),
                        period: optionalString(), // TODO: change to enum when FE values are finalized
                        required: z.boolean().optional(),
                    })
                    .optional(),
                instructor: optionalString(),
                requirements: optionalString(),
                equipment: z.array(z.string()).optional(),
            })
        )
        .optional(),

    events: z
        .array(
            z.object({
                id: optionalString(), // Frontend generates: event_{timestamp}_{randomString}
                title: optionalString(),
                date: optionalString(),
                time: optionalString(),
                type: optionalString(), // TODO: change to enum when FE values are finalized
                participants: optionalNumber(0),
                description: optionalString(),
                location: optionalString(),
                organizer: optionalString(),
                highlights: z.array(z.string()).optional(),
                featured: z.boolean().optional(),
                price: optionalString(),
                emergencyContact: optionalString(),
                images: z
                    .array(
                        z.object({
                            src: optionalString(),
                            alt: optionalString(),
                            caption: optionalString(),
                            isMain: z.boolean().optional(),
                        })
                    )
                    .optional(),
                videos: z
                    .array(
                        z.object({
                            src: optionalString(),
                            alt: optionalString(),
                            caption: optionalString(),
                            duration: optionalString(),
                            thumbnail: optionalString(),
                        })
                    )
                    .optional(),
            })
        )
        .optional(),

    trips: z
        .array(
            z.object({
                destination: optionalString(),
                date: optionalString(),
                participants: optionalNumber(0),
                price: optionalNumber(0),
                description: optionalString(),
                emergencyContact: optionalString(),
            })
        )
        .optional(),

    courses: z
        .array(
            z.object({
                name: optionalString(),
                duration: optionalString(),
                participants: optionalNumber(0),
                instructor: optionalString(),
                description: optionalString(),
                emergencyContact: optionalString(),
            })
        )
        .optional(),
});

module.exports = activitiesSchema;
