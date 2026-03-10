const { z } = require('zod');

// Public: submit a signal (no auth required)
const createSignalSchema = z.object({
  claimText: z
    .string()
    .min(10, { message: 'Claim text must be at least 10 characters.' })
    .max(2000, { message: 'Claim text must be less than 2000 characters.' }),
  sourceType: z.enum(
    ['website', 'internet', 'newspapers', 'news_tv', 'friends', 'email', 'phone', 'anonymous_call', 'other'],
    { message: 'Source type must be a valid option.' }
  ),
  city: z
    .string()
    .max(100, { message: 'City must be less than 100 characters.' })
    .optional()
    .or(z.literal('')),
  reporterEmail: z
    .string()
    .email({ message: 'Invalid email format.' })
    .optional()
    .or(z.literal('')),
  isConfidential: z.boolean().default(false),
  notes: z
    .string()
    .max(1000, { message: 'Notes must be less than 1000 characters.' })
    .optional()
    .or(z.literal('')),
});

// Admin: create a fact-check module
const createModuleSchema = z.object({
  verdict: z.enum(['false', 'misleading', 'partially_true', 'true'], {
    message: 'Verdict must be one of: false, misleading, partially_true, true',
  }),
  category: z
    .string()
    .min(2, { message: 'Category must be at least 2 characters.' })
    .max(100, { message: 'Category must be less than 100 characters.' }),
  claimText: z
    .string()
    .min(10, { message: 'Claim text must be at least 10 characters.' })
    .max(5000, { message: 'Claim text must be less than 5000 characters.' }),
  verification: z
    .string()
    .min(10, { message: 'Verification must be at least 10 characters.' }),
  sourceUrl: z
    .string()
    .url({ message: 'Source URL must be a valid URL.' })
    .optional()
    .or(z.literal('')),
  sourceName: z
    .string()
    .max(200, { message: 'Source name must be less than 200 characters.' })
    .optional()
    .or(z.literal('')),
  whySpreads: z
    .string()
    .min(10, { message: 'Why spreads must be at least 10 characters.' }),
  howToReact: z
    .string()
    .min(10, { message: 'How to react must be at least 10 characters.' }),
  pdfUrl: z.string().optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'hidden']).default('draft'),
});

// Admin: update a module (partial)
const updateModuleSchema = createModuleSchema.partial();

// Admin: update a signal
const updateSignalSchema = z.object({
  status: z
    .enum(['new', 'in_review', 'resolved', 'dismissed'])
    .optional(),
  adminNotes: z.string().optional().or(z.literal('')),
  relatedModuleId: z.number().int().positive().nullable().optional(),
});

module.exports = {
  createSignalSchema,
  createModuleSchema,
  updateModuleSchema,
  updateSignalSchema,
};
