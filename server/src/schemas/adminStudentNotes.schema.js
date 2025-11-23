// server/schemas/adminStudentNotes.schema.js
const { z } = require('zod');

const createAdminNoteSchema = z.object({
  text: z.string({
    required_error: 'Note text is required',
    invalid_type_error: 'Text must be a string'
  })
    .min(1, 'Note text cannot be empty')
    .max(5000, 'Note text must not exceed 5000 characters')
    .trim()
});

const updateAdminNoteSchema = z.object({
  text: z.string({
    required_error: 'Note text is required',
    invalid_type_error: 'Text must be a string'
  })
    .min(1, 'Note text cannot be empty')
    .max(5000, 'Note text must not exceed 5000 characters')
    .trim()
});

module.exports = {
  createAdminNoteSchema,
  updateAdminNoteSchema
};