const { z } = require('zod');
const { SectionSchema, SlugSchema, TitleSchema, ShortDescriptionSchema, TagsSchema, MainImageSchema, PaginationQuerySchema } = require('./common.schema');

const FileTypeSchema = z.enum(['pdf', 'docx', 'xlsx', 'xls', 'csv', 'pptx', 'ppt', 'jpg', 'jpeg', 'png', 'gif', 'webp']).nullable().optional();
const CategorySchema = z.enum(['technology', 'health', 'lifestyle', 'education', 'community', 'other']).nullable().optional();

const checkSlugUniqueness = async (slug, publicationId = null) => {
    const { publication } = require('../sequelize/models');

    const whereClause = { slug };
    if (publicationId) {
        whereClause.id = { [require('sequelize').Op.ne]: publicationId };
    }

    const existing = await publication.findOne({ where: whereClause });
    return !existing;
};

const BasePublicationSchema = z.object({
    slug: SlugSchema,
    title: TitleSchema,
    shortDescription: ShortDescriptionSchema,
    category: CategorySchema,
    publishedAt: z.string().datetime().or(z.date()).nullable().optional(),
    readTime: z.string().max(20).nullable().optional(),
    fileType: FileTypeSchema,
    fileSize: z.string().max(20).nullable().optional(),
    downloadUrl: z.string().url().nullable().optional(),
    tags: TagsSchema,
    sections: z.array(SectionSchema).max(50).optional(),
    mainImage: MainImageSchema,
    relatedPublications: z.array(z.union([z.string(), z.number()])).optional(),
    commentsEnabled: z.boolean().default(true).optional(),
    showAuthor: z.boolean().default(true).optional(),
    connectedInitiativeIds: z.array(z.number()).optional(),
    connectedProjectIds: z.array(z.number()).optional(),
    isDraft: z.boolean().optional(),
});

const PublicationSchema = BasePublicationSchema.refine(
    (data) => {
        const requiredFields = ['slug', 'title', 'shortDescription'];
        return requiredFields.every((field) => data[field] !== undefined && data[field] !== null && data[field] !== '');
    },
    {
        message: 'Required fields missing for publication creation: slug, title, shortDescription',
    }
).refine(
    async (data) => {
        return await checkSlugUniqueness(data.slug);
    },
    {
        message: 'A publication with this slug already exists',
        path: ['slug'],
    }
);

const UpdatePublicationSchema = z.object({
    slug: SlugSchema.optional(),
    title: TitleSchema.optional(),
    shortDescription: ShortDescriptionSchema.optional(),
    category: CategorySchema.optional(),
    publishedAt: z.string().datetime().or(z.date()).nullable().optional(),
    readTime: z.string().max(20).nullable().optional(),
    fileType: FileTypeSchema.optional(),
    fileSize: z.string().max(20).nullable().optional(),
    downloadUrl: z.string().url().nullable().optional(),
    tags: TagsSchema.optional(),
    sections: z.array(SectionSchema).max(50).optional(),
    mainImage: MainImageSchema.optional(),
    relatedPublications: z.array(z.union([z.string(), z.number()])).optional(),
    commentsEnabled: z.boolean().optional(),
    showAuthor: z.boolean().optional(),
    isDraft: z.boolean().optional(),
    connectedInitiativeIds: z.array(z.number()).optional(),
    connectedProjectIds: z.array(z.number()).optional(),
});

module.exports = {
    PublicationSchema,
    UpdatePublicationSchema,
    PaginationQuerySchema,
};
