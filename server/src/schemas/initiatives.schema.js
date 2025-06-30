const { z } = require('zod');

// Base schemas for common types
const ImageSchema = z.object({
    src: z.string().nullable().optional(),
    alt: z.string().nullable().optional(),
    caption: z.string().nullable().optional(),
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
    title: z.string().min(1, 'Section title is required').nullable().optional(),
    content: z.any().nullable().optional(),
    order: z.number().nullable().optional(),
    images: z.array(ImageSchema).nullable().optional(),
});

const SponsorSchema = z.object({
    name: z.string().min(1, 'Sponsor name is required').nullable().optional(),
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
    name: z.string().min(1, 'Partner name is required').nullable().optional(),
    description: z.string().max(10000, 'Description too long').nullable().optional(),
    website: z.string().url('Invalid website URL').nullable().optional(),
    type: z.string().nullable().optional(),
    visible: z.boolean().nullable().optional(),
    logo: z.string().nullable().optional(),
});

const DownloadMaterialSchema = z.object({
    titleSlug: z.string().nullable().optional(),
    title: z.string().min(1, 'Document title is required').nullable().optional(),
    description: z.string().nullable().optional(),
    fileType: z.enum(['pdf', 'docx']).nullable().optional(),
    fileSize: z.string().nullable().optional(),
    downloadUrl: z.string().nullable().optional(),
    image: ImageSchema.nullable().optional(),
});

const MilestoneSchema = z.object({
    date: z.string().min(1, 'Milestone date is required').nullable().optional(),
    description: z.string().min(5, 'Milestone description must be at least 5 characters').nullable().optional(),
});

const KPISchema = z.object({
    name: z.string().min(1, 'KPI name is required').nullable().optional(),
    target: z.string().min(1, 'KPI target is required').nullable().optional(),
});

const FAQSchema = z.object({
    question: z.string().min(5, 'Question must be at least 5 characters').max(200, 'Question too long').nullable().optional(),
    answer: z.string().min(10, 'Answer must be at least 10 characters').max(5000, 'Answer too long').nullable().optional(),
});

const SocialMediaSchema = z.object({
    facebook: z.string().url('Invalid Facebook URL').nullable().optional(),
    instagram: z.string().url('Invalid Instagram URL').nullable().optional(),
    linkedin: z.string().url('Invalid LinkedIn URL').nullable().optional(),
    twitter: z.string().url('Invalid Twitter URL').nullable().optional(),
});

const OrganizationSchema = z.object({
    name: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    website: z.string().url('Invalid organization website URL').nullable().optional(),
});

