const commentController = require('express').Router();
const isAuth = require('../middlewares/isAuth');
const { checkPermission } = require('../middlewares/rbac');
const { comment, user_details, initiative, project, publication, story } = require('../sequelize/models');
const CustomError = require('../utils/customError');
const { transformComment, getCommentConfig } = require('../utils/commentUtils');
const { CreateCommentSchema, UpdateCommentSchema, CommentIdSchema } = require('../schemas/comments.schema');

const modelMap = {
    initiative,
    project,
    publication,
    story,
};

commentController.post('/create', isAuth, checkPermission('comments', 'create'), async (req, res, next) => {
    try {
        const validatedData = CreateCommentSchema.parse(req.body);
        const { content, commentableId, commentsLinkConnection, parentId } = validatedData;

        let finalCommentableId = null;
        const model = modelMap[commentsLinkConnection];

        let foundEntity = await model.findOne({ where: { slug: commentableId } });

        if (!foundEntity && !isNaN(Number(commentableId))) {
            foundEntity = await model.findByPk(Number(commentableId));
        }

        if (!foundEntity) {
            throw new CustomError({ message: `No ${commentsLinkConnection} found for identifier: ${commentableId}`, statusCode: 404 });
        }

        finalCommentableId = foundEntity.id;

        const newComment = await comment.create({
            content,
            userId: req.user.userId,
            commentableId: finalCommentableId,
            commentsLinkConnection,
            parentId: parentId || null,
        });

        if (parentId) {
            const parentComment = await comment.findByPk(parentId, getCommentConfig());
            if (!parentComment) {
                throw new CustomError({ message: 'Parent comment not found', statusCode: 404 });
            }
            const transformedParent = transformComment(parentComment);
            return res.status(201).json(transformedParent);
        }

        const completeComment = await comment.findByPk(newComment.id, getCommentConfig());
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

        const commentToLike = await comment.findByPk(id, getCommentConfig());

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

        const updatedComment = await comment.findByPk(id, getCommentConfig());

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

        const foundComment = await comment.findByPk(id, getCommentConfig());

        if (!foundComment) {
            throw new CustomError({ message: 'Comment not found', statusCode: 404 });
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

        const commentToDelete = await comment.findByPk(id, getCommentConfig());

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

        const parentComment = await comment.findByPk(commentToDelete.parentId, getCommentConfig());

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

        const commentToUpdate = await comment.findByPk(id, getCommentConfig());

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

        const updatedComment = await comment.findByPk(id, getCommentConfig());

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

        let foundInitiative = await initiative.findOne({ where: { slug: id } });

        if (!foundInitiative && !isNaN(Number(id))) {
            foundInitiative = await initiative.findByPk(Number(id));
        }
        if (!foundInitiative) {
            throw new CustomError({ message: 'Initiative not found', statusCode: 404 });
        }
        const comments = await comment.findAll(getCommentConfig(foundInitiative.id, 'initiative'));

        const transformedComments = comments.map(transformComment);

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

        let foundProject = await project.findOne({ where: { slug: id } });

        if (!foundProject && !isNaN(Number(id))) {
            foundProject = await project.findByPk(Number(id));
        }
        if (!foundProject) {
            throw new CustomError({ message: 'Project not found', statusCode: 404 });
        }
        const comments = await comment.findAll(getCommentConfig(foundProject.id, 'project'));

        const transformedComments = comments.map(transformComment);

        return res.status(200).json({
            projectSlug: foundProject.slug,
            comments: transformedComments,
        });
    } catch (err) {
        next(err);
    }
});

commentController.get('/all/publication/:id', checkPermission('comments', 'read'), async (req, res, next) => {
    try {
        const { id } = req.params;

        let foundPublication = await publication.findOne({ where: { slug: id } });

        if (!foundPublication && !isNaN(Number(id))) {
            foundPublication = await publication.findByPk(Number(id));
        }

        if (!foundPublication) {
            throw new CustomError({ message: 'Publication not found', statusCode: 404 });
        }

        const comments = await comment.findAll(getCommentConfig(foundPublication.id, 'publication'));

        const transformedComments = comments.map(transformComment);

        return res.status(200).json({
            publicationSlug: foundPublication.slug,
            comments: transformedComments,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = commentController;
