const initiativeController = require('express').Router();
const { where, Op } = require('sequelize');
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

initiativeController.post('/bookmark/:initiativeId', isAuth, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const param = req.params.initiativeId;
        const initiativeId = parseInt(param);

        let existing;
        if (isNaN(initiativeId)) {
            // If param is not a number, treat it as a slug
            existing = await initiative.findOne({
                where: { slug: param },
                include: [
                    {
                        model: user_account,
                        as: 'bookmarkedBy',
                        where: { id: userId },
                        required: false,
                    },
                ],
            });
        } else {
            existing = await initiative.findOne({
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
        }

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

initiativeController.post('/create', isAuth, async (req, res, next) => {
    try {
        const result = await initiative.sequelize.transaction(async (t) => {
            // Create initiative
            const newInitiative = await initiative.create(
                {
                    creatorId: req.user.userId,
                    ...req.body,
                },
                { transaction: t }
            );

            // Create main image and its gallery
            if (req.body.mainImage) {
                const { gallery, ...mainImageData } = req.body.mainImage;

                // Create main image
                await image.create(
                    {
                        ...mainImageData,
                        imageableId: newInitiative.id,
                        imageLinkConnection: 'initiative_main',
                    },
                    { transaction: t }
                );

                // Create gallery images if they exist
                if (gallery?.length > 0) {
                    await Promise.all(
                        gallery.map((imageData) =>
                            image.create(
                                {
                                    ...imageData,
                                    imageableId: newInitiative.id,
                                    imageLinkConnection: 'initiative_gallery',
                                },
                                { transaction: t }
                            )
                        )
                    );
                }
            }

            // Create logo
            if (req.body.logo) {
                await image.create(
                    {
                        ...req.body.logo,
                        imageableId: newInitiative.id,
                        imageLinkConnection: 'initiative_logo',
                    },
                    { transaction: t }
                );
            }

            // Create main contact
            if (req.body.contact) {
                await contact.create(
                    {
                        ...req.body.contact,
                        contactableId: newInitiative.id,
                        contactLinkConnection: 'initiative_contact',
                        isMainContact: true,
                    },
                    { transaction: t }
                );
            }

            // Create additional contacts
            if (req.body.additionalContacts?.length > 0) {
                await Promise.all(
                    req.body.additionalContacts.map((contactData) =>
                        contact.create(
                            {
                                ...contactData,
                                contactableId: newInitiative.id,
                                contactLinkConnection: 'initiative_additional',
                                isMainContact: false,
                            },
                            { transaction: t }
                        )
                    )
                );
            }

            // Create responsible contact
            if (req.body.responsible) {
                await contact.create(
                    {
                        ...req.body.responsible,
                        contactableId: newInitiative.id,
                        contactLinkConnection: 'initiative_responsible',
                    },
                    { transaction: t }
                );
            }

            // Create sections with their images
            if (req.body.sections?.length > 0) {
                await Promise.all(
                    req.body.sections.map(async (sectionData) => {
                        const { image: sectionImage, ...sectionFields } = sectionData;
                        const createdSection = await section.create(
                            {
                                ...sectionFields,
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

            // Create sponsors with their logos
            if (req.body.sponsors?.length > 0) {
                await Promise.all(
                    req.body.sponsors.map(async (sponsorData) => {
                        const { id: sponsorId, logo: sponsorLogo, ...sponsorFields } = sponsorData;
                        const createdSponsor = await sponsor.create(
                            {
                                ...sponsorFields,
                                sponsorableId: newInitiative.id,
                                sponsorLinkConnection: 'initiative',
                            },
                            { transaction: t }
                        );

                        if (sponsorLogo) {
                            const { id: sponsorLogoId, ...logoData } = sponsorLogo;
                            await image.create(
                                {
                                    ...logoData,
                                    imageableId: createdSponsor.id,
                                    imageLinkConnection: 'sponsor',
                                },
                                { transaction: t }
                            );
                        }
                    })
                );
            }

            // Create partners with their logos
            if (req.body.partners?.length > 0) {
                await Promise.all(
                    req.body.partners.map(async (partnerData) => {
                        const { id: partnerId, logo: partnerLogo, ...partnerFields } = partnerData;
                        const createdPartner = await partner.create(
                            {
                                ...partnerFields,
                                partnerableId: newInitiative.id,
                                partnerLinkConnection: 'initiative',
                            },
                            { transaction: t }
                        );

                        if (partnerLogo) {
                            const { id: partnerLogoId, ...logoData } = partnerLogo;
                            await image.create(
                                {
                                    ...logoData,
                                    imageableId: createdPartner.id,
                                    imageLinkConnection: 'partner',
                                },
                                { transaction: t }
                            );
                        }
                    })
                );
            }

            // Create download materials
            if (req.body.downloadMaterials?.length > 0) {
                await Promise.all(
                    req.body.downloadMaterials.map(async (materialData) => {
                        const { image: materialImage, ...materialFields } = materialData;
                        const createdMaterial = await downloadMaterial.create(
                            {
                                ...materialFields,
                                downloadableId: newInitiative.id,
                                downloadLinkConnection: 'initiative_materials',
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

            // Create documents
            if (req.body.documents?.length > 0) {
                await Promise.all(
                    req.body.documents.map(async (documentData) => {
                        const { image: documentImage, ...documentFields } = documentData;
                        const createdDocument = await downloadMaterial.create(
                            {
                                ...documentFields,
                                downloadableId: newInitiative.id,
                                downloadLinkConnection: 'initiative_documents',
                            },
                            { transaction: t }
                        );

                        if (documentImage) {
                            await image.create(
                                {
                                    ...documentImage,
                                    imageableId: createdDocument.id,
                                    imageLinkConnection: 'downloadMaterial',
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

initiativeController.patch('/:id', isAuth, async (req, res, next) => {
    try {
        const param = req.params.id;
        const initiativeId = parseInt(param);

        const result = await initiative.sequelize.transaction(async (t) => {
            let foundInitiative;
            if (isNaN(initiativeId)) {
                foundInitiative = await initiative.findOne({
                    where: { slug: param },
                    include: [
                        ...initiativeConfig,
                        {
                            model: user_account,
                            as: 'creator',
                            attributes: ['id', 'email'],
                        },
                    ],
                    transaction: t,
                });
            } else {
                foundInitiative = await initiative.findByPk(initiativeId, {
                    include: [
                        ...initiativeConfig,
                        {
                            model: user_account,
                            as: 'creator',
                            attributes: ['id', 'email'],
                        },
                    ],
                    transaction: t,
                });
            }

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

            await foundInitiative.update(req.body, { transaction: t });

            // Update main image and gallery if provided
            if (req.body.mainImage) {
                const { gallery, ...mainImageData } = req.body.mainImage;

                // Delete existing main image and gallery
                await image.destroy({
                    where: {
                        imageableId: foundInitiative.id,
                        imageLinkConnection: ['initiative_main', 'initiative_gallery'],
                    },
                    transaction: t,
                });

                // Create new main image
                await image.create(
                    {
                        ...mainImageData,
                        imageableId: foundInitiative.id,
                        imageLinkConnection: 'initiative_main',
                    },
                    { transaction: t }
                );

                // Create new gallery images if provided
                if (gallery?.length > 0) {
                    await Promise.all(
                        gallery.map((imageData) =>
                            image.create(
                                {
                                    ...imageData,
                                    imageableId: foundInitiative.id,
                                    imageLinkConnection: 'initiative_gallery',
                                },
                                { transaction: t }
                            )
                        )
                    );
                }
            }

            // Update logo if provided
            if (req.body.logo) {
                await image.destroy({
                    where: {
                        imageableId: foundInitiative.id,
                        imageLinkConnection: 'initiative_logo',
                    },
                    transaction: t,
                });
                await image.create(
                    {
                        ...req.body.logo,
                        imageableId: foundInitiative.id,
                        imageLinkConnection: 'initiative_logo',
                    },
                    { transaction: t }
                );
            }

            // Update contact if provided
            if (req.body.contact) {
                await contact.destroy({
                    where: {
                        contactableId: foundInitiative.id,
                        contactLinkConnection: 'initiative_contact',
                    },
                    transaction: t,
                });
                await contact.create(
                    {
                        ...req.body.contact,
                        contactableId: foundInitiative.id,
                        contactLinkConnection: 'initiative_contact',
                        isMainContact: true,
                    },
                    { transaction: t }
                );
            }

            // Update additional contacts if provided
            if (req.body.additionalContacts) {
                await contact.destroy({
                    where: {
                        contactableId: foundInitiative.id,
                        contactLinkConnection: 'initiative_additional',
                    },
                    transaction: t,
                });
                if (req.body.additionalContacts.length > 0) {
                    await Promise.all(
                        req.body.additionalContacts.map((contactData) =>
                            contact.create(
                                {
                                    ...contactData,
                                    contactableId: foundInitiative.id,
                                    contactLinkConnection: 'initiative_additional',
                                    isMainContact: false,
                                },
                                { transaction: t }
                            )
                        )
                    );
                }
            }

            // Update responsible contact if provided
            if (req.body.responsible) {
                await contact.destroy({
                    where: {
                        contactableId: foundInitiative.id,
                        contactLinkConnection: 'initiative_responsible',
                    },
                    transaction: t,
                });
                await contact.create(
                    {
                        ...req.body.responsible,
                        contactableId: foundInitiative.id,
                        contactLinkConnection: 'initiative_responsible',
                    },
                    { transaction: t }
                );
            }

            // Update sections if provided
            if (req.body.sections) {
                await section.destroy({
                    where: {
                        sectionableId: foundInitiative.id,
                        sectionLinkConnection: 'initiative',
                    },
                    transaction: t,
                });
                if (req.body.sections.length > 0) {
                    await Promise.all(
                        req.body.sections.map(async (sectionData) => {
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

            // Update sponsors if provided
            if (req.body.sponsors) {
                await sponsor.destroy({
                    where: {
                        sponsorableId: foundInitiative.id,
                        sponsorLinkConnection: 'initiative',
                    },
                    transaction: t,
                });
                if (req.body.sponsors.length > 0) {
                    await Promise.all(
                        req.body.sponsors.map(async (sponsorData) => {
                            const { id: sponsorId, logo: sponsorLogo, ...sponsorFields } = sponsorData;
                            const createdSponsor = await sponsor.create(
                                {
                                    ...sponsorFields,
                                    sponsorableId: foundInitiative.id,
                                    sponsorLinkConnection: 'initiative',
                                },
                                { transaction: t }
                            );

                            if (sponsorLogo) {
                                const { id: sponsorLogoId, ...logoData } = sponsorLogo;
                                await image.create(
                                    {
                                        ...logoData,
                                        imageableId: createdSponsor.id,
                                        imageLinkConnection: 'sponsor',
                                    },
                                    { transaction: t }
                                );
                            }
                        })
                    );
                }
            }

            // Update partners if provided
            if (req.body.partners) {
                await partner.destroy({
                    where: {
                        partnerableId: foundInitiative.id,
                        partnerLinkConnection: 'initiative',
                    },
                    transaction: t,
                });
                if (req.body.partners.length > 0) {
                    await Promise.all(
                        req.body.partners.map(async (partnerData) => {
                            const { id: partnerId, logo: partnerLogo, ...partnerFields } = partnerData;
                            const createdPartner = await partner.create(
                                {
                                    ...partnerFields,
                                    partnerableId: foundInitiative.id,
                                    partnerLinkConnection: 'initiative',
                                },
                                { transaction: t }
                            );

                            if (partnerLogo) {
                                const { id: partnerLogoId, ...logoData } = partnerLogo;
                                await image.create(
                                    {
                                        ...logoData,
                                        imageableId: createdPartner.id,
                                        imageLinkConnection: 'partner',
                                    },
                                    { transaction: t }
                                );
                            }
                        })
                    );
                }
            }

            // Update download materials if provided
            if (req.body.downloadMaterials) {
                await downloadMaterial.destroy({
                    where: {
                        downloadableId: foundInitiative.id,
                        downloadLinkConnection: 'initiative_materials',
                    },
                    transaction: t,
                });
                if (req.body.downloadMaterials.length > 0) {
                    await Promise.all(
                        req.body.downloadMaterials.map(async (materialData) => {
                            const { image: materialImage, ...materialFields } = materialData;
                            const createdMaterial = await downloadMaterial.create(
                                {
                                    ...materialFields,
                                    downloadableId: foundInitiative.id,
                                    downloadLinkConnection: 'initiative_materials',
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

            // Update documents if provided
            if (req.body.documents) {
                await downloadMaterial.destroy({
                    where: {
                        downloadableId: foundInitiative.id,
                        downloadLinkConnection: 'initiative_documents',
                    },
                    transaction: t,
                });
                if (req.body.documents.length > 0) {
                    await Promise.all(
                        req.body.documents.map(async (documentData) => {
                            const { image: documentImage, ...documentFields } = documentData;
                            const createdDocument = await downloadMaterial.create(
                                {
                                    ...documentFields,
                                    downloadableId: foundInitiative.id,
                                    downloadLinkConnection: 'initiative_documents',
                                },
                                { transaction: t }
                            );

                            if (documentImage) {
                                await image.create(
                                    {
                                        ...documentImage,
                                        imageableId: createdDocument.id,
                                        imageLinkConnection: 'downloadMaterial',
                                    },
                                    { transaction: t }
                                );
                            }
                        })
                    );
                }
            }

            const updatedInitiative = await initiative.findByPk(param, {
                include: initiativeConfig,
                transaction: t,
            });

            return updatedInitiative;
        });

        const transformedResponse = transformInitiative(result);
        return res.status(200).json(transformedResponse);
    } catch (err) {
        next(err);
    }
});

initiativeController.delete('/:id', isAuth, async (req, res, next) => {
    try {
        const param = req.params.id;
        const initiativeId = parseInt(param);

        await initiative.sequelize.transaction(async (t) => {
            let foundInitiative;
            if (isNaN(initiativeId)) {
                foundInitiative = await initiative.findOne({
                    where: { slug: param },
                    include: [
                        {
                            model: user_account,
                            as: 'creator',
                            attributes: ['id', 'email'],
                        },
                    ],
                    transaction: t,
                });
            } else {
                foundInitiative = await initiative.findByPk(initiativeId, {
                    include: [
                        {
                            model: user_account,
                            as: 'creator',
                            attributes: ['id', 'email'],
                        },
                    ],
                    transaction: t,
                });
            }

            if (!foundInitiative) {
                throw new customError({
                    message: 'Initiative not found',
                    statusCode: 404,
                });
            }

            if (Number(foundInitiative.creator.id) !== Number(req.user.userId)) {
                throw new customError({
                    message: 'Unauthorized to delete this initiative',
                    statusCode: 403,
                });
            }

            // Delete all associated data
            await image.destroy({
                where: {
                    imageableId: foundInitiative.id,
                    imageLinkConnection: {
                        [Op.in]: ['initiative_main', 'initiative_logo', 'initiative_gallery'],
                    },
                },
                transaction: t,
            });

            // Delete junction table entries for many-to-many relationships
            await initiative.sequelize.models.initiative_projects.destroy({
                where: { initiative_id: foundInitiative.id },
                transaction: t,
            });

            await initiative.sequelize.models.initiative_stories.destroy({
                where: { initiative_id: foundInitiative.id },
                transaction: t,
            });

            await initiative.sequelize.models.initiative_publications.destroy({
                where: { initiative_id: foundInitiative.id },
                transaction: t,
            });

            await initiative.sequelize.models.initiative_bookmarks.destroy({
                where: { initiative_id: foundInitiative.id },
                transaction: t,
            });

            await initiative.sequelize.models.initiative_relations.destroy({
                where: {
                    [Op.or]: [{ initiative_id: foundInitiative.id }, { related_initiative_id: foundInitiative.id }],
                },
                transaction: t,
            });

            // Delete related records
            await downloadMaterial.destroy({
                where: {
                    downloadableId: foundInitiative.id,
                    downloadLinkConnection: {
                        [Op.in]: ['initiative_materials', 'initiative_documents'],
                    },
                },
                transaction: t,
            });

            await contact.destroy({
                where: {
                    contactableId: foundInitiative.id,
                    contactLinkConnection: {
                        [Op.in]: ['initiative_contact', 'initiative_responsible', 'initiative_additional'],
                    },
                },
                transaction: t,
            });

            await section.destroy({
                where: {
                    sectionableId: foundInitiative.id,
                    sectionLinkConnection: 'initiative',
                },
                transaction: t,
            });

            await comment.destroy({
                where: {
                    commentableId: foundInitiative.id,
                    commentsLinkConnection: 'initiative',
                },
                transaction: t,
            });

            await sponsor.destroy({
                where: {
                    sponsorableId: foundInitiative.id,
                    sponsorLinkConnection: 'initiative',
                },
                transaction: t,
            });

            await partner.destroy({
                where: {
                    partnerableId: foundInitiative.id,
                    partnerLinkConnection: 'initiative',
                },
                transaction: t,
            });

            // Finally, delete the initiative
            await foundInitiative.destroy({ transaction: t });
        });

        return res.status(200).json({
            message: 'Initiative and all associated data deleted successfully',
        });
    } catch (err) {
        next(err);
    }
});

module.exports = initiativeController;
