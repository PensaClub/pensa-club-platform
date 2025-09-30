const storyController = require('express').Router();
const { where, Op } = require('sequelize');
const isAuth = require('../middlewares/isAuth');
const { checkPermission } = require('../middlewares/rbac');
const { story, section, image, user_account, comment } = require('../sequelize/models');
const CustomError = require('../utils/customError');
const { storyConfig, transformStory } = require('../utils/storyUtils');
const { transformComment, getCommentConfig } = require('../utils/commentUtils');
const { findBySlugOrId } = require('../utils/modelLookup');
const { StorySchema, UpdateStorySchema } = require('../schemas/stories.schema');

// ========================================
// ENDPOINTS
// ========================================

storyController.post('/create', isAuth, checkPermission('stories', 'create'), async (req, res, next) => {
    try {
        const validatedData = await StorySchema.parseAsync(req.body);
        const storyData = { ...validatedData };

        if (!storyData.isDraft && !storyData.publishedAt) {
            storyData.publishedAt = new Date();
        }

        const result = await story.sequelize.transaction(async (t) => {
            const newStory = await story.create(
                {
                    creatorId: req.user.userId,
                    ...storyData,
                },
                { transaction: t }
            );

            if (storyData.mainImage) {
                await image.create(
                    {
                        ...storyData.mainImage,
                        imageableId: newStory.id,
                        imageLinkConnection: 'story',
                    },
                    { transaction: t }
                );
            }

            if (storyData.sections?.length > 0) {
                await Promise.all(
                    storyData.sections.map(async (sectionData) => {
                        const { image: sectionImage, ...sectionFields } = sectionData;

                        const createdSection = await section.create(
                            {
                                ...sectionFields,
                                sectionableId: newStory.id,
                                sectionLinkConnection: 'story',
                            },
                            { transaction: t }
                        );

                        if (sectionImage?.src) {
                            await image.create(
                                {
                                    ...sectionImage,
                                    imageableId: createdSection.id,
                                    imageLinkConnection: 'section',
                                },
                                { transaction: t }
                            );
                        }
                    })
                );
            }

            if (storyData.relatedStories?.length > 0) {
                const relatedLinks = storyData.relatedStories.map((relatedStoryId) => ({
                    story_id: newStory.id,
                    related_story_id: relatedStoryId,
                }));
                await story.sequelize.models.related_stories.bulkCreate(relatedLinks, { transaction: t });
            }

            if (storyData.connectedInitiativeIds?.length > 0) {
                const initiativeLinks = storyData.connectedInitiativeIds.map((initiativeId) => ({
                    story_id: newStory.id,
                    initiative_id: initiativeId,
                }));
                await story.sequelize.models.initiative_stories.bulkCreate(initiativeLinks, { transaction: t });
            }

            if (storyData.connectedProjectIds?.length > 0) {
                const projectLinks = storyData.connectedProjectIds.map((projectId) => ({
                    story_id: newStory.id,
                    project_id: projectId,
                }));
                await story.sequelize.models.project_stories.bulkCreate(projectLinks, { transaction: t });
            }

            const completeStory = await story.findByPk(newStory.id, {
                include: storyConfig,
                transaction: t,
            });
            return completeStory;
        });

        const transformedResponse = await transformStory(result);
        return res.status(201).json(transformedResponse);
    } catch (err) {
        next(err);
    }
});

