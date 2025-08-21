const { z } = require('zod');
const { optionalString, optionalNumber, optionalEnum } = require('./helpers');

const activitiesSchema = z.object({
    regular: z
        .array(
            z.object({
                name: optionalString(),
                day: optionalEnum(
                    ['понеделник', 'вторник', 'сряда', 'четвъртък', 'петък', 'събота', 'неделя', 'всеки ден', 'понеделник, сряда, петък'],
                    'Invalid day'
                ),
                time: optionalString(),
                instructor: optionalString(),
                participants: optionalNumber(0),
                description: optionalString(),
            })
        )
        .optional(),

    events: z
        .array(
            z.object({
                id: optionalString(),
                title: optionalString(),
                date: optionalString(),
                time: optionalString(),
                type: optionalEnum(
                    [
                        'cultural',
                        'traditional',
                        'social',
                        'charity',
                        'community',
                        'sports_competition',
                        'wellness_event',
                        'sports_festival',
                        'swimming_competition',
                    ],
                    'Invalid event type'
                ),
                participants: optionalNumber(0),
                description: optionalString(),
                location: optionalString(),
                organizer: optionalString(),
                highlights: z.array(z.string()).optional(),
                featured: z.boolean().optional(),
                price: optionalString(),
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
            })
        )
        .optional(),
});

module.exports = activitiesSchema;
