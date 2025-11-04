// server/src/schemas/reviews.schema.js

const { z } = require('zod');

const createAcademyReviewSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email address'),
  role: z.enum(['participant', 'mentor'], {
    errorMap: () => ({ message: 'Role must be participant or mentor' })
  }),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  text: z.string().min(10, 'Review text must be at least 10 characters').max(500)
});

const createMentorReviewSchema = z.object({
  mentorId: z.number().int().positive(),
  name: z.string().min(2).max(255),
  email: z.string().email(),
  role: z.enum(['participant', 'mentor']),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(10).max(500)
});

const approveReviewSchema = z.object({
  reviewId: z.number().int().positive()
});

const rejectReviewSchema = z.object({
  reviewId: z.number().int().positive(),
  rejectionReason: z.string().min(5, 'Rejection reason must be at least 5 characters')
});

module.exports = {
  createAcademyReviewSchema,
  createMentorReviewSchema,
  approveReviewSchema,
  rejectReviewSchema
};