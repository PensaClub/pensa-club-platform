const commentController = require('express').Router();
const isAuth = require('../middlewares/isAuth');
const { checkPermission } = require('../middlewares/rbac');
const { comment, user_account, user_details, initiative, project } = require('../sequelize/models');
const CustomError = require('../utils/customError');
const { transformComment } = require('../utils/commentUtils');
const { CreateCommentSchema, UpdateCommentSchema, CommentIdSchema } = require('../schemas/comments.schema');

const commentConfig = [
    {
        model: user_account,
        as: 'user',
        include: [
            {
                model: user_details,
                as: 'details',
                attributes: ['username', 'firstName', 'lastName', 'imageURL'],
            },
        ],
    },
    {
        model: comment,
        as: 'replies',
        include: [
            {
                model: user_account,
                as: 'user',
                include: [
                    {
                        model: user_details,
                        as: 'details',
                        attributes: ['username', 'firstName', 'lastName', 'imageURL'],
                    },
                ],
            },
        ],
    },
];

commentController.post('/create', isAuth, checkPermission('comments', 'create'), async (req, res, next) => {
    try {
        const validatedData = CreateCommentSchema.parse(req.body);
        const { content, commentableId, commentsLinkConnection, parentId, slug } = validatedData;

        let finalCommentableId = commentableId;

        if (slug) {
            const initiative = await initiative.findOne({
                where: { slug: slug },
            });

            if (initiative) {
                finalCommentableId = initiative.id;
            }
        } else if (typeof commentableId === 'string') {
            const initiative = await initiative.findOne({
                where: { slug: commentableId },
            });

            if (initiative) {
                finalCommentableId = initiative.id;
            }
        }

        const newComment = await comment.create({
            content,
            userId: req.user.userId,
            commentableId: finalCommentableId,
            commentsLinkConnection,
            parentId: parentId || null,
        });

        if (parentId) {
            const parentComment = await comment.findByPk(parentId, {
                include: commentConfig,
            });

            if (!parentComment) {
                throw new CustomError({
                    message: 'Parent comment not found',
                    statusCode: 404,
                });
            }

            const transformedParent = transformComment(parentComment);
            return res.status(201).json(transformedParent);
        }

        const completeComment = await comment.findByPk(newComment.id, {
            include: commentConfig,
        });

        const transformedComment = transformComment(completeComment);
        return res.status(201).json(transformedComment);
    } catch (err) {
        next(err);
    }
});

commentController.post('/like/:id', isAuth, checkPermission('comments', 'like'), async (req, res, next) => {
    try {
        const { id } = CommentIdSchema.parse(req.params);

        const userDetails = await user_details.findOne({
            where: { user_accounts_id: req.user.userId },
        });

        if (!userDetails) {
            throw new CustomError({
                message: 'User details not found',
                statusCode: 404,
            });
        }

        const userName = `${userDetails.firstName} ${userDetails.lastName}`;

        const commentToLike = await comment.findByPk(id, {
            include: commentConfig,
        });

        if (!commentToLike) {
            throw new CustomError({
                message: 'Comment not found',
                statusCode: 404,
            });
        }

        const currentLikes = commentToLike.likes || [];

        const hasLiked = currentLikes.includes(userName);

        const updatedLikes = hasLiked ? currentLikes.filter((name) => name !== userName) : [...currentLikes, userName];

        await commentToLike.update({ likes: updatedLikes });

        const updatedComment = await comment.findByPk(id, {
            include: commentConfig,
        });

        const transformedComment = transformComment(updatedComment);
        const response = {
            isLiked: !hasLiked,
            ...transformedComment,
        };

        return res.status(200).json(response);
    } catch (err) {
        next(err);
    }
});

commentController.get('/single/:id', checkPermission('comments', 'read'), async (req, res, next) => {
    try {
        const { id } = CommentIdSchema.parse(req.params);

        const foundComment = await comment.findByPk(id, {
            include: commentConfig,
        });

        if (!foundComment) {
            throw new CustomError({
                message: 'Comment not found',
                statusCode: 404,
            });
        }

        const transformedComment = transformComment(foundComment);
        return res.status(200).json(transformedComment);
    } catch (err) {
        next(err);
    }
});

