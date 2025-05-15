const { z } = require('zod');

const categoryList = ['recommend', 'donate', 'sell', 'work', 'courses', 'health', 'initiatives_projects', 'tours', 'games', 'arbitration'];

const imageSchema = z.object({
    imageURL: z.string().min(1, 'Image URL is required.'),
    firebaseImagePath: z.string().min(1, 'Firebase image path is required.'),
});

const baseAdSchema = z.object({
    summary: z.string().min(4, 'Summary must be at least 4 characters.').max(32, 'Summary must not exceed 32 characters.'),
    category: z.enum(categoryList, {
        errorMap: () => ({
            message: 'Invalid category. Must be one of: recommend, donate, sell, work, courses, health, initiatives_projects, tours, games, arbitration.',
        }),
    }),
    description: z.string().min(10, 'Description must be at least 10 characters.').max(1000, 'Description must not exceed 1000 characters.'),
    images: z
        .array(imageSchema)
        .min(1, 'Each ad should contain at least 1 image.')
        .max(4, 'Cannot have more than 4 images per ad.')
        .refine((images) => images.every((img) => img.imageURL && img.firebaseImagePath), 'Each image must have a URL and a path.'),
    tags: z.array(z.string().max(16, 'Each tag must not exceed 16 characters.')).max(5, 'Tags array must contain between 0 to 5 elements.').default([]),
    adRegion: z.string().min(1, 'Region is required.'),
    adSubregion: z.string().min(1, 'Subregion is required.').optional(),
    adTown: z.string().min(1, 'Town is required.').optional(),
    street: z.string().min(1, 'Street is required.').optional(),
    adId: z.string().min(1, 'Ad ID is required.').optional(),
});

const createAdSchema = baseAdSchema
    .extend({
        adRegion: z.string().min(1, 'Region is required.'),
        adSubregion: z.string().min(1, 'Subregion is required.'),
        adTown: z.string().min(1, 'Town is required.'),
        street: z.string().min(1, 'Street is required.'),
    })
    .omit({ adId: true })
    .refine(
        (data) => {
            if (data.adSubregion && !data.adRegion) {
                return false;
            }
            if (data.adTown && (!data.adRegion || !data.adSubregion)) {
                return false;
            }
            return true;
        },
        {
            message: 'Location hierarchy must be followed: adTown requires adSubregion and adRegion, adSubregion requires adRegion',
        }
    )
    .transform((data) => {
        Object.keys(data).forEach((key) => {
            if (data[key] === '') {
                data[key] = null;
            }
        });
        return data;
    });

const updateAdSchema = baseAdSchema
    .partial()
    .refine(
        (data) => {
            if (data.adSubregion && !data.adRegion) {
                return false;
            }
            if (data.adTown && (!data.adRegion || !data.adSubregion)) {
                return false;
            }
            return true;
        },
        {
            message: 'Location hierarchy must be followed: adTown requires adSubregion and adRegion, adSubregion requires adRegion',
        }
    )
    .transform((data) => {
        Object.keys(data).forEach((key) => {
            if (data[key] === '') {
                data[key] = null;
            }
        });
        return data;
    });

const extraFieldsSchema = z
    .object({
        price: z
            .union([z.string().regex(/^\d+(\.\d{1,2})?$/, 'Price needs to be a valid number.'), z.number().min(0, 'Price can not be negative.')])
            .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
            .refine((val) => val.toString().length <= 10, 'Price length should not exceed 10 characters.')
            .optional(),

        eventStartDate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD.')
            .optional(),

        eventEndDate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD.')
            .optional(),
    })
    .refine(
        (data) => {
            // If either date is provided, both must be provided
            if (data.eventStartDate || data.eventEndDate) {
                return !!(data.eventStartDate && data.eventEndDate);
            }
            return true;
        },
        {
            message: 'Both eventStartDate and eventEndDate are required if one is provided.',
            path: ['date'],
        }
    )
    .refine(
        (data) => {
            if (data.eventStartDate && data.eventEndDate) {
                const startDate = new Date(data.eventStartDate);
                const endDate = new Date(data.eventEndDate);
                const currentDate = new Date();

                return startDate >= currentDate && endDate >= currentDate;
            }
            return true;
        },
        {
            message: 'Dates can not be in the past.',
            path: ['date'],
        }
    )
    .refine(
        (data) => {
            if (data.eventStartDate && data.eventEndDate) {
                const startDate = new Date(data.eventStartDate);
                const endDate = new Date(data.eventEndDate);

                return endDate >= startDate;
            }
            return true;
        },
        {
            message: 'eventEndDate can not be earlier than eventStartDate.',
            path: ['date'],
        }
    );

module.exports = {
    createAdSchema,
    updateAdSchema,
    extraFieldsSchema,
};
