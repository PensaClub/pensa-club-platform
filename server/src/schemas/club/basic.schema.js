const { z } = require('zod');

const basicSchema = z.object({
    // Core identification
    id: z.string().optional(),

    slug: z.string().min(1, 'Slug is required'),

    name: z.string().optional(),

    shortDescription: z.string().optional(),

    // Club information
    foundedYear: z
        .number()
        .int('Founded year must be a whole number')
        .min(1900, 'Founded year must be 1900 or later')
        .max(new Date().getFullYear(), 'Founded year cannot be in the future')
        .optional(),

    status: z
        .enum(['active', 'inactive', 'suspended'], {
            errorMap: () => ({ message: 'Status must be active, inactive, or suspended' }),
        })
        .default('active'),

    category: z
        .enum(['cultural', 'sports', 'social', 'educational', 'general'], {
            errorMap: () => ({ message: 'Category must be cultural, sports, social, educational, or general' }),
        })
        .optional(),

    template: z
        .enum(['cultural', 'sports', 'traditional', 'social', 'educational', 'active', 'general'], {
            errorMap: () => ({ message: 'Template must be cultural, sports, traditional, social, educational, active, or general' }),
        })
        .optional(),

    // Media
    logo: z.string().url('Logo must be a valid URL').optional(),

    mainImage: z.string().url('Main image must be a valid URL').optional(),

    // Metadata
    createdBy: z.string().optional(),
    isVerified: z.boolean().default(false),

    isPublic: z.boolean().default(true),

    isDraft: z.boolean().default(true),

    // Statistics
    rating: z.number().min(0, 'Rating cannot be negative').max(5, 'Rating cannot exceed 5').default(0),

    views: z.number().int('Views must be a whole number').min(0, 'Views cannot be negative').default(0),

    followers: z.number().int('Followers must be a whole number').min(0, 'Followers cannot be negative').default(0),

    totalMembers: z.number().int('Total members must be a whole number').min(0, 'Total members cannot be negative').default(0),
});

module.exports = basicSchema;