// Base schema with all fields optional for flexibility
const BaseInitiativeSchema = z
    .object({
        // Basic info
        slug: z
            .string()
            .min(3, 'Slug must be at least 3 characters')
            .max(100, 'Slug must not exceed 100 characters')
            .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
            .refine((slug) => !slug.startsWith('-') && !slug.endsWith('-'), 'Slug cannot start or end with hyphen')
            .refine((slug) => !slug.includes('--'), 'Slug cannot contain consecutive hyphens')
            .nullable()
            .optional(),

        title: z.string().min(3, 'Title must be at least 3 characters').nullable().optional(),

        shortDescription: z.string().min(10, 'Short description must be at least 10 characters').nullable().optional(),

        detailedDescription: z
            .any()
            .refine((content) => {
                if (!content || content === null) return true;
                const textLength = JSON.stringify(content).length;
                return textLength <= 50000;
            }, 'Detailed description too long')
            .nullable()
            .optional(),

        category: z.string().nullable().optional(),
        customCategory: z.string().nullable().optional(),
        priority: z.enum(['Low', 'Medium', 'High']).nullable().optional(),

        // Location
        location: z
            .object({
                address: z.string().nullable().optional(),
                coordinates: z
                    .object({
                        lat: z.number().nullable().optional(),
                        lng: z.number().nullable().optional(),
                    })
                    .nullable()
                    .optional(),
            })
            .refine(
                (data) => {
                    if (!data) return true; // Allow null/undefined
                    return data.address || (data.coordinates?.lat && data.coordinates?.lng);
                },
                {
                    message: 'Location is required (either address or coordinates)',
                }
            )
            .nullable()
            .optional(),

        // Status and campaign
        status: z.enum(['in-progress', 'active', 'planned', 'completed']).nullable().optional(),
        campaignStatus: z.enum(['open', 'closed']).nullable().optional(),

        // Dates and milestones
        startDate: z.string().min(1, 'Start date is required').nullable().optional(),
        endDate: z.string().nullable().optional(),
        timestamp: z
            .union([z.string(), z.date(), z.null()])
            .transform((val) => {
                if (val === null) return null;
                if (typeof val === 'string') {
                    const date = new Date(val);
                    return isNaN(date.getTime()) ? val : date;
                }
                return val;
            })
            .refine((val) => val === null || val instanceof Date || val === undefined, 'Invalid date format')
            .nullable()
            .optional(),
        duration: z.union([z.string(), z.number()]).nullable().optional(),
        milestones: z.array(MilestoneSchema).nullable().optional(),

        // Target audience
        targetAge: z.array(z.string()).min(1, 'Target age is required').nullable().optional(),
        targetAudience: z.array(z.string()).nullable().optional(),
        customAudience: z.string().min(5, 'Custom audience must be at least 5 characters').nullable().optional(),

        // Budget and funding
        expectedBudget: z
            .union([z.string(), z.number(), z.null()])
            .transform((val) => {
                if (val === null) return null;
                if (typeof val === 'string') {
                    const num = parseFloat(val);
                    return isNaN(num) ? val : num;
                }
                return val;
            })
            .refine((val) => val === null || typeof val === 'number', 'Budget must be a valid number')
            .refine((val) => val === null || val >= 0, 'Budget must be positive')
            .refine((val) => val === null || val <= 999999999, 'Budget too large')
            .nullable()
            .optional(),
        currency: z.enum(['BGN', 'EUR', 'USD', 'GBP']).nullable().optional(),
        fundingSources: z.array(z.string()).nullable().optional(),

        // Organization and contact
        organization: OrganizationSchema.nullable().optional(),
        logo: z.string().nullable().optional(),
        contactEmail: z.string().email('Invalid contact email').nullable().optional(),
        contactPhone: z
            .string()
            .regex(/^\+?[\d\s\-\(\)]{8,}$/, 'Invalid contact phone')
            .nullable()
            .optional(),

        // Social media and content
        socialMedia: SocialMediaSchema.nullable().optional(),
        kpis: z.array(KPISchema).nullable().optional(),
        expectedResults: z
            .any()
            .refine((content) => {
                if (!content || content === null) return true;
                const textLength = JSON.stringify(content).length;
                return textLength <= 10000;
            }, 'Expected results too long')
            .nullable()
            .optional(),
        progressReport: z
            .any()
            .refine((content) => {
                if (!content || content === null) return true;
                const textLength = JSON.stringify(content).length;
                return textLength <= 10000;
            }, 'Progress report too long')
            .nullable()
            .optional(),
        impactMetrics: z.array(z.any()).nullable().optional(),
        testimonials: z.array(z.any()).nullable().optional(),
        faq: z.array(FAQSchema).nullable().optional(),
        tags: z
            .array(z.string())
            .max(20, 'Maximum 20 tags allowed')
            .refine((tags) => tags.every((tag) => tag.length >= 2 && tag.length <= 30), {
                message: 'Each tag must be between 2 and 30 characters',
            })
            .nullable()
            .optional(),
        commentsEnabled: z.boolean().nullable().optional(),
        isDraft: z.boolean().nullable().optional(),
        gallery: z.array(z.any()).nullable().optional(),

        mainImage: z
            .object({
                src: z.string().min(1, 'Main image is required').nullable().optional(),
                alt: z.string().nullable().optional(),
                caption: z.string().nullable().optional(),
                gallery: z.array(ImageSchema).nullable().optional(),
            })
            .nullable()
            .optional(),

        contact: ContactSchema.nullable().optional(),
        additionalContacts: z.array(ContactSchema).nullable().optional(),
        responsible: ContactSchema.nullable().optional(),

        sections: z.array(SectionSchema).min(1, 'At least one section is required').nullable().optional(),

        sponsors: z.array(SponsorSchema).nullable().optional(),
        partners: z.array(PartnerSchema).nullable().optional(),
        downloadMaterials: z.array(DownloadMaterialSchema).nullable().optional(),
        documents: z.array(DownloadMaterialSchema).nullable().optional(),
    })
    .refine(
        (data) => {
            if (data?.expectedBudget && !data?.currency) {
                return false;
            }
            return true;
        },
        {
            message: 'Currency is required when budget is provided',
            path: ['currency'],
        }
    )
    .refine(
        (data) => {
            if (data?.startDate && data?.endDate) {
                return new Date(data.startDate) < new Date(data.endDate);
            }
            return true;
        },
        {
            message: 'End date must be after start date',
            path: ['endDate'],
        }
    );

const InitiativeSchema = BaseInitiativeSchema.refine(
    (data) => {
        const requiredFields = ['slug', 'title', 'shortDescription', 'mainImage', 'sections', 'targetAge', 'startDate'];
        return requiredFields.every((field) => data[field] !== undefined && data[field] !== null && data[field] !== '');
    },
    {
        message: 'Required fields missing for initiative creation',
    }
);

// For updates - everything is optional
const UpdateInitiativeSchema = BaseInitiativeSchema;

// Pagination query parameters
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
    InitiativeSchema,
    UpdateInitiativeSchema,
    PaginationQuerySchema,
    ContactSchema,
    SectionSchema,
    SponsorSchema,
    PartnerSchema,
    DownloadMaterialSchema,
    MilestoneSchema,
    KPISchema,
    FAQSchema,
    SocialMediaSchema,
    OrganizationSchema,
    ImageSchema,
};