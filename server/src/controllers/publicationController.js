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

publicationController.post('/create', isAuth, checkPermission('publications', 'create'), async (req, res, next) => {
    try {
        const validatedData = await PublicationSchema.parseAsync(req.body);
        const publicationData = { ...validatedData };

        if (!publicationData.isDraft && !publicationData.publishedAt) {
            publicationData.publishedAt = new Date();
        }

        const result = await publication.sequelize.transaction(async (t) => {
            const newPublication = await publication.create(
                {
                    creatorId: req.user.userId,
                    ...publicationData,
                },
                { transaction: t }
            );

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

            if (publicationData.sections?.length > 0) {
                await Promise.all(
                    publicationData.sections.map(async (sectionData) => {
                        const { image: sectionImage, ...sectionFields } = sectionData;

                        const createdSection = await section.create(
                            {
                                ...sectionFields,
                                sectionableId: newPublication.id,
                                sectionLinkConnection: 'publication',
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

            if (publicationData.relatedPublications?.length > 0) {
                const relatedLinks = publicationData.relatedPublications.map((relatedPublicationId) => ({
                    publication_id: newPublication.id,
                    related_publication_id: relatedPublicationId,
                }));
                await publication.sequelize.models.related_publications.bulkCreate(relatedLinks, { transaction: t });
            }

            if (publicationData.connectedInitiativeIds?.length > 0) {
                const initiativeLinks = publicationData.connectedInitiativeIds.map((initiativeId) => ({
                    publication_id: newPublication.id,
                    initiative_id: initiativeId,
                }));
                await publication.sequelize.models.initiative_publications.bulkCreate(initiativeLinks, { transaction: t });
            }

            if (publicationData.connectedProjectIds?.length > 0) {
                const projectLinks = publicationData.connectedProjectIds.map((projectId) => ({
                    publication_id: newPublication.id,
                    project_id: projectId,
                }));
                await publication.sequelize.models.project_publications.bulkCreate(projectLinks, { transaction: t });
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
});

publicationController.patch('/:id', isAuth, checkPermission('publications', 'update'), async (req, res, next) => {
    try {
        const validatedData = UpdatePublicationSchema.parse(req.body);
        const publicationId = parseInt(req.params.id, 10);

        const result = await publication.sequelize.transaction(async (t) => {
            const foundPublication = await publication.findByPk(publicationId, {
                include: publicationConfig,
                transaction: t,
            });

            if (!foundPublication) {
                throw new CustomError({
                    message: 'Publication not found',
                    statusCode: 404,
                });
            }

            await foundPublication.update(validatedData, { transaction: t });

            if (validatedData.mainImage !== undefined) {
                await image.destroy({
                    where: {
                        imageableId: foundPublication.id,
                        imageLinkConnection: 'publication',
                    },
                    transaction: t,
                });

                if (validatedData.mainImage) {
                    await image.create(
                        {
                            ...validatedData.mainImage,
                            imageableId: foundPublication.id,
                            imageLinkConnection: 'publication',
                        },
                        { transaction: t }
                    );
                }
            }

            if (validatedData.sections !== undefined) {
                await section.destroy({
                    where: {
                        sectionableId: foundPublication.id,
                        sectionLinkConnection: 'publication',
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
                                    sectionableId: foundPublication.id,
                                    sectionLinkConnection: 'publication',
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

            if (validatedData.relatedPublications !== undefined) {
                await publication.sequelize.models.related_publications.destroy({
                    where: { publication_id: foundPublication.id },
                    transaction: t,
                });

                if (validatedData.relatedPublications.length > 0) {
                    const relatedLinks = validatedData.relatedPublications.map((relatedPublicationId) => ({
                        publication_id: foundPublication.id,
                        related_publication_id: relatedPublicationId,
                    }));
                    await publication.sequelize.models.related_publications.bulkCreate(relatedLinks, { transaction: t });
                }
            }

            if (validatedData.connectedInitiativeIds !== undefined) {
                await publication.sequelize.models.initiative_publications.destroy({
                    where: { publication_id: foundPublication.id },
                    transaction: t,
                });

                if (validatedData.connectedInitiativeIds.length > 0) {
                    const initiativeLinks = validatedData.connectedInitiativeIds.map((initiativeId) => ({
                        publication_id: foundPublication.id,
                        initiative_id: initiativeId,
                    }));
                    await publication.sequelize.models.initiative_publications.bulkCreate(initiativeLinks, { transaction: t });
                }
            }

            if (validatedData.connectedProjectIds !== undefined) {
                await publication.sequelize.models.project_publications.destroy({
                    where: { publication_id: foundPublication.id },
                    transaction: t,
                });

                if (validatedData.connectedProjectIds.length > 0) {
                    const projectLinks = validatedData.connectedProjectIds.map((projectId) => ({
                        publication_id: foundPublication.id,
                        project_id: projectId,
                    }));
                    await publication.sequelize.models.project_publications.bulkCreate(projectLinks, { transaction: t });
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
});

publicationController.get('/single/:id', isAuth.allowGuest, checkPermission('publications', 'read'), async (req, res, next) => {
    try {
        const param = req.params.id;
        const userId = req.user?.userId ? parseInt(req.user.userId, 10) : null;

        const foundPublication = await findBySlugOrId(publication, param, {
            include: publicationConfig,
        });

        if (!foundPublication) {
            throw new CustomError({
                message: 'Publication not found',
                statusCode: 404,
            });
        }

        const [comments, actualLikesCount, currentUserLiked] = await Promise.all([
            comment.findAll(getCommentConfig(foundPublication.id, 'publication')),
            publication.sequelize.models.publication_likes.count({
                where: { publication_id: foundPublication.id },
            }),
            userId
                ? publication.sequelize.models.publication_likes.findOne({
                      where: {
                          publication_id: foundPublication.id,
                          user_id: userId,
                      },
                  })
                : Promise.resolve(null),
        ]);

        const transformed = await transformPublication(foundPublication);
        transformed.comments = comments.map((comment) => transformComment(comment));
        transformed.likes = actualLikesCount;
        transformed.isLiked = !!currentUserLiked;

        delete transformed.likedBy;

        return res.status(200).json(transformed);
    } catch (err) {
        next(err);
    }
});

publicationController.get('/all', checkPermission('publications', 'read'), async (req, res, next) => {
    try {
        const { page = 1, limit = 10, isDraft } = req.query;

        let whereClause = {};
        if (isDraft !== undefined && isDraft !== null) {
            whereClause.isDraft = isDraft === 'true';
        }

        const totalCount = await publication.count({
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
            where: whereClause,
            include: publicationConfig,
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']],
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
});

publicationController.delete('/:id', isAuth, checkPermission('publications', 'delete'), async (req, res, next) => {
    try {
        const publicationId = parseInt(req.params.id, 10);

        await publication.sequelize.transaction(async (t) => {
            const foundPublication = await publication.findByPk(publicationId, {
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
                    message: 'Publication not found',
                    statusCode: 404,
                });
            }

            await publication.sequelize.models.related_publications.destroy({
                where: {
                    [Op.or]: [{ publication_id: foundPublication.id }, { related_publication_id: foundPublication.id }],
                },
                transaction: t,
            });

            await publication.sequelize.models.initiative_publications.destroy({
                where: { publication_id: foundPublication.id },
                transaction: t,
            });

            await publication.sequelize.models.project_publications.destroy({
                where: { publication_id: foundPublication.id },
                transaction: t,
            });

            const publicationSections = await section.findAll({
                where: {
                    sectionableId: foundPublication.id,
                    sectionLinkConnection: 'publication',
                },
                attributes: ['id'],
                transaction: t,
            });

            const sectionIds = publicationSections.map((s) => s.id);

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

            await image.destroy({
                where: {
                    imageableId: foundPublication.id,
                    imageLinkConnection: 'publication',
                },
                transaction: t,
            });

            // Delete sections
            await section.destroy({
                where: {
                    sectionableId: foundPublication.id,
                    sectionLinkConnection: 'publication',
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
            message: 'Publication deleted successfully',
        });
    } catch (err) {
        next(err);
    }
});

publicationController.patch('/toggle-draft/:id', isAuth, checkPermission('publications', 'update'), async (req, res, next) => {
    try {
        const publicationId = parseInt(req.params.id, 10);

        const result = await publication.sequelize.transaction(async (t) => {
            const foundPublication = await publication.findByPk(publicationId, { transaction: t });

            if (!foundPublication) {
                throw new CustomError({
                    message: 'Publication not found',
                    statusCode: 404,
                });
            }

            const wasDraft = foundPublication.isDraft;

            const updateData = {
                isDraft: !foundPublication.isDraft,
                publishedAt: foundPublication.isDraft ? new Date() : null,
            };

            await foundPublication.update(updateData, { transaction: t });

            return {
                id: foundPublication.id,
                slug: foundPublication.slug,
                wasDraft: wasDraft,
                isNowDraft: !wasDraft,
                publishedAt: updateData.publishedAt,
            };
        });

        const statusMessage = result.wasDraft
            ? `Publication '${result.slug}' has been published.`
            : `Publication '${result.slug}' has been converted to draft.`;

        return res.status(200).json({
            message: statusMessage,
            data: result,
        });
    } catch (err) {
        next(err);
    }
});

publicationController.post('/bookmark/:id', isAuth, checkPermission('publications', 'read'), async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const publicationId = parseInt(req.params.id, 10);

        const existing = await publication.findByPk(publicationId, {
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
        const userId = parseInt(req.user.userId, 10);
        const publicationId = parseInt(req.params.id, 10);

        const foundPublication = await publication.findByPk(publicationId, {
            where: { isDraft: false },
        });

        if (!foundPublication) {
            return res.status(404).json({ error: 'Published publication not found' });
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

            const updatedCount = await publication.sequelize.models.publication_likes.count({
                where: { publication_id: foundPublication.id },
            });

            return res.status(200).json({
                message: 'Like removed',
                liked: false,
                likes: updatedCount,
            });
        } else {
            await publication.sequelize.models.publication_likes.create({
                publication_id: foundPublication.id,
                user_id: userId,
            });
            await foundPublication.increment('likes');

            const updatedCount = await publication.sequelize.models.publication_likes.count({
                where: { publication_id: foundPublication.id },
            });

            return res.status(201).json({
                message: 'Publication liked',
                liked: true,
                likes: updatedCount,
            });
        }
    } catch (err) {
        next(err);
    }
});

publicationController.patch('/:id/view', checkPermission('publications', 'read'), async (req, res, next) => {
    try {
        const publicationId = parseInt(req.params.id, 10);

        const foundPublication = await publication.findByPk(publicationId, {
            where: { isDraft: false },
        });

        if (!foundPublication) {
            return res.status(404).json({ error: 'Published publication not found' });
        }

        await foundPublication.increment('views');
        return res.status(200).json({ message: 'View tracked', views: foundPublication.views + 1 });
    } catch (err) {
        next(err);
    }
});

publicationController.patch('/:id/download', checkPermission('publications', 'read'), async (req, res, next) => {
    try {
        const publicationId = parseInt(req.params.id, 10);

        const foundPublication = await publication.findByPk(publicationId, {
            where: { isDraft: false },
        });

        if (!foundPublication) {
            return res.status(404).json({ error: 'Published publication not found' });
        }

        await foundPublication.increment('downloads');
        return res.status(200).json({
            message: 'Download tracked',
            downloads: foundPublication.downloads + 1,
            downloadUrl: foundPublication.downloadUrl,
        });
    } catch (err) {
        next(err);
    }
});

publicationController.get('/all-for-connections', isAuth, checkPermission('publications', 'read'), async (req, res, next) => {
    try {
        const publications = await publication.findAll({
            attributes: ['id', 'slug', 'title', 'shortDescription', 'isDraft', 'createdAt'],
            order: [['createdAt', 'DESC']],
        });

        const transformedPublications = publications.map((pub) => ({
            id: pub.id,
            slug: pub.slug,
            title: pub.title,
            shortDescription: pub.shortDescription,
            isDraft: pub.isDraft,
            createdAt: pub.createdAt,
        }));

        return res.status(200).json({
            data: transformedPublications,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = publicationController;
