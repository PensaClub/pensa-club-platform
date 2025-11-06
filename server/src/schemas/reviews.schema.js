// server/src/schemas/reviews.schema.js

const { z } = require('zod');

const createAcademyReviewSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email address'),
  role: z.enum(['participant', 'mentor'], {
    errorMap: () => ({ message: 'Role must be participant or mentor' })
  }),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  text: z.string().max(1000).optional() 
});

const createMentorReviewSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email address'),
  role: z.enum(['participant', 'mentor'], {
    errorMap: () => ({ message: 'Role must be participant or mentor' })
  }).default('participant'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  text: z.string().max(1000).optional() 
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