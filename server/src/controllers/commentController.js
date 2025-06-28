const commentController = require('express').Router();
const isAuth = require('../middlewares/isAuth');
const { comment, user_account, user_details } = require('../sequelize/models');
const customError = require('../utils/customError');
const { transformComment } = require('../utils/commentUtils');

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

commentController.post('/create', isAuth, async (req, res, next) => {
    try {
        const { content, commentableId, commentsLinkConnection, parentId, slug } = req.body;

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
                throw new customError({
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

commentController.post('/like/:id', isAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        const userDetails = await user_details.findOne({
            where: { userId: req.user.userId },
        });

        if (!userDetails) {
            throw new customError({
                message: 'User details not found',
                statusCode: 404,
            });
        }

        const userName = `${userDetails.firstName} ${userDetails.lastName}`;

        const commentToLike = await comment.findByPk(id, {
            include: commentConfig,
        });

        if (!commentToLike) {
            throw new customError({
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

commentController.get('/single/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const foundComment = await comment.findByPk(id, {
            include: commentConfig,
        });

        if (!foundComment) {
            throw new customError({
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

commentController.delete('/:id', isAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const commentToDelete = await comment.findByPk(id, {
            include: commentConfig,
        });

        if (!commentToDelete) {
            throw new customError({
                message: 'Comment not found',
                statusCode: 404,
            });
        }

        if (Number(commentToDelete.userId) !== Number(userId)) {
            throw new customError({
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

commentController.patch('/:id', isAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.userId;

        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            throw new customError({
                message: 'Comment content is required',
                statusCode: 400,
            });
        }

        const commentToUpdate = await comment.findByPk(id, {
            include: commentConfig,
        });

        if (!commentToUpdate) {
            throw new customError({
                message: 'Comment not found',
                statusCode: 404,
            });
        }

        if (Number(commentToUpdate.userId) !== Number(userId)) {
            throw new customError({
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

module.exports = commentController;
