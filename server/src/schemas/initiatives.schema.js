const { z } = require('zod');

// Base schemas for common types
const ImageSchema = z.object({
    src: z.string().nullable().optional(),
    alt: z.string().nullable().optional(),
    caption: z.string().nullable().optional(),
});

const ContactSchema = z.object({
    name: z.string().optional(),
    position: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
    phone: z
        .string()
        .regex(/^\+?[\d\s\-\(\)]{8,}$/, 'Invalid phone format')
        .optional(),
    image: z.string().optional(),
    isMainContact: z.boolean().optional(),
    isTeamMember: z.boolean().optional(),
    role: z.string().optional(),
});

const SectionSchema = z.object({
    titleSlug: z.string().optional(),
    title: z.string().min(1, 'Section title is required').optional(),
    content: z.any().optional(),
    order: z.number().optional(),
    images: z.array(ImageSchema).optional(),
});

const SponsorSchema = z.object({
    name: z.string().min(1, 'Sponsor name is required').optional(),
    amount: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (typeof val === 'string') {
                const num = parseFloat(val);
                return isNaN(num) ? val : num;
            }
            return val;
        })
        .refine((val) => typeof val === 'number', 'Amount must be a valid number')
        .refine((val) => val >= 0, 'Amount must be positive')
        .refine((val) => val <= 999999999, 'Amount too large')
        .optional(),
    currency: z.string().optional(),
    type: z.string().optional(),
    visible: z.boolean().optional(),
    logo: z.string().optional(),
    website: z.string().url('Invalid website URL').optional(),
    description: z.string().max(10000, 'Description too long').optional(),
});

const PartnerSchema = z.object({
    name: z.string().min(1, 'Partner name is required').optional(),
    description: z.string().max(10000, 'Description too long').optional(),
    website: z.string().url('Invalid website URL').optional(),
    type: z.string().optional(),
    visible: z.boolean().optional(),
    logo: z.string().optional(),
});

const DownloadMaterialSchema = z.object({
    titleSlug: z.string().optional(),
    title: z.string().min(1, 'Document title is required').optional(),
    description: z.string().optional(),
    fileType: z.enum(['pdf', 'docx']).optional(),
    fileSize: z.string().optional(),
    downloadUrl: z.string().nullable().optional(),
    image: ImageSchema.optional(),
});

const MilestoneSchema = z.object({
    date: z.string().min(1, 'Milestone date is required').optional(),
    description: z.string().min(5, 'Milestone description must be at least 5 characters').optional(),
});

const KPISchema = z.object({
    name: z.string().min(1, 'KPI name is required').optional(),
    target: z.string().min(1, 'KPI target is required').optional(),
});

const FAQSchema = z.object({
    question: z.string().min(5, 'Question must be at least 5 characters').max(200, 'Question too long').optional(),
    answer: z.string().min(10, 'Answer must be at least 10 characters').max(5000, 'Answer too long').optional(),
});

const SocialMediaSchema = z.object({
    facebook: z.string().url('Invalid Facebook URL').optional(),
    instagram: z.string().url('Invalid Instagram URL').optional(),
    linkedin: z.string().url('Invalid LinkedIn URL').optional(),
    twitter: z.string().url('Invalid Twitter URL').optional(),
});

