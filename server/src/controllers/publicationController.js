const publicationController = require('express').Router();
const { where, Op } = require('sequelize');
const isAuth = require('../middlewares/isAuth');
const { checkPermission } = require('../middlewares/rbac');
const { publication, section, image, user_account, comment } = require('../sequelize/models');
const CustomError = require('../utils/customError');
const { publicationConfig, transformPublication } = require('../utils/publicationUtils');
const { transformComment, getCommentConfig } = require('../utils/commentUtils');
const { findBySlugOrId } = require('../utils/modelLookup');
const { PublicationSchema, UpdatePublicationSchema } = require('../schemas/publications.schema');

// ========================================
// ENDPOINTS
// ========================================

publicationController.post('/create', isAuth, checkPermission('publications', 'create'), async (req, res, next) => {
    try {
        // Validate request body
        const validationResult = PublicationSchema.safeParse(req.body);
        const publicationData = { ...validationResult.data, isDraft: false };
        return createPublication(publicationData, req, res, next);
    } catch (err) {
        next(err);
    }
});

publicationController.post('/draft/save/:id?', isAuth, checkPermission('publications', 'draft', 'create'), async (req, res, next) => {
    try {
        const { id } = req.params;

        // For draft creation, use a more lenient validation
        const validationResult = UpdatePublicationSchema.safeParse(req.body);
        if (!id) {
            const publicationData = { ...validationResult.data, isDraft: true };
            return createPublication(publicationData, req, res, next);
        }

        return updatePublication(validationResult.data, req, res, next, true);
    } catch (err) {
        next(err);
    }
});

publicationController.get('/draft/:id', isAuth, checkPermission('publications', 'draft', 'read'), async (req, res, next) => {
    return getSinglePublicationByDraftStatus(true, req, res, next);
});

publicationController.get('/single/:id', checkPermission('publications', 'read'), async (req, res, next) => {
    return getSinglePublicationByDraftStatus(false, req, res, next);
});

publicationController.get('/drafts', isAuth, checkPermission('publications', 'draft', 'read'), async (req, res, next) => {
    return getPublicationsByDraftStatus(true, req, res, next);
});

publicationController.get('/all', checkPermission('publications', 'read'), async (req, res, next) => {
    return getPublicationsByDraftStatus(false, req, res, next);
});

publicationController.delete('/draft/:id', isAuth, checkPermission('publications', 'draft', 'delete'), async (req, res, next) => {
    return deletePublicationByDraftStatus(true, req, res, next);
});

publicationController.delete('/:id', isAuth, checkPermission('publications', 'delete'), async (req, res, next) => {
    return deletePublicationByDraftStatus(false, req, res, next);
});

publicationController.put('/:id', isAuth, checkPermission('publications', 'update'), async (req, res, next) => {
    try {
        const validationResult = UpdatePublicationSchema.safeParse(req.body);
        return updatePublication(validationResult.data, req, res, next, false);
    } catch (err) {
        next(err);
    }
});

publicationController.patch('/toggle-draft/:id', isAuth, checkPermission('publications', 'update'), async (req, res, next) => {
    try {
        const param = req.params.id;

        const result = await publication.sequelize.transaction(async (t) => {
            const foundPublication = await findBySlugOrId(publication, param, { transaction: t });

            if (!foundPublication) {
                throw new CustomError({
                    message: 'Publication not found',
                    statusCode: 404,
                });
            }

            const wasDraft = foundPublication.isDraft;
            await foundPublication.update({ isDraft: !foundPublication.isDraft }, { transaction: t });

            return {
                slug: foundPublication.slug,
                wasDraft: wasDraft,
                isNowDraft: !wasDraft,
            };
        });

        const statusMessage = result.wasDraft
            ? `Publication with slug '${result.slug}' has been changed from draft to published.`
            : `Publication with slug '${result.slug}' has been changed from published to draft.`;

        return res.status(200).json({
            message: statusMessage,
        });
    } catch (err) {
        next(err);
    }
});

