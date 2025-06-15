const initiativeController = require('express').Router();
const { where } = require('sequelize');
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');
const {
    initiative,
    image,
    project,
    downloadMaterial,
    story,
    publication,
    contact,
    section,
    user_account,
    comment,
    sponsor,
    partner,
} = require('../sequelize/models');
const customError = require('../utils/customError');
const { transformInitiative, initiativeConfig } = require('../utils/initiativeUtils');
const { transformComment, getCommentConfig } = require('../utils/commentUtils');
const { InitiativeSchema, UpdateInitiativeSchema } = require('../schemas/initiatives.schema');

initiativeController.get('/single/:id', async (req, res, next) => {
    try {
        const param = req.params.id;
        const initiativeId = parseInt(param);

        let foundInitiative;
        if (isNaN(initiativeId)) {
            foundInitiative = await initiative.findOne({
                where: { slug: param },
                include: initiativeConfig,
            });
        } else {
            foundInitiative = await initiative.findByPk(initiativeId, {
                include: initiativeConfig,
            });
        }

        if (!foundInitiative) {
            throw new customError({
                message: 'Initiative not found',
                statusCode: 404,
            });
        }

        const comments = await comment.findAll(getCommentConfig(foundInitiative.id, 'initiative'));

        const transformedInitiative = transformInitiative(foundInitiative);
        transformedInitiative.comments = comments.map((comment) => transformComment(comment));

        return res.status(200).json(transformedInitiative);
    } catch (err) {
        next(err);
    }
});

initiativeController.get('/user-initiatives/:email', async (req, res, next) => {
    try {
        const { email } = req.params;

        const user = await user_account.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const initiatives = await user.getBookmarkedInitiatives({
            include: initiativeConfig,
            order: [['id', 'ASC']],
            through: { attributes: [] },
        });

        const initiativesWithComments = await Promise.all(
            initiatives.map(async (initiative) => {
                const comments = await comment.findAll(getCommentConfig(initiative.id, 'initiative'));
                const transformed = transformInitiative(initiative);
                transformed.comments = comments.map((comment) => transformComment(comment));
                return transformed;
            })
        );

        return res.status(200).json(initiativesWithComments);
    } catch (err) {
        next(err);
    }
});

initiativeController.get('/all', async (req, res, next) => {
    try {
        const { page, limit } = req.query;

        const parsedPage = page ? parseInt(page) : 1;
        const parsedLimit = limit ? parseInt(limit) : 6;

        if (page && isNaN(parsedPage)) {
            throw new customError({
                message: 'Pagination page must be a number',
                statusCode: 400,
            });
        }

        if (limit && isNaN(parsedLimit)) {
            throw new customError({
                message: 'Pagination limit must be a number',
                statusCode: 400,
            });
        }

        const pageNumber = Math.max(1, parsedPage);
        const limitNumber = Math.max(1, parsedLimit);

        const totalCount = await initiative.count({
            distinct: true,
        });

        const totalPages = Math.ceil(totalCount / limitNumber);

        const actualPage = Math.min(pageNumber, totalPages);
        const offset = (actualPage - 1) * limitNumber;

        const initiatives = await initiative.findAll({
            include: initiativeConfig,
            limit: limitNumber,
            offset: offset,
            order: [['id', 'ASC']],
        });

        const initiativesWithComments = await Promise.all(
            initiatives.map(async (initiative) => {
                const comments = await comment.findAll(getCommentConfig(initiative.id, 'initiative'));
                const transformed = transformInitiative(initiative);
                transformed.comments = comments.map((comment) => transformComment(comment));
                return transformed;
            })
        );

        return res.status(200).json({
            data: initiativesWithComments,
            pagination: {
                page: actualPage,
                limit: limitNumber,
                totalInitiatives: totalCount,
                totalPages,
                hasNextPage: actualPage < totalPages,
                hasPrevPage: actualPage > 1,
            },
        });
    } catch (err) {
        next(err);
    }
});

