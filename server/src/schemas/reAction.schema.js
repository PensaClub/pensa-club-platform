const { z } = require('zod');

// Public: submit a visit request (no auth required)
const createVisitRequestSchema = z.object({
  clubName: z
    .string({ required_error: 'Името на клуба е задължително.' })
    .min(2, { message: 'Името на клуба трябва да е поне 2 символа.' })
    .max(200, { message: 'Името на клуба трябва да е до 200 символа.' }),
  city: z
    .string({ required_error: 'Градът е задължителен.' })
    .min(2, { message: 'Градът трябва да е поне 2 символа.' })
    .max(100, { message: 'Градът трябва да е до 100 символа.' }),
  participantsCount: z
    .coerce.number({ invalid_type_error: 'Броят на участниците трябва да е число.' })
    .int({ message: 'Броят на участниците трябва да е цяло число.' })
    .min(1, { message: 'Броят на участниците трябва да е поне 1.' })
    .max(500, { message: 'Броят на участниците трябва да е до 500.' }),
  topic: z.enum(['fake_news', 'voter_rights', 'election_process', 'other'], {
    message: 'Моля изберете валидна тема.',
  }),
  topicOther: z
    .string()
    .max(200, { message: 'Описанието на темата трябва да е до 200 символа.' })
    .optional()
    .or(z.literal('')),
  preferredDate: z
    .string({ required_error: 'Датата е задължителна.' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Датата трябва да е във формат ГГГГ-ММ-ДД.' }),
  contactName: z
    .string({ required_error: 'Името за контакт е задължително.' })
    .min(2, { message: 'Името за контакт трябва да е поне 2 символа.' })
    .max(200, { message: 'Името за контакт трябва да е до 200 символа.' }),
  contactPhone: z
    .string({ required_error: 'Телефонът е задължителен.' })
    .min(6, { message: 'Телефонът трябва да е поне 6 символа.' })
    .max(20, { message: 'Телефонът трябва да е до 20 символа.' }),
  contactEmail: z
    .string({ required_error: 'Имейлът е задължителен.' })
    .email({ message: 'Невалиден формат на имейл.' }),
  notes: z
    .string()
    .max(2000, { message: 'Бележките трябва да са до 2000 символа.' })
    .optional()
    .or(z.literal('')),
});

// Admin: update a visit request
const updateVisitRequestSchema = z.object({
  status: z
    .enum(['new', 'reviewing', 'mentor_assigned', 'confirmed', 'completed', 'cancelled'])
    .optional(),
  assignedMentorId: z.coerce.number().int().positive().nullable().optional(),
  adminNotes: z.string().optional().or(z.literal('')),
  cancelReason: z.string().optional().or(z.literal('')),
});

// Mentor: set availability (bulk)
const setAvailabilitySchema = z.object({
  dates: z.array(
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Всяка дата трябва да е във формат ГГГГ-ММ-ДД.' })
  ).min(1, { message: 'Поне една дата е задължителна.' }),
  isAvailable: z.boolean(),
});

// Mentor: submit feedback for a completed visit
const createFeedbackSchema = z.object({
  visitRequestId: z.coerce.number().int().positive(),
  participantsActual: z.coerce.number().int().min(0).nullable().optional(),
  topicsCovered: z.string().max(2000).optional().or(z.literal('')),
  challenges: z.string().max(2000).optional().or(z.literal('')),
  highlights: z.string().max(2000).optional().or(z.literal('')),
  recommendations: z.string().max(2000).optional().or(z.literal('')),
  rating: z.coerce.number().int().min(1).max(5).nullable().optional(),
});

// Admin: create/update testimonial
const createTestimonialSchema = z.object({
  visitRequestId: z.coerce.number().int().positive().nullable().optional(),
  clubName: z
    .string({ required_error: 'Името на клуба е задължително.' })
    .min(2, { message: 'Името на клуба трябва да е поне 2 символа.' })
    .max(200, { message: 'Името на клуба трябва да е до 200 символа.' }),
  city: z
    .string({ required_error: 'Градът е задължителен.' })
    .min(2, { message: 'Градът трябва да е поне 2 символа.' })
    .max(100, { message: 'Градът трябва да е до 100 символа.' }),
  quote: z
    .string({ required_error: 'Цитатът е задължителен.' })
    .min(10, { message: 'Цитатът трябва да е поне 10 символа.' }),
  authorName: z
    .string()
    .max(200, { message: 'Името на автора трябва да е до 200 символа.' })
    .optional()
    .or(z.literal('')),
  isApproved: z.boolean().default(false),
});

// Public: submit a testimonial (no auth, always isApproved: false)
const submitTestimonialSchema = z.object({
  clubName: z
    .string({ required_error: 'Името на клуба е задължително.' })
    .min(2, { message: 'Името на клуба трябва да е поне 2 символа.' })
    .max(200, { message: 'Името на клуба трябва да е до 200 символа.' }),
  city: z
    .string({ required_error: 'Градът е задължителен.' })
    .min(2, { message: 'Градът трябва да е поне 2 символа.' })
    .max(100, { message: 'Градът трябва да е до 100 символа.' }),
  quote: z
    .string({ required_error: 'Отзивът е задължителен.' })
    .min(10, { message: 'Отзивът трябва да е поне 10 символа.' })
    .max(2000, { message: 'Отзивът трябва да е до 2000 символа.' }),
  authorName: z
    .string()
    .max(200, { message: 'Името на автора трябва да е до 200 символа.' })
    .optional()
    .or(z.literal('')),
  formOpenedAt: z.number().optional(),
});

// Admin: create gallery item
const createGalleryItemSchema = z.object({
  mediaType: z.enum(['image', 'video'], {
    message: 'Типът медия трябва да е image или video.',
  }),
  mediaUrl: z
    .string({ required_error: 'URL на медията е задължителен.' })
    .url({ message: 'Невалиден URL формат.' })
    .max(2048),
  thumbnailUrl: z
    .string()
    .url({ message: 'Невалиден URL формат.' })
    .max(2048)
    .nullable()
    .optional(),
  title: z
    .string()
    .max(200, { message: 'Заглавието трябва да е до 200 символа.' })
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(2000, { message: 'Описанието трябва да е до 2000 символа.' })
    .optional()
    .or(z.literal('')),
});

// Admin: update gallery item
const updateGalleryItemSchema = z.object({
  title: z.string().max(200).optional().or(z.literal('')),
  description: z.string().max(2000).optional().or(z.literal('')),
  thumbnailUrl: z.string().url().max(2048).nullable().optional(),
  isPublished: z.boolean().optional(),
});

// Admin: reorder gallery items
const reorderGallerySchema = z.object({
  items: z.array(
    z.object({
      id: z.coerce.number().int().positive(),
      sortOrder: z.coerce.number().int().min(0),
    })
  ).min(1, { message: 'Поне един елемент е задължителен.' }),
});

module.exports = {
  createVisitRequestSchema,
  updateVisitRequestSchema,
  setAvailabilitySchema,
  createFeedbackSchema,
  createTestimonialSchema,
  submitTestimonialSchema,
  createGalleryItemSchema,
  updateGalleryItemSchema,
  reorderGallerySchema,
};
