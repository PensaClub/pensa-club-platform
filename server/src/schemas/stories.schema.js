const { z } = require('zod');
const { SectionSchema, SlugSchema, TitleSchema, ShortDescriptionSchema, TagsSchema, MainImageSchema, PaginationQuerySchema } = require('./common.schema');

// Story-specific schemas
const CategorySchema = z.enum(['personal', 'community', 'educational', 'inspirational', 'case-study', 'testimonial', 'other'], {
    errorMap: () => ({ message: 'Invalid category' }),
});

const checkSlugUniqueness = async (slug, storyId = null) => {
    const { story } = require('../sequelize/models');

    const whereClause = { slug };
    if (storyId) {
        whereClause.id = { [require('sequelize').Op.ne]: storyId };
    }

    const existing = await story.findOne({ where: whereClause });
    return !existing;
};

const BaseStorySchema = z.object({
    slug: SlugSchema,
    title: TitleSchema,
    shortDescription: ShortDescriptionSchema,
    category: CategorySchema,
    publishedAt: z.string().datetime().or(z.date()).nullable().optional(),
    readTime: z.string().max(20).nullable().optional(),
    author: z.string().nullable().optional(),
    authorEmail: z.string().email().nullable().optional(),
    authorImage: z.string().url().nullable().optional(),
    tags: TagsSchema,
    sections: z.array(SectionSchema).max(50).optional(),
    mainImage: MainImageSchema,
    relatedStories: z.array(z.union([z.string(), z.number()])).optional(),
    commentsEnabled: z.boolean().default(true).optional(),
    showAuthor: z.boolean().default(true).optional(),
    connectedInitiativeIds: z.array(z.number()).optional(),
    connectedProjectIds: z.array(z.number()).optional(),
    isDraft: z.boolean().optional(),
});

const StorySchema = BaseStorySchema.refine(
    (data) => {
        const requiredFields = ['slug', 'title', 'shortDescription'];
        return requiredFields.every((field) => data[field] !== undefined && data[field] !== null && data[field] !== '');
    },
    {
        message: 'Required fields missing for story creation: slug, title, shortDescription',
    }
).refine(
    async (data) => {
        return await checkSlugUniqueness(data.slug);
    },
    {
        message: 'A story with this slug already exists',
        path: ['slug'],
    }
);

const UpdateStorySchema = z.object({
    slug: SlugSchema.optional(),
    title: TitleSchema.optional(),
    shortDescription: ShortDescriptionSchema.optional(),
    category: CategorySchema.optional(),
    publishedAt: z.string().datetime().or(z.date()).nullable().optional(),
    readTime: z.string().max(20).nullable().optional(),
    author: z.string().nullable().optional(),
    authorEmail: z.string().email().nullable().optional(),
    authorImage: z.string().url().nullable().optional(),
    tags: TagsSchema.optional(),
    sections: z.array(SectionSchema).max(50).optional(),
    mainImage: MainImageSchema.optional(),
    relatedStories: z.array(z.union([z.string(), z.number()])).optional(),
    commentsEnabled: z.boolean().optional(),
    showAuthor: z.boolean().optional(),
    isDraft: z.boolean().optional(),
    connectedInitiativeIds: z.array(z.number()).optional(),
    connectedProjectIds: z.array(z.number()).optional(),
});

module.exports = {
    StorySchema,
    UpdateStorySchema,
    PaginationQuerySchema,
};
