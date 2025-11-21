const { z } = require('zod');

// ===============================
// CREATE NOTE SCHEMA
// ===============================
const createNoteSchema = z.object({
  text: z.string({
    required_error: 'Note text is required',
    invalid_type_error: 'Text must be a string'
  })
    .min(1, 'Note text cannot be empty')
    .max(5000, 'Note text must not exceed 5000 characters')
    .trim()
});

// ===============================
// UPDATE NOTE SCHEMA
// ===============================
const updateNoteSchema = z.object({
  text: z.string({
    required_error: 'Note text is required',
    invalid_type_error: 'Text must be a string'
  })
    .min(1, 'Note text cannot be empty')
    .max(5000, 'Note text must not exceed 5000 characters')
    .trim()
});

module.exports = {
  createNoteSchema,
  updateNoteSchema
};