commentController.delete('/:id', isAuth, checkPermission('comments', 'delete'), async (req, res, next) => {
    try {
        const { id } = CommentIdSchema.parse(req.params);
        const userId = req.user.userId;
        const userRole = req.user.role;

        const commentToDelete = await comment.findByPk(id, {
            include: commentConfig,
        });

        if (!commentToDelete) {
            throw new CustomError({
                message: 'Comment not found',
                statusCode: 404,
            });
        }

        // Check if user can delete this comment
        const canDeleteAll = ['admin', 'moderator'].includes(userRole);
        const isOwnComment = Number(commentToDelete.userId) === Number(userId);

        if (!canDeleteAll && !isOwnComment) {
            throw new CustomError({
                message: 'Not authorized to delete this comment',
                statusCode: 403,
            });
        }

        if (commentToDelete.parentId) {
            await commentToDelete.destroy();
            return res.status(200).json({ message: 'Reply deleted successfully' });
        }

        const parentComment = await comment.findByPk(commentToDelete.parentId, {
            include: commentConfig,
        });

        await commentToDelete.destroy();

        if (parentComment) {
            const transformedParent = transformComment(parentComment);
            return res.status(200).json(transformedParent);
        }

        return res.status(200).json({ message: 'Comment and its replies deleted successfully' });
    } catch (err) {
        next(err);
    }
});

commentController.patch('/:id', isAuth, checkPermission('comments', 'update'), async (req, res, next) => {
    try {
        const { id } = CommentIdSchema.parse(req.params);
        const { content } = UpdateCommentSchema.parse(req.body);
        const userId = req.user.userId;
        const userRole = req.user.role;

        const commentToUpdate = await comment.findByPk(id, {
            include: commentConfig,
        });

        if (!commentToUpdate) {
            throw new CustomError({
                message: 'Comment not found',
                statusCode: 404,
            });
        }

        // Check if user can update this comment
        const canUpdateAll = ['admin', 'moderator'].includes(userRole);
        const isOwnComment = Number(commentToUpdate.userId) === Number(userId);

        if (!canUpdateAll && !isOwnComment) {
            throw new CustomError({
                message: 'Not authorized to update this comment',
                statusCode: 403,
            });
        }

        if (commentToUpdate.content === content) {
            const transformedComment = transformComment(commentToUpdate);
            return res.status(200).json({
                ...transformedComment,
                isEdited: false,
            });
        }

        await commentToUpdate.update({ content });

        const updatedComment = await comment.findByPk(id, {
            include: commentConfig,
        });

        const transformedComment = transformComment(updatedComment);
        return res.status(200).json({
            ...transformedComment,
            isEdited: true,
        });
    } catch (err) {
        next(err);
    }
});

commentController.get('/all/initiative/:id', checkPermission('comments', 'read'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const initiativeId = parseInt(id);

        let foundInitiative;

        foundInitiative = await initiative.findOne({
            where: { slug: id },
        });

        if (!foundInitiative && !isNaN(initiativeId)) {
            foundInitiative = await initiative.findByPk(initiativeId);
        }

        if (!foundInitiative) {
            throw new CustomError({
                message: 'Initiative not found',
                statusCode: 404,
            });
        }

        const comments = await comment.findAll({
            where: {
                commentableId: foundInitiative.id,
                commentsLinkConnection: 'initiative',
            },
            include: commentConfig,
            order: [['createdAt', 'DESC']],
        });

        const transformedComments = comments.map((comment) => transformComment(comment));

        return res.status(200).json({
            initiativeSlug: foundInitiative.slug,
            comments: transformedComments,
        });
    } catch (err) {
        next(err);
    }
});

commentController.get('/all/project/:id', checkPermission('comments', 'read'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const projectId = parseInt(id);

        let foundProject;

        foundProject = await project.findOne({
            where: { slug: id },
        });

        if (!foundProject && !isNaN(projectId)) {
            foundProject = await project.findByPk(projectId);
        }

        if (!foundProject) {
            throw new CustomError({
                message: 'Project not found',
                statusCode: 404,
            });
        }

        const comments = await comment.findAll({
            where: {
                commentableId: foundProject.id,
                commentsLinkConnection: 'project',
            },
            include: commentConfig,
            order: [['createdAt', 'DESC']],
        });

        const transformedComments = comments.map((comment) => transformComment(comment));

        return res.status(200).json({
            projectSlug: foundProject.slug,
            comments: transformedComments,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = commentController;