initiativeController.post('/create', isAuth, async (req, res, next) => {
    try {
        const { location, ...restBody } = req.body;
        const initiativeData = {
            ...restBody,
            address: location?.address || null,
            lat: location?.coordinates?.lat || null,
            lng: location?.coordinates?.lng || null,
        };

        const validatedData = InitiativeSchema.parse(initiativeData);

        const result = await initiative.sequelize.transaction(async (t) => {
            // Create initiative
            const newInitiative = await initiative.create(
                {
                    creatorId: req.user.userId,
                    slug: validatedData.slug,
                    title: validatedData.title,
                    shortDescription: validatedData.shortDescription,
                    category: validatedData.category,
                    address: validatedData.address,
                    lat: validatedData.lat,
                    lng: validatedData.lng,
                    status: validatedData.status,
                    campaignStatus: validatedData.campaignStatus,
                    commentsEnabled: validatedData.commentsEnabled,
                },
                { transaction: t }
            );

            // Create main image
            if (validatedData.mainImage) {
                await image.create(
                    {
                        ...validatedData.mainImage,
                        imageableId: newInitiative.id,
                        imageLinkConnection: 'initiative',
                    },
                    { transaction: t }
                );
            }

            // Create projects
            if (validatedData.projects?.length > 0) {
                await Promise.all(
                    validatedData.projects.map((projectData) =>
                        project.create(
                            {
                                titleSlug: projectData.titleSlug,
                                slug: projectData.slug,
                                title: projectData.title,
                                description: projectData.description,
                                status: projectData.status,
                                image: projectData.image,
                                link: projectData.link,
                                location: projectData.location,
                                initiativeId: newInitiative.id,
                            },
                            { transaction: t }
                        )
                    )
                );
            }

            // Create download materials
            if (validatedData.downloadMaterials?.length > 0) {
                await Promise.all(
                    validatedData.downloadMaterials.map(async (materialData) => {
                        const { image: materialImage, ...materialFields } = materialData;
                        const createdMaterial = await downloadMaterial.create(
                            {
                                titleSlug: materialData.title,
                                title: materialData.title,
                                description: materialData.description,
                                fileType: materialData.fileType,
                                fileSize: parseFloat(materialData.fileSize),
                                downloadUrl: materialData.downloadUrl,
                                initiativeId: newInitiative.id,
                            },
                            { transaction: t }
                        );

                        if (materialImage) {
                            await image.create(
                                {
                                    ...materialImage,
                                    imageableId: createdMaterial.id,
                                    imageLinkConnection: 'downloadMaterial',
                                },
                                { transaction: t }
                            );
                        }
                    })
                );
            }

            // Create stories
            if (validatedData.stories?.length > 0) {
                await Promise.all(
                    validatedData.stories.map(async (storyData) => {
                        const { image: storyImage, ...storyFields } = storyData;
                        const createdStory = await story.create(
                            {
                                titleSlug: storyData.title,
                                title: storyData.title,
                                description: storyData.description,
                                link: storyData.link,
                                author: storyData.author,
                                publishedAt: storyData.publishedAt,
                                initiativeId: newInitiative.id,
                            },
                            { transaction: t }
                        );

                        if (storyImage) {
                            await image.create(
                                {
                                    ...storyImage,
                                    imageableId: createdStory.id,
                                    imageLinkConnection: 'story',
                                },
                                { transaction: t }
                            );
                        }
                    })
                );
            }

            // Create publications
            if (validatedData.publications?.length > 0) {
                await Promise.all(
                    validatedData.publications.map(async (publicationData) => {
                        const { image: publicationImage, ...publicationFields } = publicationData;
                        const createdPublication = await publication.create(
                            {
                                titleSlug: publicationData.title,
                                title: publicationData.title,
                                description: publicationData.description,
                                link: publicationData.link,
                                publishedAt: publicationData.publishedAt,
                                initiativeId: newInitiative.id,
                            },
                            { transaction: t }
                        );

                        if (publicationImage) {
                            await image.create(
                                {
                                    ...publicationImage,
                                    imageableId: createdPublication.id,
                                    imageLinkConnection: 'publication',
                                },
                                { transaction: t }
                            );
                        }
                    })
                );
            }

            // Create main contact
            if (validatedData.contact) {
                await contact.create(
                    {
                        ...validatedData.contact,
                        isMainContact: true,
                        initiativeId: newInitiative.id,
                    },
                    { transaction: t }
                );
            }

            // Create additional contacts
            if (validatedData.additionalContacts?.length > 0) {
                await Promise.all(
                    validatedData.additionalContacts.map((contactData) =>
                        contact.create(
                            {
                                ...contactData,
                                isMainContact: false,
                                initiativeId: newInitiative.id,
                            },
                            { transaction: t }
                        )
                    )
                );
            }

            // Create sections
            if (validatedData.sections?.length > 0) {
                await Promise.all(
                    validatedData.sections.map(async (sectionData) => {
                        const { image: sectionImage, ...sectionFields } = sectionData;
                        const createdSection = await section.create(
                            {
                                titleSlug: sectionData.titleSlug,
                                title: sectionData.title,
                                content: sectionData.content,
                                sectionableId: newInitiative.id,
                                sectionLinkConnection: 'initiative',
                            },
                            { transaction: t }
                        );

                        if (sectionImage) {
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

            // Create sponsors if provided
            if (validatedData.sponsors?.length > 0) {
                await Promise.all(
                    validatedData.sponsors.map(async (sponsorData) => {
                        const { logo, ...sponsorFields } = sponsorData;
                        const createdSponsor = await sponsor.create(
                            {
                                ...sponsorFields,
                                sponsorableId: newInitiative.id,
                                sponsor_link_connection: 'initiative',
                            },
                            { transaction: t }
                        );

                        if (logo) {
                            await image.create(
                                {
                                    ...logo,
                                    imageableId: createdSponsor.id,
                                    imageLinkConnection: 'sponsor',
                                },
                                { transaction: t }
                            );
                        }
                    })
                );
            }

            // Create partners if provided
            if (validatedData.partners?.length > 0) {
                await Promise.all(
                    validatedData.partners.map(async (partnerData) => {
                        const { logo, ...partnerFields } = partnerData;
                        const createdPartner = await partner.create(
                            {
                                ...partnerFields,
                                partnerableId: newInitiative.id,
                                partner_link_connection: 'initiative',
                            },
                            { transaction: t }
                        );

                        if (logo) {
                            await image.create(
                                {
                                    ...logo,
                                    imageableId: createdPartner.id,
                                    imageLinkConnection: 'partner',
                                },
                                { transaction: t }
                            );
                        }
                    })
                );
            }

            const completeInitiative = await initiative.findByPk(newInitiative.id, {
                include: initiativeConfig,
                transaction: t,
            });
            return completeInitiative;
        });

        const transformedResponse = transformInitiative(result);
        return res.status(201).json(transformedResponse);
    } catch (err) {
        next(err);
    }
});

initiativeController.post('/bookmark/:initiativeId', isAuth, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { initiativeId } = req.params;

        if (!initiativeId || isNaN(Number(initiativeId))) {
            return res.status(400).json({ error: 'Invalid initiative ID' });
        }

        const existing = await initiative.findOne({
            where: { id: initiativeId },
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
            return res.status(404).json({ error: 'Initiative not found' });
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

initiativeController.patch('/:id', isAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { location, ...restBody } = req.body;

        const initiativeData = {
            ...restBody,
            ...(location && {
                address: location.address,
                lat: location.coordinates?.lat,
                lng: location.coordinates?.lng,
            }),
        };

        const validatedData = UpdateInitiativeSchema.parse(initiativeData);

        const result = await initiative.sequelize.transaction(async (t) => {
            const foundInitiative = await initiative.findByPk(id, {
                include: initiativeConfig,
                transaction: t,
            });

            if (!foundInitiative) {
                throw new customError({
                    message: 'Initiative not found',
                    statusCode: 404,
                });
            }

            if (Number(foundInitiative.creator.id) !== Number(req.user.userId)) {
                throw new customError({
                    message: 'Unauthorized to update this initiative',
                    statusCode: 403,
                });
            }

            // Update initiative basic info
            await foundInitiative.update(
                {
                    ...(validatedData.slug && { slug: validatedData.slug }),
                    ...(validatedData.title && { title: validatedData.title }),
                    ...(validatedData.shortDescription && { shortDescription: validatedData.shortDescription }),
                    ...(validatedData.category && { category: validatedData.category }),
                    ...(validatedData.address && { address: validatedData.address }),
                    ...(validatedData.lat && { lat: validatedData.lat }),
                    ...(validatedData.lng && { lng: validatedData.lng }),
                    ...(validatedData.status && { status: validatedData.status }),
                    ...(validatedData.campaignStatus && { campaignStatus: validatedData.campaignStatus }),
                    ...(validatedData.commentsEnabled !== undefined && { commentsEnabled: validatedData.commentsEnabled }),
                },
                { transaction: t }
            );

            // Update main image if provided
            if (validatedData.mainImage) {
                await image.destroy({
                    where: {
                        imageableId: foundInitiative.id,
                        imageLinkConnection: 'initiative',
                    },
                    transaction: t,
                });
                await image.create(
                    {
                        ...validatedData.mainImage,
                        imageableId: foundInitiative.id,
                        imageLinkConnection: 'initiative',
                    },
                    { transaction: t }
                );
            }

            // Update projects
            if (validatedData.projects) {
                await project.destroy({
                    where: { initiativeId: foundInitiative.id },
                    transaction: t,
                });
                if (validatedData.projects.length > 0) {
                    await Promise.all(
                        validatedData.projects.map((projectData) =>
                            project.create(
                                {
                                    ...projectData,
                                    initiativeId: foundInitiative.id,
                                },
                                { transaction: t }
                            )
                        )
                    );
                }
            }

            // Update download materials
            if (validatedData.downloadMaterials) {
                await downloadMaterial.destroy({
                    where: { initiativeId: foundInitiative.id },
                    transaction: t,
                });
                if (validatedData.downloadMaterials.length > 0) {
                    await Promise.all(
                        validatedData.downloadMaterials.map(async (materialData) => {
                            const { image: materialImage, ...materialFields } = materialData;
                            const createdMaterial = await downloadMaterial.create(
                                {
                                    ...materialFields,
                                    initiativeId: foundInitiative.id,
                                },
                                { transaction: t }
                            );

                            if (materialImage) {
                                await image.create(
                                    {
                                        ...materialImage,
                                        imageableId: createdMaterial.id,
                                        imageLinkConnection: 'downloadMaterial',
                                    },
                                    { transaction: t }
                                );
                            }
                        })
                    );
                }
            }

            // Update stories
            if (validatedData.stories) {
                await story.destroy({
                    where: {
                        initiativeId: foundInitiative.id,
                    },
                    transaction: t,
                });
                if (validatedData.stories.length > 0) {
                    await Promise.all(
                        validatedData.stories.map(async (storyData) => {
                            const { image: storyImage, ...storyFields } = storyData;
                            const createdStory = await story.create(
                                {
                                    ...storyFields,
                                    initiativeId: foundInitiative.id,
                                },
                                { transaction: t }
                            );

                            if (storyImage) {
                                await image.create(
                                    {
                                        ...storyImage,
                                        imageableId: createdStory.id,
                                        imageLinkConnection: 'story',
                                    },
                                    { transaction: t }
                                );
                            }
                        })
                    );
                }
            }

            // Update publications
            if (validatedData.publications) {
                await publication.destroy({
                    where: {
                        initiativeId: foundInitiative.id,
                    },
                    transaction: t,
                });
                if (validatedData.publications.length > 0) {
                    await Promise.all(
                        validatedData.publications.map(async (publicationData) => {
                            const { image: publicationImage, ...publicationFields } = publicationData;
                            const createdPublication = await publication.create(
                                {
                                    ...publicationFields,
                                    initiativeId: foundInitiative.id,
                                },
                                { transaction: t }
                            );

                            if (publicationImage) {
                                await image.create(
                                    {
                                        ...publicationImage,
                                        imageableId: createdPublication.id,
                                        imageLinkConnection: 'publication',
                                    },
                                    { transaction: t }
                                );
                            }
                        })
                    );
                }
            }

            // Update contacts
            if (validatedData.contact) {
                await contact.destroy({
                    where: {
                        initiativeId: foundInitiative.id,
                        isMainContact: true,
                    },
                    transaction: t,
                });
                await contact.create(
                    {
                        ...validatedData.contact,
                        isMainContact: true,
                        initiativeId: foundInitiative.id,
                    },
                    { transaction: t }
                );
            }

            // Update additional contacts
            if (validatedData.additionalContacts) {
                await contact.destroy({
                    where: {
                        initiativeId: foundInitiative.id,
                        isMainContact: false,
                    },
                    transaction: t,
                });
                if (validatedData.additionalContacts.length > 0) {
                    await Promise.all(
                        validatedData.additionalContacts.map((contactData) =>
                            contact.create(
                                {
                                    ...contactData,
                                    isMainContact: false,
                                    initiativeId: foundInitiative.id,
                                },
                                { transaction: t }
                            )
                        )
                    );
                }
            }

            // Update sections
            if (validatedData.sections) {
                await section.destroy({
                    where: {
                        sectionableId: foundInitiative.id,
                        sectionLinkConnection: 'initiative',
                    },
                    transaction: t,
                });
                if (validatedData.sections.length > 0) {
                    await Promise.all(
                        validatedData.sections.map(async (sectionData) => {
                            const { image: sectionImage, ...sectionFields } = sectionData;
                            const createdSection = await section.create(
                                {
                                    ...sectionFields,
                                    sectionableId: foundInitiative.id,
                                    sectionLinkConnection: 'initiative',
                                },
                                { transaction: t }
                            );

                            if (sectionImage) {
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

            const updatedInitiative = await initiative.findByPk(id, {
                include: [...initiativeConfig, commentConfig],
                transaction: t,
            });

            return updatedInitiative;
        });

        const transformedResponse = transformInitiative(result);
        if (transformedResponse.comments) {
            transformedResponse.comments = transformedResponse.comments.map((comment) => transformComment(comment));
        }
        return res.status(200).json(transformedResponse);
    } catch (err) {
        next(err);
    }
});

initiativeController.delete('/:id', isAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await initiative.sequelize.transaction(async (t) => {
            const foundInitiative = await initiative.findByPk(id, {
                transaction: t,
            });

            if (!foundInitiative) {
                throw new customError({
                    message: 'Initiative not found',
                    statusCode: 404,
                });
            }

            // Check if user is the creator
            if (foundInitiative.creatorId !== req.user.userId) {
                throw new customError({
                    message: 'Unauthorized to delete this initiative',
                    statusCode: 403,
                });
            }

            // Delete all associated data
            await image.destroy({
                where: {
                    imageableId: id,
                    imageLinkConnection: 'initiative',
                },
                transaction: t,
            });

            await project.destroy({
                where: { initiativeId: id },
                transaction: t,
            });

            await downloadMaterial.destroy({
                where: { initiativeId: id },
                transaction: t,
            });

            await story.destroy({
                where: { initiativeId: id },
                transaction: t,
            });

            await publication.destroy({
                where: { initiativeId: id },
                transaction: t,
            });

            await contact.destroy({
                where: { initiativeId: id },
                transaction: t,
            });

            await section.destroy({
                where: {
                    sectionableId: id,
                    sectionLinkConnection: 'initiative',
                },
                transaction: t,
            });

            await comment.destroy({
                where: {
                    commentableId: id,
                    commentsLinkConnection: 'initiative',
                },
                transaction: t,
            });

            // Finally, delete the initiative
            await foundInitiative.destroy({ transaction: t });

            return { message: 'Initiative and all associated data deleted successfully' };
        });

        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = initiativeController;
