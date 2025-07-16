const { z } = require('zod');
const { SectionSchema, SlugSchema, TitleSchema, ShortDescriptionSchema, TagsSchema, MainImageSchema, PaginationQuerySchema } = require('./common.schema');

const FileTypeSchema = z.enum(['pdf', 'docx', 'xlsx', 'xls', 'csv', 'pptx', 'ppt', 'jpg', 'jpeg', 'png', 'gif', 'webp']).optional();
const CategorySchema = z.enum(['research', 'guide', 'report', 'manual', 'presentation', 'other']).optional();

const BasePublicationSchema = z.object({
    // Basic info
    slug: SlugSchema,
    title: TitleSchema,
    shortDescription: ShortDescriptionSchema,

    // Optional fields
    titleSlug: z.string().optional(),
    category: CategorySchema,
    publishedAt: z.string().datetime().or(z.date()).optional(),
    readTime: z.string().max(20).optional(),
    fileType: FileTypeSchema,
    fileSize: z.string().max(20).optional(),
    downloadUrl: z.string().url().optional(),
    tags: TagsSchema,
    sections: z.array(SectionSchema).max(50).optional(),
    mainImage: MainImageSchema,
    relatedPublications: z.array(z.union([z.string(), z.number()])).optional(),
    commentsEnabled: z.boolean().default(true).optional(),
});

const PublicationSchema = BasePublicationSchema.refine(
    (data) => {
        const requiredFields = ['slug', 'title', 'shortDescription'];
        return requiredFields.every((field) => data[field] !== undefined && data[field] !== null && data[field] !== '');
    },
    {
        message: 'Required fields missing for publication creation: slug, title, shortDescription',
    }
);

const UpdatePublicationSchema = z.object({
    // All fields optional for partial updates
    slug: SlugSchema.optional(),
    title: TitleSchema.optional(),
    titleSlug: z.string().optional(),
    shortDescription: ShortDescriptionSchema.optional(),
    category: CategorySchema.optional(),
    publishedAt: z.string().datetime().or(z.date()).optional(),
    readTime: z.string().max(20).optional(),
    fileType: FileTypeSchema.optional(),
    fileSize: z.string().max(20).optional(),
    downloadUrl: z.string().url().optional(),
    tags: TagsSchema.optional(),
    sections: z.array(SectionSchema).max(50).optional(),
    mainImage: MainImageSchema.optional(),
    relatedPublications: z.array(z.union([z.string(), z.number()])).optional(),
    commentsEnabled: z.boolean().optional(),
});

module.exports = {
    PublicationSchema,
    UpdatePublicationSchema,
    PaginationQuerySchema,
};
