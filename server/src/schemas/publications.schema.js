const { z } = require('zod');
const { SectionSchema, SlugSchema, TitleSchema, ShortDescriptionSchema, TagsSchema, MainImageSchema, PaginationQuerySchema } = require('./common.schema');

// Publication-specific schemas
const FileTypeSchema = z.enum(['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'zip', 'rar'], {
    errorMap: () => ({ message: 'Invalid file type' }),
});

const CategorySchema = z.enum(['research', 'guide', 'report', 'manual', 'presentation', 'other'], {
    errorMap: () => ({ message: 'Invalid category' }),
});

// Base schema with all fields optional for flexibility
const BasePublicationSchema = z
    .object({
        // Basic info
        slug: SlugSchema,
        title: TitleSchema,
        titleSlug: z.string().nullable().optional(),
        shortDescription: ShortDescriptionSchema,

        // Publication metadata
        category: CategorySchema.nullable().optional(),
        publishedAt: z
            .string()
            .datetime('Invalid date format')
            .or(z.date())
            .transform((val) => (typeof val === 'string' ? val : val.toISOString()))
            .nullable()
            .optional(),
        readTime: z.string().max(20, 'Read time too long').nullable().optional(),

        // File information
        fileType: FileTypeSchema.nullable().optional(),
        fileSize: z.string().max(20, 'File size string too long').nullable().optional(),
        downloadUrl: z.string().url('Invalid download URL').nullable().optional(),

        // Content
        tags: TagsSchema,
        sections: z.array(SectionSchema).max(50, 'Maximum 50 sections allowed').nullable().optional(),
        mainImage: MainImageSchema,

        // Related content
        relatedPublications: z
            .array(z.union([z.string(), z.number()]))
            .transform((val) => {
                if (!val) return [];
                return val.map((id) => (typeof id === 'string' ? parseInt(id, 10) : id));
            })
            .refine((val) => val.every((id) => !isNaN(id) && id > 0), 'All publication IDs must be valid positive numbers')
            .nullable()
            .optional(),

        // Settings
        commentsEnabled: z.boolean().default(true).nullable().optional(),
    })
    .refine(
        (data) => {
            // If downloadUrl is provided, fileType and fileSize should also be provided
            if (data?.downloadUrl && (!data?.fileType || !data?.fileSize)) {
                return false;
            }
            return true;
        },
        {
            message: 'File type and size are required when download URL is provided',
            path: ['fileType'],
        }
    )
    .refine(
        (data) => {
            // If any file-related field is provided, all should be provided
            const fileFields = [data?.fileType, data?.fileSize, data?.downloadUrl];
            const providedFields = fileFields.filter((field) => field !== undefined && field !== null);

            if (providedFields.length > 0 && providedFields.length !== 3) {
                return false;
            }
            return true;
        },
        {
            message: 'All file-related fields (fileType, fileSize, downloadUrl) must be provided together',
            path: ['downloadUrl'],
        }
    );

// For creation - require minimal fields
const PublicationSchema = BasePublicationSchema.refine(
    (data) => {
        const requiredFields = ['slug', 'title', 'shortDescription'];
        return requiredFields.every((field) => data[field] !== undefined && data[field] !== null && data[field] !== '');
    },
    {
        message: 'Required fields missing for publication creation: slug, title, shortDescription',
    }
);

// For updates - everything is optional
const UpdatePublicationSchema = BasePublicationSchema;

module.exports = {
    PublicationSchema,
    UpdatePublicationSchema,
    PaginationQuerySchema,
};
