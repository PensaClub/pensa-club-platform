const { z } = require('zod');

const phoneRegex = /^(?:\+\d{7,15}|\d{10})$/;

const adminLookupSchema = z.object({
    email: z.string().email('Invalid email format.').min(1, 'Email is required.'),
});

// Helper: trim and convert empty strings to null so optional() works correctly.
// Without this, an empty string "" passes through min(3) and fails validation,
// even though the user clearly meant "no value".
const optionalName = z
    .preprocess(
        (val) => {
            if (val === undefined || val === null) return null;
            const trimmed = String(val).trim();
            return trimmed === '' ? null : trimmed;
        },
        z.string().min(3, 'Name must be at least 3 characters.').max(20, 'Name must be at most 20 characters.').nullable()
    );

const adminInviteSchema = z.object({
    email: z.string().email('Invalid email format.').min(1, 'Email is required.'),
    firstName: optionalName,
    lastName: optionalName,
});

const adminSendResetSchema = z.object({
    email: z.string().email('Invalid email format.').min(1, 'Email is required.'),
    phone: z.string().regex(phoneRegex, 'Invalid phone number.').nullable().optional(),
    sendSms: z.boolean().default(true),
});

// Shared base for filter fields (used by both list and export)
const auditLogFiltersBase = {
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    adminId: z.coerce.number().int().optional(),
    adminEmail: z.string().optional(),
    targetEmail: z.string().optional(),
    actionType: z.enum([
        'lookup_user',
        'invite_user',
        'send_reset_link',
        'reset_completed',
        'reset_failed',
    ]).optional(),
    success: z.coerce.boolean().optional(),
};

// List endpoint — max 100 per page (for paginated UI)
const auditLogQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    ...auditLogFiltersBase,
});

// Export endpoint — allows up to 5000 records in a single PDF
const auditLogExportSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(5000).default(5000),
    format: z.enum(['pdf']).optional(),
    ...auditLogFiltersBase,
});

module.exports = {
    adminLookupSchema,
    adminInviteSchema,
    adminSendResetSchema,
    auditLogQuerySchema,
    auditLogExportSchema,
};
