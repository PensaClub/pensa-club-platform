// server/schemas/mentorNotes.schema.js
const { z } = require('zod');

const categoryEnum = z.enum(['general', 'important', 'followup', 'positive', 'contact']);

const createNoteSchema = z.object({
  text: z
    .string({ required_error: 'Note text is required' })
    .min(1, 'Note text cannot be empty')
    .max(5000, 'Note text cannot exceed 5000 characters'),
  category: categoryEnum.default('general')
});

const updateNoteSchema = z.object({
  text: z
    .string()
    .min(1, 'Note text cannot be empty')
    .max(5000, 'Note text cannot exceed 5000 characters')
    .optional(),
  category: categoryEnum.optional()
});

module.exports = {
  createNoteSchema,
  updateNoteSchema
};