storyController.patch('/:id', isAuth, checkPermission('stories', 'update'), async (req, res, next) => {
    try {
        const validatedData = UpdateStorySchema.parse(req.body);
        const storyId = parseInt(req.params.id, 10);

        const result = await story.sequelize.transaction(async (t) => {
            const foundStory = await story.findByPk(storyId, {
                include: storyConfig,
                transaction: t,
            });

            if (!foundStory) {
                throw new CustomError({
                    message: 'Story not found',
                    statusCode: 404,
                });
            }

            await foundStory.update(validatedData, { transaction: t });

            if (validatedData.mainImage !== undefined) {
                await image.destroy({
                    where: {
                        imageableId: foundStory.id,
                        imageLinkConnection: 'story',
                    },
                    transaction: t,
                });

                if (validatedData.mainImage) {
                    await image.create(
                        {
                            ...validatedData.mainImage,
                            imageableId: foundStory.id,
                            imageLinkConnection: 'story',
                        },
                        { transaction: t }
                    );
                }
            }

            if (validatedData.sections !== undefined) {
                await section.destroy({
                    where: {
                        sectionableId: foundStory.id,
                        sectionLinkConnection: 'story',
                    },
                    transaction: t,
                });

                if (validatedData.sections?.length > 0) {
                    await Promise.all(
                        validatedData.sections.map(async (sectionData) => {
                            const { image: sectionImage, ...sectionFields } = sectionData;

                            const createdSection = await section.create(
                                {
                                    ...sectionFields,
                                    sectionableId: foundStory.id,
                                    sectionLinkConnection: 'story',
                                },
                                { transaction: t }
                            );

                            if (sectionImage?.src) {
                                await image.create(
                                    {
                                        ...sectionImage,
                                        imageableId: createdSection.id,
                                        imageLinkConnection: 'section',
                                    },
                                    { transaction: t }
                                );
                            }
                        })
                    );
                }
            }

            if (validatedData.relatedStories !== undefined) {
                await story.sequelize.models.related_stories.destroy({
                    where: { story_id: foundStory.id },
                    transaction: t,
                });

                if (validatedData.relatedStories.length > 0) {
                    const relatedLinks = validatedData.relatedStories.map((relatedStoryId) => ({
                        story_id: foundStory.id,
                        related_story_id: relatedStoryId,
                    }));
                    await story.sequelize.models.related_stories.bulkCreate(relatedLinks, { transaction: t });
                }
            }

            if (validatedData.connectedInitiativeIds !== undefined) {
                await story.sequelize.models.initiative_stories.destroy({
                    where: { story_id: foundStory.id },
                    transaction: t,
                });

                if (validatedData.connectedInitiativeIds.length > 0) {
                    const initiativeLinks = validatedData.connectedInitiativeIds.map((initiativeId) => ({
                        story_id: foundStory.id,
                        initiative_id: initiativeId,
                    }));
                    await story.sequelize.models.initiative_stories.bulkCreate(initiativeLinks, { transaction: t });
                }
            }

            if (validatedData.connectedProjectIds !== undefined) {
                await story.sequelize.models.project_stories.destroy({
                    where: { story_id: foundStory.id },
                    transaction: t,
                });

                if (validatedData.connectedProjectIds.length > 0) {
                    const projectLinks = validatedData.connectedProjectIds.map((projectId) => ({
                        story_id: foundStory.id,
                        project_id: projectId,
                    }));
                    await story.sequelize.models.project_stories.bulkCreate(projectLinks, { transaction: t });
                }
            }

            const updatedStory = await story.findByPk(foundStory.id, {
                include: storyConfig,
                transaction: t,
            });

            return updatedStory;
        });

        const transformedResponse = await transformStory(result);
        return res.status(200).json(transformedResponse);
    } catch (err) {
        next(err);
    }
});

storyController.get('/single/:id', isAuth.allowGuest, checkPermission('stories', 'read'), async (req, res, next) => {
    try {
        const param = req.params.id;
        const userId = req.user?.userId ? parseInt(req.user.userId, 10) : null;

        const foundStory = await findBySlugOrId(story, param, {
            include: storyConfig,
        });

        if (!foundStory) {
            throw new CustomError({
                message: 'Story not found',
                statusCode: 404,
            });
        }

        const [comments, actualLikesCount, currentUserLiked] = await Promise.all([
            comment.findAll(getCommentConfig(foundStory.id, 'story')),
            story.sequelize.models.story_likes.count({
                where: { story_id: foundStory.id },
            }),
            userId
                ? story.sequelize.models.story_likes.findOne({
                      where: {
                          story_id: foundStory.id,
                          user_id: userId,
                      },
                  })
                : Promise.resolve(null),
        ]);

        const transformed = await transformStory(foundStory);
        transformed.comments = comments.map((comment) => transformComment(comment));
        transformed.likes = actualLikesCount;
        transformed.isLiked = !!currentUserLiked;

        delete transformed.likedBy;

        return res.status(200).json(transformed);
    } catch (err) {
        next(err);
    }
});

