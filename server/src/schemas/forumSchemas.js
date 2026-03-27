const { z } = require('zod');

// Posts
const forumPostCreateSchema = z.object({
  title: z.string().min(3).max(300),
  content: z.string().min(1),
  type: z.enum(['discussion', 'article', 'poll', 'question']).default('discussion'),
  spaceId: z.number().int().positive().nullable().optional(),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
  images: z.array(z.string().url()).max(10).optional().default([]),
  coverImage: z.string().url().nullable().optional(),
  videos: z.array(z.string().url()).max(2).optional().default([]),
  // Poll data (only when type === 'poll')
  poll: z.object({
    question: z.string().min(3).max(500),
    options: z.array(z.object({
      id: z.string(),
      text: z.string().min(1).max(200),
    })).min(2).max(10),
    isMultipleChoice: z.boolean().default(false),
    expiresAt: z.string().datetime().nullable().optional(),
  }).optional(),
});

const forumPostUpdateSchema = z.object({
  title: z.string().min(3).max(300).optional(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  images: z.array(z.string().url()).max(10).optional(),
  coverImage: z.string().url().nullable().optional(),
  spaceId: z.number().int().positive().nullable().optional(),
});

// Comments
const forumCommentCreateSchema = z.object({
  content: z.string().max(5000).default(''),
  parentId: z.number().int().positive().nullable().optional(),
  images: z.array(z.string().url()).max(5).optional().default([]),
  mentionedUsers: z.array(z.number().int().positive()).optional().default([]),
  quotedCommentId: z.number().int().positive().nullable().optional(),
});

const forumCommentUpdateSchema = z.object({
  content: z.string().min(1).max(5000),
});

// Reactions
const forumReactionSchema = z.object({
  targetType: z.enum(['post', 'comment']),
  targetId: z.number().int().positive(),
  emoji: z.string().min(1).max(10),
});

// Reports
const forumReportSchema = z.object({
  targetType: z.enum(['post', 'comment']),
  targetId: z.number().int().positive(),
  reason: z.enum(['spam', 'inappropriate', 'harassment', 'misinformation', 'other']),
  description: z.string().max(1000).optional(),
});

// Spaces
const forumSpaceCreateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  coverImage: z.string().url().nullable().optional(),
});

const forumSpaceUpdateSchema = forumSpaceCreateSchema.partial().extend({
  status: z.enum(['active', 'pending', 'archived']).optional(),
  sortOrder: z.number().int().optional(),
  isDefault: z.boolean().optional(),
});

// Suggest space (from user)
const forumSpaceSuggestSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(2000),
  icon: z.string().max(10).optional(),
});

// Poll vote
const forumPollVoteSchema = z.object({
  optionIds: z.array(z.string()).min(1),
});

// Admin: punishment
const forumPunishmentSchema = z.object({
  reason: z.string().min(3).max(1000),
  duration: z.number().int().positive().optional(), // days
  relatedPostId: z.number().int().positive().optional(),
  relatedCommentId: z.number().int().positive().optional(),
});

// Admin: post status
const forumPostStatusSchema = z.object({
  status: z.enum(['published', 'pending', 'rejected', 'hidden']),
});

// Admin: comment status
const forumCommentStatusSchema = z.object({
  status: z.enum(['visible', 'hidden', 'deleted']),
});

// Feed query
const forumFeedQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(['recent', 'popular', 'newest']).default('recent'),
  spaceId: z.coerce.number().int().positive().optional(),
  tag: z.string().optional(),
  type: z.enum(['discussion', 'article', 'poll', 'question']).optional(),
  search: z.string().max(200).optional(),
});

module.exports = {
  forumPostCreateSchema,
  forumPostUpdateSchema,
  forumCommentCreateSchema,
  forumCommentUpdateSchema,
  forumReactionSchema,
  forumReportSchema,
  forumSpaceCreateSchema,
  forumSpaceUpdateSchema,
  forumSpaceSuggestSchema,
  forumPollVoteSchema,
  forumPunishmentSchema,
  forumPostStatusSchema,
  forumCommentStatusSchema,
  forumFeedQuerySchema,
};
