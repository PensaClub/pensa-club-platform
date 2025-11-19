const { z } = require('zod');

// ===============================
// CREATE MEETING SCHEMA
// ===============================
const createMeetingSchema = z.object({
  // ✅ САМО TITLE Е REQUIRED
  title: z.string({
    required_error: 'Title is required',
    invalid_type_error: 'Title must be a string'
  })
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  
  // ✅ ВСИЧКО ДРУГО Е OPTIONAL
  studentId: z.number({
    invalid_type_error: 'Student ID must be a number'
  })
    .int()
    .positive()
    .optional()
    .nullable(),
  
  meetingDate: z.string({
    invalid_type_error: 'Meeting date must be a string'
  })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Meeting date must be in YYYY-MM-DD format')
    .optional(),
  
  meetingTime: z.string({
    invalid_type_error: 'Meeting time must be a string'
  })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Meeting time must be in HH:MM or HH:MM:SS format')
    .optional(),
  
  duration: z.number({
    invalid_type_error: 'Duration must be a number'
  })
    .int()
    .min(1, 'Duration must be at least 1 minute')
    .max(480, 'Duration must not exceed 480 minutes (8 hours)')
    .default(60)
    .optional(),
  
  notes: z.string()
    .max(2000, 'Notes must not exceed 2000 characters')
    .trim()
    .optional()
    .nullable(),
  
  meetingType: z.enum(['viber', 'google_meet', 'phone', 'in_person', 'other'])
    .default('viber')
    .optional(),
});

// ===============================
// UPDATE MEETING SCHEMA
// ===============================
const updateMeetingSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim()
    .optional(),
  
  // ✅ ПРИЕМА И ДВАТА ВАРИАНТА
  meetingDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Meeting date must be in YYYY-MM-DD format')
    .optional(),
  
  scheduledDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Meeting date must be in YYYY-MM-DD format')
    .optional(),
  
  meetingTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Meeting time must be in HH:MM or HH:MM:SS format')
    .optional(),
  
  scheduledTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Meeting time must be in HH:MM or HH:MM:SS format')
    .optional(),
  
  duration: z.number()
    .int()
    .min(1, 'Duration must be at least 1 minute')
    .max(480, 'Duration must not exceed 480 minutes (8 hours)')
    .optional(),
  
  plannedDuration: z.number()
    .int()
    .min(1, 'Duration must be at least 1 minute')
    .max(480, 'Duration must not exceed 480 minutes (8 hours)')
    .optional(),
  
  studentId: z.number()
    .int()
    .positive()
    .optional()
    .nullable(),
  
  notes: z.string()
    .max(2000, 'Notes must not exceed 2000 characters')
    .trim()
    .optional()
    .nullable(),
  
  meetingType: z.enum(['viber', 'google_meet', 'phone', 'in_person', 'other'])
    .optional(),
  
  status: z.enum(['scheduled', 'completed', 'cancelled'])
    .optional(),
})
.transform((data) => {
  // ✅ MAP frontend fields to backend fields
  const result = {};
  
  if (data.title !== undefined) result.title = data.title;
  if (data.scheduledDate !== undefined || data.meetingDate !== undefined) {
    result.meetingDate = data.scheduledDate || data.meetingDate;
  }
  if (data.scheduledTime !== undefined || data.meetingTime !== undefined) {
    result.meetingTime = data.scheduledTime || data.meetingTime;
  }
  if (data.plannedDuration !== undefined || data.duration !== undefined) {
    result.duration = data.plannedDuration || data.duration;
  }
  if (data.notes !== undefined) result.notes = data.notes;
  if (data.meetingType !== undefined) result.meetingType = data.meetingType;
  if (data.status !== undefined) result.status = data.status;
  
  return result;
});

// ===============================
// COMPLETE MEETING SCHEMA
// ===============================
const completeMeetingSchema = z.object({
  notes: z.string()
    .max(2000, 'Completion notes must not exceed 2000 characters')
    .trim()
    .optional()
    .nullable(),
});

module.exports = {
  createMeetingSchema,
  updateMeetingSchema,
  completeMeetingSchema,
};