storyController.get('/all', checkPermission('stories', 'read'), async (req, res, next) => {
    try {
        const { page = 1, limit = 10, isDraft } = req.query;

        let whereClause = {};
        if (isDraft !== undefined && isDraft !== null) {
            whereClause.isDraft = isDraft === 'true';
        }

        const totalCount = await story.count({
            distinct: true,
            where: whereClause,
        });

        const totalPages = Math.ceil(totalCount / limit);

        if (totalCount === 0) {
            return res.status(200).json({
                data: [],
                pagination: {
                    page: 1,
                    limit: limit,
                    totalStories: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            });
        }

        const actualPage = Math.min(page, totalPages);
        const offset = (actualPage - 1) * limit;

        const stories = await story.findAll({
            where: whereClause,
            include: storyConfig,
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']],
        });

        const transformedList = await Promise.all(
            stories.map(async (story) => {
                const comments = await comment.findAll(getCommentConfig(story.id, 'story'));
                const transformed = await transformStory(story);
                transformed.comments = comments.map((comment) => transformComment(comment));
                return transformed;
            })
        );

        return res.status(200).json({
            data: transformedList,
            pagination: {
                page: actualPage,
                limit: limit,
                totalStories: totalCount,
                totalPages,
                hasNextPage: actualPage < totalPages,
                hasPrevPage: actualPage > 1,
            },
        });
    } catch (err) {
        next(err);
    }
});

storyController.delete('/:id', isAuth, checkPermission('stories', 'delete'), async (req, res, next) => {
    try {
        const storyId = parseInt(req.params.id, 10);

        await story.sequelize.transaction(async (t) => {
            const foundStory = await story.findByPk(storyId, {
                include: [
                    {
                        model: user_account,
                        as: 'creator',
                        attributes: ['id', 'email'],
                    },
                ],
                transaction: t,
            });

            if (!foundStory) {
                throw new CustomError({
                    message: 'Story not found',
                    statusCode: 404,
                });
            }

            await story.sequelize.models.related_stories.destroy({
                where: {
                    [Op.or]: [{ story_id: foundStory.id }, { related_story_id: foundStory.id }],
                },
                transaction: t,
            });

            await story.sequelize.models.initiative_stories.destroy({
                where: { story_id: foundStory.id },
                transaction: t,
            });

            await story.sequelize.models.project_stories.destroy({
                where: { story_id: foundStory.id },
                transaction: t,
            });

            await image.destroy({
                where: {
                    imageableId: foundStory.id,
                    imageLinkConnection: 'story',
                },
                transaction: t,
            });

            await story.sequelize.models.story_bookmarks.destroy({
                where: { story_id: foundStory.id },
                transaction: t,
            });

            await story.sequelize.models.story_likes.destroy({
                where: { story_id: foundStory.id },
                transaction: t,
            });

            const storySections = await section.findAll({
                where: {
                    sectionableId: foundStory.id,
                    sectionLinkConnection: 'story',
                },
                attributes: ['id'],
                transaction: t,
            });

            const sectionIds = storySections.map((s) => s.id);

            if (sectionIds.length > 0) {
                await image.destroy({
                    where: {
                        imageableId: {
                            [Op.in]: sectionIds,
                        },
                        imageLinkConnection: 'section',
                    },
                    transaction: t,
                });
            }

            // Delete sections
            await section.destroy({
                where: {
                    sectionableId: foundStory.id,
                    sectionLinkConnection: 'story',
                },
                transaction: t,
            });

            await comment.destroy({
                where: {
                    commentableId: foundStory.id,
                    commentsLinkConnection: 'story',
                },
                transaction: t,
            });

            await foundStory.destroy({ transaction: t });
        });

        return res.status(200).json({
            message: 'Story deleted successfully',
        });
    } catch (err) {
        next(err);
    }
});

storyController.patch('/toggle-draft/:id', isAuth, checkPermission('stories', 'update'), async (req, res, next) => {
    try {
        const storyId = parseInt(req.params.id, 10);

        const result = await story.sequelize.transaction(async (t) => {
            const foundStory = await story.findByPk(storyId, { transaction: t });

            if (!foundStory) {
                throw new CustomError({
                    message: 'Story not found',
                    statusCode: 404,
                });
            }

            const wasDraft = foundStory.isDraft;

            const updateData = {
                isDraft: !foundStory.isDraft,
                publishedAt: foundStory.isDraft ? new Date() : null,
            };

            await foundStory.update(updateData, { transaction: t });

            return {
                id: foundStory.id,
                slug: foundStory.slug,
                wasDraft: wasDraft,
                isNowDraft: !wasDraft,
                publishedAt: updateData.publishedAt,
            };
        });

        const statusMessage = result.wasDraft ? `Story '${result.slug}' has been published.` : `Story '${result.slug}' has been converted to draft.`;

        return res.status(200).json({
            message: statusMessage,
            data: result,
        });
    } catch (err) {
        next(err);
    }
});

storyController.post('/bookmark/:id', isAuth, checkPermission('stories', 'read'), async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const storyId = parseInt(req.params.id, 10);

        const existing = await story.findByPk(storyId, {
            where: { isDraft: false },
            include: [
                {
                    model: user_account,
                    as: 'bookmarkedBy',
                    where: { id: userId },
                    required: false,
                },
            ],
        });

        if (!existing) {
            return res.status(404).json({ error: 'Published story not found' });
        }

        if (existing.bookmarkedBy?.length > 0) {
            await existing.removeBookmarkedBy(userId);
            return res.status(200).json({ message: 'Bookmark successfully removed.', bookmarked: false });
        } else {
            await existing.addBookmarkedBy(userId);
            return res.status(201).json({ message: 'Bookmark successfully added.', bookmarked: true });
        }
    } catch (err) {
        next(err);
    }
});

