const { z } = require('zod');

// ========================================
// BASE SCHEMAS FOR COMMON TYPES
// ========================================

const ImageSchema = z.object({
    src: z.string().nullable().optional(),
    alt: z.string().nullable().optional(),
    caption: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    size: z
        .union([z.string(), z.number(), z.null()])
        .transform((val) => {
            if (val === null || val === undefined) return null;
            if (typeof val === 'string') {
                const num = parseInt(val, 10);
                return isNaN(num) ? null : num;
            }
            return val;
        })
        .refine((val) => val === null || (typeof val === 'number' && val >= 0), 'Size must be a valid non-negative number')
        .nullable()
        .optional(),
    type: z.string().nullable().optional(),
});

const ContactSchema = z.object({
    name: z.string().nullable().optional(),
    position: z.string().nullable().optional(),
    email: z.string().email('Invalid email format').nullable().optional(),
    phone: z
        .string()
        .regex(/^\+?[\d\s\-\(\)]{8,}$/, 'Invalid phone format')
        .nullable()
        .optional(),
    image: z.string().nullable().optional(),
    isMainContact: z.boolean().nullable().optional(),
    isTeamMember: z.boolean().nullable().optional(),
    role: z.string().nullable().optional(),
});

const SectionSchema = z.object({
    titleSlug: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    content: z.any().nullable().optional(),
    order: z.number().nullable().optional(),
    images: z.array(ImageSchema).nullable().optional(),
});

const SponsorSchema = z.object({
    name: z.string().nullable().optional(),
    amount: z
        .union([z.string(), z.number(), z.null()])
        .transform((val) => {
            if (val === null) return null;
            if (typeof val === 'string') {
                const num = parseFloat(val);
                return isNaN(num) ? val : num;
            }
            return val;
        })
        .refine((val) => val === null || typeof val === 'number', 'Amount must be a valid number')
        .refine((val) => val === null || val >= 0, 'Amount must be positive')
        .refine((val) => val === null || val <= 999999999, 'Amount too large')
        .nullable()
        .optional(),
    currency: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    visible: z.boolean().nullable().optional(),
    logo: z.string().nullable().optional(),
    website: z.string().url('Invalid website URL').nullable().optional(),
    description: z.string().max(10000, 'Description too long').nullable().optional(),
});

const PartnerSchema = z.object({
    name: z.string().nullable().optional(),
    description: z.string().max(10000, 'Description too long').nullable().optional(),
    website: z.string().url('Invalid website URL').nullable().optional(),
    type: z.string().nullable().optional(),
    visible: z.boolean().nullable().optional(),
    logo: z.string().nullable().optional(),
});

const DownloadMaterialSchema = z.object({
    titleSlug: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    fileType: z.enum(['pdf', 'docx', 'xlsx', 'xls', 'csv', 'pptx', 'ppt', 'jpg', 'jpeg', 'png', 'gif', 'webp']).nullable().optional(),
    fileSize: z.string().nullable().optional(),
    downloadUrl: z.string().nullable().optional(),
    image: ImageSchema.nullable().optional(),
});

const MilestoneSchema = z.object({
    date: z.string().nullable().optional(),
    description: z.string().min(5, 'Milestone description must be at least 5 characters').nullable().optional(),
});

const SocialMediaSchema = z.object({
    facebook: z.string().url('Invalid Facebook URL').nullable().optional(),
    instagram: z.string().url('Invalid Instagram URL').nullable().optional(),
    linkedin: z.string().url('Invalid LinkedIn URL').nullable().optional(),
    twitter: z.string().url('Invalid Twitter URL').nullable().optional(),
});

// ========================================
// COMMON VALIDATION SCHEMAS
// ========================================

const SlugSchema = z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must not exceed 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .refine((slug) => !slug.startsWith('-') && !slug.endsWith('-'), 'Slug cannot start or end with hyphen')
    .refine((slug) => !slug.includes('--'), 'Slug cannot contain consecutive hyphens')
    .nullable()
    .optional();

const TitleSchema = z.string().min(3, 'Title must be at least 3 characters').nullable().optional();

const ShortDescriptionSchema = z.string().min(10, 'Short description must be at least 10 characters').nullable().optional();

const TagsSchema = z
    .array(z.string())
    .max(20, 'Maximum 20 tags allowed')
    .refine((tags) => tags.every((tag) => tag.length >= 2 && tag.length <= 30), {
        message: 'Each tag must be between 2 and 30 characters',
    })
    .nullable()
    .optional();

const MainImageSchema = z
    .object({
        src: z.string().nullable().optional(),
        alt: z.string().nullable().optional(),
        caption: z.string().nullable().optional(),
        gallery: z.array(ImageSchema).nullable().optional(),
    })
    .nullable()
    .optional();

// ========================================
// COMMON UTILITY SCHEMAS
// ========================================

const PaginationQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => {
            const num = val ? parseInt(val) : 1;
            return Math.max(1, num);
        }),
    limit: z
        .string()
        .optional()
        .transform((val) => {
            const num = val ? parseInt(val) : 6;
            return Math.max(1, num);
        }),
});

module.exports = {
    // Base schemas
    ImageSchema,
    ContactSchema,
    SectionSchema,
    SponsorSchema,
    PartnerSchema,
    DownloadMaterialSchema,
    MilestoneSchema,
    SocialMediaSchema,

    // Common validation schemas
    SlugSchema,
    TitleSchema,
    ShortDescriptionSchema,
    TagsSchema,
    MainImageSchema,

    // Utility schemas
    PaginationQuerySchema,
};
