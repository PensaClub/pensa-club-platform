const { z } = require('zod');

// Schema for creating a new comment
const CreateCommentSchema = z
    .object({
        content: z
            .string()
            .min(1, 'Comment content is required')
            .max(1000, 'Comment content must not exceed 1000 characters')
            .refine((content) => content.trim().length > 0, 'Comment content cannot be empty'),

        commentableId: z.union([z.string(), z.number()]),

        commentsLinkConnection: z.enum(['initiative', 'project', 'publication', 'story']),

        parentId: z
            .union([z.string(), z.number(), z.null()])
            .optional()
            .transform((val) => {
                if (val === null || val === undefined) return null;
                return typeof val === 'string' ? parseInt(val) : val;
            })
            .refine((val) => val === null || (typeof val === 'number' && val > 0), {
                message: 'Parent ID must be a positive number or null',
            }),

        slug: z.string().optional(),
    })
    .refine(
        (data) => {
            const hasCommentableId = data.commentableId !== undefined && data.commentableId !== null;
            const hasSlug = data.slug !== undefined && data.slug !== null;

            return hasCommentableId || hasSlug;
        },
        {
            message: 'Either commentableId or slug must be provided',
            path: ['commentableId'],
        }
    );

// Schema for updating a comment (only content)
const UpdateCommentSchema = z.object({
    content: z
        .string()
        .min(1, 'Comment content is required')
        .max(1000, 'Comment content must not exceed 1000 characters')
        .refine((content) => content.trim().length > 0, 'Comment content cannot be empty'),
});

// Schema for comment ID parameter (for updates, deletes, likes, etc.)
const CommentIdSchema = z.object({
    id: z
        .string()
        .min(1, 'Comment ID is required')
        .transform((val) => {
            const num = parseInt(val);
            if (isNaN(num) || num <= 0) {
                throw new Error('Comment ID must be a positive number');
            }
            return num;
        }),
});

module.exports = {
    CreateCommentSchema,
    UpdateCommentSchema,
    CommentIdSchema,
};