const OrganizationSchema = z.object({
    website: z.string().url('Invalid organization website URL').optional(),
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
            .optional(),

        title: z.string().min(3, 'Title must be at least 3 characters').optional(),

        shortDescription: z.string().min(10, 'Short description must be at least 10 characters').optional(),

        detailedDescription: z
            .any()
            .refine((content) => {
                if (!content) return true;
                const textLength = JSON.stringify(content).length;
                return textLength <= 50000;
            }, 'Detailed description too long')
            .optional(),

        category: z.string().optional(),
        customCategory: z.string().optional(),
        priority: z.enum(['Low', 'Medium', 'High']).optional(),

        // Location
        location: z
            .object({
                address: z.string().optional(),
                coordinates: z
                    .object({
                        lat: z.number().optional(),
                        lng: z.number().optional(),
                    })
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
            .optional(),

        // Status and campaign
        status: z.enum(['in-progress', 'active', 'planned', 'completed']).optional(),
        campaignStatus: z.enum(['open', 'closed']).optional(),

        // Dates and milestones
        startDate: z.string().min(1, 'Start date is required').optional(),
        endDate: z.string().optional(),
        timestamp: z
            .union([z.string(), z.date()])
            .transform((val) => {
                if (typeof val === 'string') {
                    const date = new Date(val);
                    return isNaN(date.getTime()) ? val : date;
                }
                return val;
            })
            .refine((val) => val instanceof Date || val === undefined, 'Invalid date format')
            .optional(),
        duration: z.string().optional(),
        milestones: z.array(MilestoneSchema).optional(),

        // Target audience
        targetAge: z.array(z.string()).min(1, 'Target age is required').optional(),
        targetAudience: z.array(z.string()).optional(),
        customAudience: z.string().min(5, 'Custom audience must be at least 5 characters').optional(),

        // Budget and funding
        expectedBudget: z
            .union([z.string(), z.number()])
            .transform((val) => {
                if (typeof val === 'string') {
                    const num = parseFloat(val);
                    return isNaN(num) ? val : num;
                }
                return val;
            })
            .refine((val) => typeof val === 'number', 'Budget must be a valid number')
            .refine((val) => val >= 0, 'Budget must be positive')
            .refine((val) => val <= 999999999, 'Budget too large')
            .optional(),
        currency: z.enum(['BGN', 'EUR', 'USD', 'GBP']).optional(),
        fundingSources: z.array(z.string()).optional(),

        // Organization and contact
        organization: OrganizationSchema.optional(),
        logo: z.string().optional(),
        contactEmail: z.string().email('Invalid contact email').optional(),
        contactPhone: z
            .string()
            .regex(/^\+?[\d\s\-\(\)]{8,}$/, 'Invalid contact phone')
            .optional(),

        // Social media and content
        socialMedia: SocialMediaSchema.optional(),
        kpis: z.array(KPISchema).optional(),
        expectedResults: z
            .any()
            .refine((content) => {
                if (!content) return true;
                const textLength = JSON.stringify(content).length;
                return textLength <= 10000;
            }, 'Expected results too long')
            .optional(),
        progressReport: z
            .any()
            .refine((content) => {
                if (!content) return true;
                const textLength = JSON.stringify(content).length;
                return textLength <= 10000;
            }, 'Progress report too long')
            .optional(),
        impactMetrics: z.array(z.any()).optional(),
        testimonials: z.array(z.any()).optional(),
        faq: z.array(FAQSchema).optional(),
        tags: z
            .array(z.string())
            .max(20, 'Maximum 20 tags allowed')
            .refine((tags) => tags.every((tag) => tag.length >= 2 && tag.length <= 30), {
                message: 'Each tag must be between 2 and 30 characters',
            })
            .optional(),
        commentsEnabled: z.boolean().optional(),
        isDraft: z.boolean().optional(),
        gallery: z.array(z.any()).optional(),

        mainImage: z
            .object({
                src: z.string().min(1, 'Main image is required').optional(),
                alt: z.string().optional(),
                caption: z.string().nullable().optional(),
                gallery: z.array(ImageSchema).optional(),
            })
            .optional(),

        contact: ContactSchema.optional(),
        additionalContacts: z.array(ContactSchema).optional(),
        responsible: ContactSchema.optional(),

        sections: z.array(SectionSchema).min(1, 'At least one section is required').optional(),

        sponsors: z.array(SponsorSchema).optional(),
        partners: z.array(PartnerSchema).optional(),
        downloadMaterials: z.array(DownloadMaterialSchema).optional(),
        documents: z.array(DownloadMaterialSchema).optional(),
    })
    .refine(
        (data) => {
            if (data.expectedBudget && !data.currency) {
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
            if (data.startDate && data.endDate) {
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
        return requiredFields.every((field) => data[field] !== undefined && data[field] !== null);
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
