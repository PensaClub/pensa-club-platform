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
    ImageSchema,
    PaginationQuerySchema,
    LocationSchema,
} = require('./common.schema');

// Project-specific schemas
const BudgetSchema = z
    .object({
        total: z.number().min(0, 'Total budget must be positive').max(999999999, 'Budget too large').nullable().optional(),
        currency: z.enum(['BGN', 'EUR', 'USD', 'GBP']).nullable().optional(),
        funded: z.number().min(0, 'Funded amount must be positive').max(999999999, 'Funded amount too large').nullable().optional(),
        goal: z.number().min(0, 'Goal amount must be positive').max(999999999, 'Goal amount too large').nullable().optional(),
    })
    .refine(
        (data) => {
            if (data?.total && !data?.currency) {
                return false;
            }
            return true;
        },
        {
            message: 'Currency is required when total budget is provided',
            path: ['currency'],
        }
    );

const TimelineSchema = z
    .object({
        startDate: z.string().min(1, 'Start date is required').nullable().optional(),
        endDate: z.string().nullable().optional(),
        estimatedDuration: z.string().nullable().optional(),
    })
    .refine(
        (data) => {
            if (data?.startDate && data?.endDate) {
                const startDate = new Date(data.startDate);
                const endDate = new Date(data.endDate);
                return startDate < endDate;
            }
            return true;
        },
        {
            message: 'End date must be after start date',
            path: ['endDate'],
        }
    );

// Individual beneficiary schema
const BeneficiaryItemSchema = z.object({
    id: z.string().min(1, 'Beneficiary ID is required').optional(),
    firstName: z.string().min(1, 'First name is required').max(100, 'First name too long').optional(),
    lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long').optional(),
    email: z.string().email('Invalid email format').nullable().optional(),
    profileImage: z.string().nullable().optional(),
    amountReceived: z.number().min(0, 'Amount must be positive').max(999999999, 'Amount too large').nullable().optional(),
    dateAdded: z.string().nullable().optional(),
    status: z.enum(['active', 'completed']).nullable().optional(),
    phone: z.string().nullable().optional(),
    age: z.number().min(0, 'Age must be positive').max(150, 'Invalid age').nullable().optional(),
    location: z.string().nullable().optional(),
    notes: z.string().max(1000, 'Notes too long').nullable().optional(),
});

// Beneficiaries schema
const BeneficiariesSchema = z
    .object({
        totalCount: z.number().min(0, 'Total count must be positive').max(999999, 'Total count too large').optional(),
        totalAmountDistributed: z.number().min(0, 'Total amount must be positive').max(999999999, 'Total amount too large').optional(),
        currency: z.string().min(1, 'Currency is required').max(10, 'Currency too long').optional(),
        list: z.array(BeneficiaryItemSchema).max(1000, 'Too many beneficiaries').optional(),
    })
    .optional();

// Base schema with all fields optional for flexibility
const BaseProjectSchema = z
    .object({
        // Basic info
        slug: SlugSchema,
        title: TitleSchema,
        shortDescription: ShortDescriptionSchema,

        fullDescription: z
            .any()
            .refine((content) => {
                if (!content || content === null) return true;
                const textLength = JSON.stringify(content).length;
                return textLength <= 50000;
            }, 'Full description too long')
            .nullable()
            .optional(),

        category: z.string().nullable().optional(),
        priority: z.enum(['low', 'medium', 'high']).nullable().optional(),

        // Status
        status: z.enum(['in-progress', 'active', 'planned', 'completed']).nullable().optional(),

        // Budget and timeline
        budget: BudgetSchema.nullable().optional(),
        timeline: TimelineSchema.nullable().optional(),

        // Location
        location: z.array(LocationSchema).nullable().optional(),

        // Application fields
        applicationStatus: z.enum(['open', 'closed']).nullable().optional(),
        applicationDeadline: z
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
        maxParticipants: z
            .union([z.string(), z.number(), z.null()])
            .transform((val) => {
                if (val === null) return null;
                const num = typeof val === 'string' ? parseInt(val) : val;
                return isNaN(num) ? null : num;
            })
            .refine((val) => val === null || (typeof val === 'number' && val > 0), 'Max participants must be a positive number')
            .nullable()
            .optional(),
        currentParticipants: z
            .union([z.string(), z.number(), z.null()])
            .transform((val) => {
                if (val === null) return null;
                const num = typeof val === 'string' ? parseInt(val) : val;
                return isNaN(num) ? null : num;
            })
            .refine((val) => val === null || (typeof val === 'number' && val >= 0), 'Current participants must be a non-negative number')
            .nullable()
            .optional(),
        participantRequirements: z.array(z.string()).nullable().optional(),

        // Content and media
        tags: TagsSchema,
        commentsEnabled: z.boolean().nullable().optional(),
        logo: z.string().nullable().optional(),

        // Related entities
        mainImage: MainImageSchema,
        gallery: z.array(ImageSchema).nullable().optional(),

        contact: ContactSchema.nullable().optional(),
        team: z.array(ContactSchema).nullable().optional(),

        sections: z.array(SectionSchema).nullable().optional(),

        sponsors: z.array(SponsorSchema).nullable().optional(),
        partners: z.array(PartnerSchema).nullable().optional(),
        downloadMaterials: z.array(DownloadMaterialSchema).nullable().optional(),
        documents: z.array(DownloadMaterialSchema).nullable().optional(),
        milestones: z.array(MilestoneSchema).nullable().optional(),

        // Social media and content
        socialMedia: SocialMediaSchema.nullable().optional(),

        // Beneficiaries
        beneficiaries: BeneficiariesSchema.nullable().optional(),
    })
    .refine(
        (data) => {
            if (data?.maxParticipants && data?.currentParticipants) {
                return data.currentParticipants <= data.maxParticipants;
            }
            return true;
        },
        {
            message: 'Current participants cannot exceed max participants',
            path: ['currentParticipants'],
        }
    );

const ProjectSchema = BaseProjectSchema.refine(
    (data) => {
        const requiredFields = ['slug', 'title'];
        return requiredFields.every((field) => data[field] !== undefined && data[field] !== null && data[field] !== '');
    },
    {
        message: 'Required fields missing for project creation',
    }
);

// For updates - everything is optional
const UpdateProjectSchema = BaseProjectSchema;

// Project application schema
const ProjectApplicationSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    email: z.string().email('Invalid email format'),
    phone: z
        .string()
        .regex(/^\+?[\d\s\-\(\)]{8,}$/, 'Invalid phone format')
        .nullable()
        .optional(),
    isAnonymous: z.boolean().default(false),
});

module.exports = {
    ProjectSchema,
    UpdateProjectSchema,
    ProjectApplicationSchema,
    PaginationQuerySchema,
};
