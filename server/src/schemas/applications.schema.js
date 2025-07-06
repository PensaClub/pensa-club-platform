const { z } = require('zod');

const ApplicationStatusSchema = z.enum(['pending', 'approved', 'rejected', 'interview']);

const CreateApplicationSchema = z.object({
    projectId: z.number().int().positive('Project ID must be a positive integer'),
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

const UpdateApplicationSchema = z.object({
    status: ApplicationStatusSchema.optional(),
});

const ApplicationIdSchema = z.object({
    applicationId: z.string().regex(/^\d+$/, 'Application ID must be a number'),
});

const EmailRecipientSchema = z.object({
    applicationId: z.number().int().positive().optional(),
    email: z.string().email('Invalid email format'),
    subject: z.string().min(1, 'Subject is required'),
    message: z.string().min(1, 'Message is required'),
    updateStatus: ApplicationStatusSchema.optional(),
});

const SendEmailsSchema = z.object({
    emails: z.array(EmailRecipientSchema).min(1, 'At least one email recipient is required'),
});

module.exports = {
    CreateApplicationSchema,
    UpdateApplicationSchema,
    ApplicationIdSchema,
    SendEmailsSchema,
    ApplicationStatusSchema,
};
