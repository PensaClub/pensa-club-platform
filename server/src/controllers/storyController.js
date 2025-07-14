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
        // Validate request body
        const validatedData = StorySchema.parse(req.body);
        const storyData = { ...validatedData, isDraft: false };
        return createStory(storyData, req, res, next);
    } catch (err) {
        next(err);
    }
});

storyController.post('/draft/save/:id?', isAuth, checkPermission('stories', 'draft', 'create'), async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            // For new drafts, use minimal validation since it's a draft
            const validatedData = UpdateStorySchema.parse(req.body);
            const storyData = { ...validatedData, isDraft: true };
            return createStory(storyData, req, res, next);
        }

        // For updating existing drafts
        const validatedData = UpdateStorySchema.parse(req.body);
        return updateStory(validatedData, req, res, next, true);
    } catch (err) {
        next(err);
    }
});

storyController.get('/draft/:id', isAuth, checkPermission('stories', 'draft', 'read'), async (req, res, next) => {
    return getSingleStoryByDraftStatus(true, req, res, next);
});

storyController.get('/single/:id', checkPermission('stories', 'read'), async (req, res, next) => {
    return getSingleStoryByDraftStatus(false, req, res, next);
});

storyController.get('/drafts', isAuth, checkPermission('stories', 'draft', 'read'), async (req, res, next) => {
    return getStoriesByDraftStatus(true, req, res, next);
});

storyController.get('/all', checkPermission('stories', 'read'), async (req, res, next) => {
    return getStoriesByDraftStatus(false, req, res, next);
});

storyController.delete('/draft/:id', isAuth, checkPermission('stories', 'draft', 'delete'), async (req, res, next) => {
    return deleteStoryByDraftStatus(true, req, res, next);
});

storyController.delete('/:id', isAuth, checkPermission('stories', 'delete'), async (req, res, next) => {
    return deleteStoryByDraftStatus(false, req, res, next);
});

storyController.put('/:id', isAuth, checkPermission('stories', 'update'), async (req, res, next) => {
    try {
        // Validate request body for updates
        const validatedData = UpdateStorySchema.parse(req.body);
        return updateStory(validatedData, req, res, next, false);
    } catch (err) {
        next(err);
    }
});

storyController.patch('/toggle-draft/:id', isAuth, checkPermission('stories', 'update'), async (req, res, next) => {
    try {
        const param = req.params.id;

        const result = await story.sequelize.transaction(async (t) => {
            const foundStory = await findBySlugOrId(story, param, { transaction: t });

            if (!foundStory) {
                throw new CustomError({
                    message: 'Story not found',
                    statusCode: 404,
                });
            }

            const wasDraft = foundStory.isDraft;
            await foundStory.update({ isDraft: !foundStory.isDraft }, { transaction: t });

            return {
                slug: foundStory.slug,
                wasDraft: wasDraft,
                isNowDraft: !wasDraft,
            };
        });

        const statusMessage = result.wasDraft
            ? `Story with slug '${result.slug}' has been changed from draft to published.`
            : `Story with slug '${result.slug}' has been changed from published to draft.`;

        return res.status(200).json({
            message: statusMessage,
        });
    } catch (err) {
        next(err);
    }
});

storyController.post('/bookmark/:id', isAuth, checkPermission('stories', 'read'), async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const param = req.params.id;

        const existing = await findBySlugOrId(story, param, {
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
        const userId = req.user.userId;
        const param = req.params.id;

        const foundStory = await findBySlugOrId(story, param, {
            where: { isDraft: false },
        });

        if (!foundStory) {
            return res.status(404).json({ error: 'Story not found' });
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
            return res.status(200).json({ message: 'Like removed', liked: false });
        } else {
            await story.sequelize.models.story_likes.create({
                story_id: foundStory.id,
                user_id: userId,
            });
            await foundStory.increment('likes');
            return res.status(201).json({ message: 'Story liked', liked: true });
        }
    } catch (err) {
        next(err);
    }
});

storyController.post('/:id/view', checkPermission('stories', 'read'), async (req, res, next) => {
    try {
        const param = req.params.id;

        const foundStory = await findBySlugOrId(story, param, {
            where: { isDraft: false },
        });

        if (!foundStory) {
            return res.status(404).json({ error: 'Story not found' });
        }

        await foundStory.increment('views');
        return res.status(200).json({ message: 'View tracked' });
    } catch (err) {
        next(err);
    }
});

// ========================================
// FUNCTIONS
// ========================================

const getSingleStoryByDraftStatus = async (isDraft, req, res, next) => {
    try {
        const param = req.params.id;

        const foundStory = await findBySlugOrId(story, param, {
            where: { isDraft: isDraft },
            include: storyConfig,
        });

        if (!foundStory) {
            throw new CustomError({
                message: `Story not found${isDraft ? ' or not a draft' : ''}`,
                statusCode: 404,
            });
        }

        const comments = await comment.findAll(getCommentConfig(foundStory.id, 'story'));

        const transformed = await transformStory(foundStory);
        transformed.comments = comments.map((comment) => transformComment(comment));

        return res.status(200).json(transformed);
    } catch (err) {
        next(err);
    }
};