storyController.get('/user-stories/:email', checkPermission('stories', 'read'), async (req, res, next) => {
    try {
        const { email } = req.params;

        const user = await user_account.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const stories = await user.getBookmarkedStories({
            where: { isDraft: false },
            include: storyConfig,
            order: [['id', 'ASC']],
            through: { attributes: [] },
        });

        if (stories.length === 0) {
            return res.status(200).json({
                message: 'No bookmarked stories found.',
                data: [],
            });
        }

        const storiesWithComments = await Promise.all(
            stories.map(async (story) => {
                const comments = await comment.findAll(getCommentConfig(story.id, 'story'));
                const transformed = await transformStory(story);
                transformed.comments = comments.map((comment) => transformComment(comment));
                return transformed;
            })
        );

        return res.status(200).json(storiesWithComments);
    } catch (err) {
        next(err);
    }
});

storyController.post('/:id/like', isAuth, checkPermission('stories', 'read'), async (req, res, next) => {
    try {
        const userId = parseInt(req.user.userId, 10);
        const storyId = parseInt(req.params.id, 10);

        const foundStory = await story.findByPk(storyId, {
            where: { isDraft: false },
        });

        if (!foundStory) {
            return res.status(404).json({ error: 'Published story not found' });
        }

        // Toggle like
        const existingLike = await story.sequelize.models.story_likes.findOne({
            where: {
                story_id: foundStory.id,
                user_id: userId,
            },
        });

        if (existingLike) {
            await existingLike.destroy();
            await foundStory.decrement('likes');

            const updatedCount = await story.sequelize.models.story_likes.count({
                where: { story_id: foundStory.id },
            });

            return res.status(200).json({
                message: 'Like removed',
                liked: false,
                likes: updatedCount,
            });
        } else {
            await story.sequelize.models.story_likes.create({
                story_id: foundStory.id,
                user_id: userId,
            });
            await foundStory.increment('likes');

            const updatedCount = await story.sequelize.models.story_likes.count({
                where: { story_id: foundStory.id },
            });

            return res.status(201).json({
                message: 'Story liked',
                liked: true,
                likes: updatedCount,
            });
        }
    } catch (err) {
        next(err);
    }
});

storyController.patch('/:id/view', checkPermission('stories', 'read'), async (req, res, next) => {
    try {
        const storyId = parseInt(req.params.id, 10);

        const foundStory = await story.findByPk(storyId, {
            where: { isDraft: false },
        });

        if (!foundStory) {
            return res.status(404).json({ error: 'Published story not found' });
        }

        await foundStory.increment('views');
        return res.status(200).json({ message: 'View tracked', views: foundStory.views + 1 });
    } catch (err) {
        next(err);
    }
});

storyController.get('/all-for-connections', isAuth, checkPermission('stories', 'read'), async (req, res, next) => {
    try {
        const stories = await story.findAll({
            attributes: ['id', 'slug', 'title', 'shortDescription', 'isDraft', 'createdAt'],
            order: [['createdAt', 'DESC']],
        });

        const transformedStories = stories.map((story) => ({
            id: story.id,
            slug: story.slug,
            title: story.title,
            shortDescription: story.shortDescription,
            isDraft: story.isDraft,
            createdAt: story.createdAt,
        }));

        return res.status(200).json({
            data: transformedStories,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = storyController;
