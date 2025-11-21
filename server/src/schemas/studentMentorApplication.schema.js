const { z } = require('zod');

const applyForMentorSchema = z.object({
  // No body needed - mentorId comes from URL, userId from JWT
});

const approveApplicationSchema = z.object({
  // No body needed
});

const rejectApplicationSchema = z.object({
  rejectionReason: z.string().min(10, 'Rejection reason must be at least 10 characters').max(500, 'Rejection reason must be less than 500 characters'),
});

module.exports = {
  applyForMentorSchema,
  approveApplicationSchema,
  rejectApplicationSchema,
};