const deleteStoryByDraftStatus = async (isDraft, req, res, next) => {
    try {
        const param = req.params.id;

        await story.sequelize.transaction(async (t) => {
            const foundStory = await findBySlugOrId(story, param, {
                where: { isDraft: isDraft },
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
                    message: `Story not found${isDraft ? ' or not a draft' : ''}`,
                    statusCode: 404,
                });
            }

            // Delete related stories (both directions)
            await story.sequelize.models.related_stories.destroy({
                where: {
                    [Op.or]: [{ story_id: foundStory.id }, { related_story_id: foundStory.id }],
                },
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
            message: `${isDraft ? 'Draft ' : ''}Story deleted successfully`,
        });
    } catch (err) {
        next(err);
    }
};

const getStoriesByDraftStatus = async (isDraft, req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const totalCount = await story.count({
            distinct: true,
            where: {
                isDraft: isDraft,
            },
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
            where: {
                isDraft: isDraft,
            },
            include: storyConfig,
            limit: limit,
            offset: offset,
            order: [['id', 'ASC']],
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
};

const createStory = async (storyData, req, res, next) => {
    try {
        const result = await story.sequelize.transaction(async (t) => {
            const newStory = await story.create(
                {
                    creatorId: req.user.userId,
                    ...storyData,
                },
                { transaction: t }
            );

            // Create main image if provided
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

            // Create sections with their images
            if (storyData.sections?.length > 0) {
                await Promise.all(
                    storyData.sections.map(async (sectionData) => {
                        const { images: sectionImages, ...sectionFields } = sectionData;
                        const createdSection = await section.create(
                            {
                                ...sectionFields,
                                sectionableId: newStory.id,
                                sectionLinkConnection: 'story',
                            },
                            { transaction: t }
                        );

                        if (sectionImages && Array.isArray(sectionImages)) {
                            await Promise.all(
                                sectionImages.map((imageData) =>
                                    image.create(
                                        {
                                            ...imageData,
                                            imageableId: createdSection.id,
                                            imageLinkConnection: 'section',
                                        },
                                        { transaction: t }
                                    )
                                )
                            );
                        }
                    })
                );
            }

            // Handle related stories
            if (storyData.relatedStories?.length > 0) {
                await Promise.all(
                    storyData.relatedStories.map((relatedStoryId) =>
                        story.sequelize.models.related_stories.create(
                            {
                                story_id: newStory.id,
                                related_story_id: relatedStoryId,
                            },
                            { transaction: t }
                        )
                    )
                );
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
};

const updateStory = async (storyData, req, res, next, isDraft = false) => {
    try {
        const param = req.params.id;

        const result = await story.sequelize.transaction(async (t) => {
            const foundStory = await findBySlugOrId(story, param, {
                where: { isDraft: isDraft },
                include: [
                    ...storyConfig,
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
                    message: `Story not found${isDraft ? ' or not a draft' : ''}`,
                    statusCode: 404,
                });
            }

            await foundStory.update({ ...storyData, isDraft: isDraft }, { transaction: t });

            // Update main image if provided
            if (storyData.mainImage) {
                await image.destroy({
                    where: {
                        imageableId: foundStory.id,
                        imageLinkConnection: 'story',
                    },
                    transaction: t,
                });

                await image.create(
                    {
                        ...storyData.mainImage,
                        imageableId: foundStory.id,
                        imageLinkConnection: 'story',
                    },
                    { transaction: t }
                );
            }

            // Update sections if provided
            if (storyData.sections !== undefined) {
                await section.destroy({
                    where: {
                        sectionableId: foundStory.id,
                        sectionLinkConnection: 'story',
                    },
                    transaction: t,
                });
                if (storyData.sections?.length > 0) {
                    await Promise.all(
                        storyData.sections.map(async (sectionData) => {
                            const { images: sectionImages, ...sectionFields } = sectionData;
                            const createdSection = await section.create(
                                {
                                    ...sectionFields,
                                    sectionableId: foundStory.id,
                                    sectionLinkConnection: 'story',
                                },
                                { transaction: t }
                            );

                            if (sectionImages && Array.isArray(sectionImages)) {
                                await Promise.all(
                                    sectionImages.map((imageData) =>
                                        image.create(
                                            {
                                                ...imageData,
                                                imageableId: createdSection.id,
                                                imageLinkConnection: 'section',
                                            },
                                            { transaction: t }
                                        )
                                    )
                                );
                            }
                        })
                    );
                }
            }

            // Handle related stories
            if (storyData.relatedStories !== undefined) {
                // Delete existing relations
                await story.sequelize.models.related_stories.destroy({
                    where: { story_id: foundStory.id },
                    transaction: t,
                });

                // Create new relations
                if (storyData.relatedStories.length > 0) {
                    await Promise.all(
                        storyData.relatedStories.map((relatedStoryId) =>
                            story.sequelize.models.related_stories.create(
                                {
                                    story_id: foundStory.id,
                                    related_story_id: relatedStoryId,
                                },
                                { transaction: t }
                            )
                        )
                    );
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
};

module.exports = storyController;