publicationController.post('/bookmark/:id', isAuth, checkPermission('publications', 'read'), async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const param = req.params.id;

        const existing = await findBySlugOrId(publication, param, {
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
            return res.status(404).json({ error: 'Published publication not found' });
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

publicationController.get('/user-publications/:email', checkPermission('publications', 'read'), async (req, res, next) => {
    try {
        const { email } = req.params;

        const user = await user_account.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const publications = await user.getBookmarkedPublications({
            where: { isDraft: false },
            include: publicationConfig,
            order: [['id', 'ASC']],
            through: { attributes: [] },
        });

        if (publications.length === 0) {
            return res.status(200).json({
                message: 'No bookmarked publications found.',
                data: [],
            });
        }

        const publicationsWithComments = await Promise.all(
            publications.map(async (publication) => {
                const comments = await comment.findAll(getCommentConfig(publication.id, 'publication'));
                const transformed = await transformPublication(publication);
                transformed.comments = comments.map((comment) => transformComment(comment));
                return transformed;
            })
        );

        return res.status(200).json(publicationsWithComments);
    } catch (err) {
        next(err);
    }
});

publicationController.post('/:id/like', isAuth, checkPermission('publications', 'read'), async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const param = req.params.id;

        const foundPublication = await findBySlugOrId(publication, param, {
            where: { isDraft: false },
        });

        if (!foundPublication) {
            return res.status(404).json({ error: 'Publication not found' });
        }

        // Toggle like
        const existingLike = await publication.sequelize.models.publication_likes.findOne({
            where: {
                publication_id: foundPublication.id,
                user_id: userId,
            },
        });

        if (existingLike) {
            await existingLike.destroy();
            await foundPublication.decrement('likes');
            return res.status(200).json({ message: 'Like removed', liked: false });
        } else {
            await publication.sequelize.models.publication_likes.create({
                publication_id: foundPublication.id,
                user_id: userId,
            });
            await foundPublication.increment('likes');
            return res.status(201).json({ message: 'Publication liked', liked: true });
        }
    } catch (err) {
        next(err);
    }
});

publicationController.post('/:id/view', checkPermission('publications', 'read'), async (req, res, next) => {
    try {
        const param = req.params.id;

        const foundPublication = await findBySlugOrId(publication, param, {
            where: { isDraft: false },
        });

        if (!foundPublication) {
            return res.status(404).json({ error: 'Publication not found' });
        }

        await foundPublication.increment('views');
        return res.status(200).json({ message: 'View tracked' });
    } catch (err) {
        next(err);
    }
});

publicationController.post('/:id/download', checkPermission('publications', 'read'), async (req, res, next) => {
    try {
        const param = req.params.id;

        const foundPublication = await findBySlugOrId(publication, param, {
            where: { isDraft: false },
        });

        if (!foundPublication) {
            return res.status(404).json({ error: 'Publication not found' });
        }

        await foundPublication.increment('downloads');
        return res.status(200).json({
            message: 'Download tracked',
            downloadUrl: foundPublication.downloadUrl,
        });
    } catch (err) {
        next(err);
    }
});

// ========================================
// FUNCTIONS
// ========================================

const getSinglePublicationByDraftStatus = async (isDraft, req, res, next) => {
    try {
        const param = req.params.id;

        const foundPublication = await findBySlugOrId(publication, param, {
            where: { isDraft: isDraft },
            include: publicationConfig,
        });

        if (!foundPublication) {
            throw new CustomError({
                message: `Publication not found${isDraft ? ' or not a draft' : ''}`,
                statusCode: 404,
            });
        }

        const comments = await comment.findAll(getCommentConfig(foundPublication.id, 'publication'));

        const transformed = await transformPublication(foundPublication);
        transformed.comments = comments.map((comment) => transformComment(comment));

        return res.status(200).json(transformed);
    } catch (err) {
        next(err);
    }
};

const deletePublicationByDraftStatus = async (isDraft, req, res, next) => {
    try {
        const param = req.params.id;

        await publication.sequelize.transaction(async (t) => {
            const foundPublication = await findBySlugOrId(publication, param, {
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

            if (!foundPublication) {
                throw new CustomError({
                    message: `Publication not found${isDraft ? ' or not a draft' : ''}`,
                    statusCode: 404,
                });
            }

            // Delete related publications (both directions)
            await publication.sequelize.models.publication_relations.destroy({
                where: {
                    [Op.or]: [{ publication_id: foundPublication.id }, { related_publication_id: foundPublication.id }],
                },
                transaction: t,
            });

            await image.destroy({
                where: {
                    imageableId: foundPublication.id,
                    imageLinkConnection: 'publication',
                },
                transaction: t,
            });

            await publication.sequelize.models.publication_bookmarks.destroy({
                where: { publication_id: foundPublication.id },
                transaction: t,
            });

            await publication.sequelize.models.publication_likes.destroy({
                where: { publication_id: foundPublication.id },
                transaction: t,
            });

            await section.destroy({
                where: {
                    sectionableId: foundPublication.id,
                    sectionLinkConnection: 'publication',
                },
                transaction: t,
            });

            await comment.destroy({
                where: {
                    commentableId: foundPublication.id,
                    commentsLinkConnection: 'publication',
                },
                transaction: t,
            });

            await foundPublication.destroy({ transaction: t });
        });

        return res.status(200).json({
            message: `${isDraft ? 'Draft ' : ''}Publication deleted successfully`,
        });
    } catch (err) {
        next(err);
    }
};

const getPublicationsByDraftStatus = async (isDraft, req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const totalCount = await publication.count({
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
                    totalPublications: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            });
        }

        const actualPage = Math.min(page, totalPages);
        const offset = (actualPage - 1) * limit;

        const publications = await publication.findAll({
            where: {
                isDraft: isDraft,
            },
            include: publicationConfig,
            limit: limit,
            offset: offset,
            order: [['id', 'ASC']],
        });

        const transformedList = await Promise.all(
            publications.map(async (publication) => {
                const comments = await comment.findAll(getCommentConfig(publication.id, 'publication'));
                const transformed = await transformPublication(publication);
                transformed.comments = comments.map((comment) => transformComment(comment));
                return transformed;
            })
        );

        return res.status(200).json({
            data: transformedList,
            pagination: {
                page: actualPage,
                limit: limit,
                totalPublications: totalCount,
                totalPages,
                hasNextPage: actualPage < totalPages,
                hasPrevPage: actualPage > 1,
            },
        });
    } catch (err) {
        next(err);
    }
};

const createPublication = async (publicationData, req, res, next) => {
    try {
        const result = await publication.sequelize.transaction(async (t) => {
            const newPublication = await publication.create(
                {
                    creatorId: req.user.userId,
                    ...publicationData,
                },
                { transaction: t }
            );

            // Create main image if provided
            if (publicationData.mainImage) {
                await image.create(
                    {
                        ...publicationData.mainImage,
                        imageableId: newPublication.id,
                        imageLinkConnection: 'publication',
                    },
                    { transaction: t }
                );
            }

            // Create sections with their images
            if (publicationData.sections?.length > 0) {
                await Promise.all(
                    publicationData.sections.map(async (sectionData) => {
                        const { images: sectionImages, ...sectionFields } = sectionData;
                        const createdSection = await section.create(
                            {
                                ...sectionFields,
                                sectionableId: newPublication.id,
                                sectionLinkConnection: 'publication',
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

            // Handle related publications
            if (publicationData.relatedPublications?.length > 0) {
                await Promise.all(
                    publicationData.relatedPublications.map((relatedPublicationId) =>
                        publication.sequelize.models.publication_relations.create(
                            {
                                publication_id: newPublication.id,
                                related_publication_id: relatedPublicationId,
                            },
                            { transaction: t }
                        )
                    )
                );
            }

            const completePublication = await publication.findByPk(newPublication.id, {
                include: publicationConfig,
                transaction: t,
            });
            return completePublication;
        });

        const transformedResponse = await transformPublication(result);
        return res.status(201).json(transformedResponse);
    } catch (err) {
        next(err);
    }
};

const updatePublication = async (publicationData, req, res, next, isDraft = false) => {
    try {
        const param = req.params.id;

        const result = await publication.sequelize.transaction(async (t) => {
            const foundPublication = await findBySlugOrId(publication, param, {
                where: { isDraft: isDraft },
                include: [
                    ...publicationConfig,
                    {
                        model: user_account,
                        as: 'creator',
                        attributes: ['id', 'email'],
                    },
                ],
                transaction: t,
            });

            if (!foundPublication) {
                throw new CustomError({
                    message: `Publication not found${isDraft ? ' or not a draft' : ''}`,
                    statusCode: 404,
                });
            }

            await foundPublication.update({ ...publicationData, isDraft: isDraft }, { transaction: t });

            // Update main image if provided
            if (publicationData.mainImage) {
                await image.destroy({
                    where: {
                        imageableId: foundPublication.id,
                        imageLinkConnection: 'publication',
                    },
                    transaction: t,
                });

                await image.create(
                    {
                        ...publicationData.mainImage,
                        imageableId: foundPublication.id,
                        imageLinkConnection: 'publication',
                    },
                    { transaction: t }
                );
            }

            // Update sections if provided
            if (publicationData.sections !== undefined) {
                await section.destroy({
                    where: {
                        sectionableId: foundPublication.id,
                        sectionLinkConnection: 'publication',
                    },
                    transaction: t,
                });
                if (publicationData.sections?.length > 0) {
                    await Promise.all(
                        publicationData.sections.map(async (sectionData) => {
                            const { images: sectionImages, ...sectionFields } = sectionData;
                            const createdSection = await section.create(
                                {
                                    ...sectionFields,
                                    sectionableId: foundPublication.id,
                                    sectionLinkConnection: 'publication',
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

            // Handle related publications
            if (publicationData.relatedPublications !== undefined) {
                // Delete existing relations
                await publication.sequelize.models.publication_relations.destroy({
                    where: { publication_id: foundPublication.id },
                    transaction: t,
                });

                // Create new relations
                if (publicationData.relatedPublications.length > 0) {
                    await Promise.all(
                        publicationData.relatedPublications.map((relatedPublicationId) =>
                            publication.sequelize.models.publication_relations.create(
                                {
                                    publication_id: foundPublication.id,
                                    related_publication_id: relatedPublicationId,
                                },
                                { transaction: t }
                            )
                        )
                    );
                }
            }

            const updatedPublication = await publication.findByPk(foundPublication.id, {
                include: publicationConfig,
                transaction: t,
            });

            return updatedPublication;
        });

        const transformedResponse = await transformPublication(result);
        return res.status(200).json(transformedResponse);
    } catch (err) {
        next(err);
    }
};

module.exports = publicationController;
