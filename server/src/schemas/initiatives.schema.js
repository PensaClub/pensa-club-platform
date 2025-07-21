const { z } = require('zod');
const {
    ContactSchema,
    SectionSchema,
    SponsorSchema,
    PartnerSchema,
    DownloadMaterialSchema,
    MilestoneSchema,
    SocialMediaSchema,
    SlugSchema,
    TitleSchema,
    ShortDescriptionSchema,
    TagsSchema,
    MainImageSchema,
    PaginationQuerySchema,
} = require('./common.schema');

// Initiative-specific schemas
const KPISchema = z.object({
    name: z.string().min(1, 'KPI name is required').nullable().optional(),
    target: z.string().min(1, 'KPI target is required').nullable().optional(),
});

const FAQSchema = z.object({
    question: z.string().min(5, 'Question must be at least 5 characters').max(200, 'Question too long').nullable().optional(),
    answer: z.string().min(10, 'Answer must be at least 10 characters').max(5000, 'Answer too long').nullable().optional(),
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
        slug: SlugSchema,
        title: TitleSchema,
        shortDescription: ShortDescriptionSchema,

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
        startDate: z.string().nullable().optional(),
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
        targetAge: z.array(z.string()).nullable().optional(),
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
        tags: TagsSchema,
        commentsEnabled: z.boolean().nullable().optional(),
        isDraft: z.boolean().nullable().optional(),
        gallery: z.array(z.any()).nullable().optional(),
        projects: z
            .array(
                z.object({
                    titleSlug: z.string().nullable().optional(),
                    slug: z.string().nullable().optional(),
                    title: z.string().nullable().optional(),
                    description: z.string().nullable().optional(),
                    status: z.enum(['in-progress', 'active', 'planned', 'completed']).nullable().optional(),
                    image: z.string().url('Invalid image URL').nullable().optional(),
                    link: z.string().nullable().optional(),
                    coordinates: z
                        .object({
                            lat: z.number().nullable().optional(),
                            lng: z.number().nullable().optional(),
                        })
                        .nullable()
                        .optional(),
                })
            )
            .nullable()
            .optional(),

        mainImage: MainImageSchema,

        contact: ContactSchema.nullable().optional(),
        additionalContacts: z.array(ContactSchema).nullable().optional(),
        responsible: ContactSchema.nullable().optional(),

        sections: z.array(SectionSchema).nullable().optional(),

        sponsors: z.array(SponsorSchema).nullable().optional(),
        partners: z.array(PartnerSchema).nullable().optional(),
        downloadMaterials: z.array(DownloadMaterialSchema).nullable().optional(),
        documents: z.array(DownloadMaterialSchema).nullable().optional(),
        relatedInitiatives: z
            .array(z.union([z.string(), z.number()]))
            .transform((val) => {
                if (!val) return [];
                return val.map((id) => (typeof id === 'string' ? parseInt(id, 10) : id));
            })
            .refine((val) => val.every((id) => !isNaN(id) && id > 0), 'All initiative IDs must be valid positive numbers')
            .nullable()
            .optional(),

        publishedAt: z.union([z.string().datetime(), z.null()]).optional(),
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
        const requiredFields = ['slug', 'title', 'shortDescription'];
        return requiredFields.every((field) => data[field] !== undefined && data[field] !== null && data[field] !== '');
    },
    {
        message: 'Required fields missing for initiative creation',
    }
);

// For updates - everything is optional
const UpdateInitiativeSchema = BaseInitiativeSchema;

module.exports = {
    InitiativeSchema,
    UpdateInitiativeSchema,
    PaginationQuerySchema,
};
