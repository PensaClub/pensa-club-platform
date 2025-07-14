const { z } = require('zod');
const { SectionSchema, SlugSchema, TitleSchema, ShortDescriptionSchema, TagsSchema, MainImageSchema, PaginationQuerySchema } = require('./common.schema');

// Story-specific schemas
const CategorySchema = z.enum(['personal', 'community', 'educational', 'inspirational', 'case-study', 'testimonial', 'other'], {
    errorMap: () => ({ message: 'Invalid category' }),
});

// Base schema with all fields optional for flexibility
const BaseStorySchema = z
    .object({
        // Basic info
        slug: SlugSchema,
        title: TitleSchema,
        titleSlug: z.string().nullable().optional(),
        shortDescription: ShortDescriptionSchema,

        // Story metadata
        category: CategorySchema.nullable().optional(),
        publishedAt: z
            .string()
            .datetime('Invalid date format')
            .or(z.date())
            .transform((val) => (typeof val === 'string' ? val : val.toISOString()))
            .nullable()
            .optional(),
        readTime: z.string().max(20, 'Read time too long').nullable().optional(),

        // Author information
        author: z.string().min(1, 'Author name is required').max(100, 'Author name too long').nullable().optional(),
        authorEmail: z.string().email('Invalid author email').nullable().optional(),
        authorImage: z.string().url('Invalid author image URL').nullable().optional(),

        // Content
        tags: TagsSchema,
        sections: z.array(SectionSchema).max(50, 'Maximum 50 sections allowed').nullable().optional(),
        mainImage: MainImageSchema,

        // Related content
        relatedStories: z
            .array(z.union([z.string(), z.number()]))
            .transform((val) => {
                if (!val) return [];
                return val.map((id) => (typeof id === 'string' ? parseInt(id, 10) : id));
            })
            .refine((val) => val.every((id) => !isNaN(id) && id > 0), 'All story IDs must be valid positive numbers')
            .nullable()
            .optional(),

        // Settings
        commentsEnabled: z.boolean().default(true).nullable().optional(),
    })
    .refine(
        (data) => {
            // If author is provided, authorEmail should also be provided
            if (data?.author && !data?.authorEmail) {
                return false;
            }
            return true;
        },
        {
            message: 'Author email is required when author is provided',
            path: ['authorEmail'],
        }
    );

// For creation - require minimal fields
const StorySchema = BaseStorySchema.refine(
    (data) => {
        const requiredFields = ['slug', 'title', 'shortDescription'];
        return requiredFields.every((field) => data[field] !== undefined && data[field] !== null && data[field] !== '');
    },
    {
        message: 'Required fields missing for story creation: slug, title, shortDescription',
    }
);

// For updates - everything is optional
const UpdateStorySchema = BaseStorySchema;

module.exports = {
    StorySchema,
    UpdateStorySchema,
    PaginationQuerySchema,
};
