const initiativeController = require('express').Router();
const { where, Op } = require('sequelize');
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');
const { initiative, image, downloadMaterial, contact, section, user_account, comment, sponsor, partner } = require('../sequelize/models');
const CustomError = require('../utils/customError');
const { transformInitiative, initiativeConfig } = require('../utils/initiativeUtils');
const { transformComment, getCommentConfig } = require('../utils/commentUtils');
const { InitiativeSchema, UpdateInitiativeSchema, PaginationQuerySchema } = require('../schemas/initiatives.schema');

// ========================================
// ENDPOINTS
// ========================================

initiativeController.post('/create', isAuth, async (req, res, next) => {
    try {
        const validatedData = InitiativeSchema.parse(req.body);
        const initiativeData = { ...validatedData, isDraft: false };
        return createInitiative(initiativeData, req, res, next);
    } catch (err) {
        next(err);
    }
});

initiativeController.post('/draft/save/:id?', isAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            const validatedData = InitiativeSchema.parse(req.body);
            const initiativeData = { ...validatedData, isDraft: true };
            return createInitiative(initiativeData, req, res, next);
        }

        const validatedData = UpdateInitiativeSchema.parse(req.body);
        return updateInitiative(validatedData, req, res, next, true);
    } catch (err) {
        next(err);
    }
});

initiativeController.get('/draft/:id', async (req, res, next) => {
    return getSingleInitiativeByDraftStatus(true, req, res, next);
});

initiativeController.get('/single/:id', async (req, res, next) => {
    return getSingleInitiativeByDraftStatus(false, req, res, next);
});

initiativeController.get('/drafts', async (req, res, next) => {
    return getInitiativesByDraftStatus(true, req, res, next);
});

initiativeController.get('/all', async (req, res, next) => {
    return getInitiativesByDraftStatus(false, req, res, next);
});

initiativeController.delete('/draft/:id', isAuth, async (req, res, next) => {
    return deleteInitiativeByDraftStatus(true, req, res, next);
});

initiativeController.delete('/:id', isAuth, async (req, res, next) => {
    return deleteInitiativeByDraftStatus(false, req, res, next);
});

initiativeController.put('/:id', isAuth, async (req, res, next) => {
    try {
        const validatedData = UpdateInitiativeSchema.parse(req.body);
        return updateInitiative(validatedData, req, res, next, false);
    } catch (err) {
        next(err);
    }
});

initiativeController.post('/bookmark/:id', isAuth, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const param = req.params.id;
        const initiativeId = parseInt(param);

        let existing;

        existing = await initiative.findOne({
            where: {
                slug: param,
                isDraft: false,
            },
            include: [
                {
                    model: user_account,
                    as: 'bookmarkedBy',
                    where: { id: userId },
                    required: false,
                },
            ],
        });

        if (!existing && !isNaN(initiativeId)) {
            existing = await initiative.findOne({
                where: {
                    id: initiativeId,
                    isDraft: false,
                },
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
            return res.status(404).json({ error: 'Published initiative not found' });
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

initiativeController.get('/user-initiatives/:email', async (req, res, next) => {
    try {
        const { email } = req.params;

        const user = await user_account.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const initiatives = await user.getBookmarkedInitiatives({
            where: { isDraft: false },
            include: initiativeConfig,
            order: [['id', 'ASC']],
            through: { attributes: [] },
        });

        if (initiatives.length === 0) {
            return res.status(200).json({
                message: 'No bookmarked initiatives found.',
                data: [],
            });
        }

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

initiativeController.patch('/toggle-draft/:id', isAuth, async (req, res, next) => {
    try {
        const param = req.params.id;
        const initiativeId = parseInt(param);

        const result = await initiative.sequelize.transaction(async (t) => {
            let foundInitiative;

            foundInitiative = await initiative.findOne({
                where: { slug: param },
                transaction: t,
            });

            if (!foundInitiative && !isNaN(initiativeId)) {
                foundInitiative = await initiative.findByPk(initiativeId, {
                    transaction: t,
                });
            }

            if (!foundInitiative) {
                throw new CustomError({
                    message: 'Initiative not found',
                    statusCode: 404,
                });
            }

            await foundInitiative.update({ isDraft: !foundInitiative.isDraft }, { transaction: t });

            const updatedInitiative = await initiative.findByPk(foundInitiative.id, {
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

// ========================================
// FUNCTIONS
// ========================================

const getSingleInitiativeByDraftStatus = async (isDraft, req, res, next) => {
    try {
        const param = req.params.id;
        const initiativeId = parseInt(param);

        let foundInitiative;

        foundInitiative = await initiative.findOne({
            where: {
                slug: param,
                isDraft: isDraft,
            },
            include: initiativeConfig,
        });

        if (!foundInitiative && !isNaN(initiativeId)) {
            foundInitiative = await initiative.findOne({
                where: {
                    id: initiativeId,
                    isDraft: isDraft,
                },
                include: initiativeConfig,
            });
        }

        if (!foundInitiative) {
            throw new CustomError({
                message: `Initiative not found${isDraft ? ' or not a draft' : ''}`,
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
};

const deleteInitiativeByDraftStatus = async (isDraft, req, res, next) => {
    try {
        const param = req.params.id;
        const initiativeId = parseInt(param);

        await initiative.sequelize.transaction(async (t) => {
            let foundInitiative;

            foundInitiative = await initiative.findOne({
                where: {
                    slug: param,
                    isDraft: isDraft,
                },
                include: [
                    {
                        model: user_account,
                        as: 'creator',
                        attributes: ['id', 'email'],
                    },
                ],
                transaction: t,
            });

            if (!foundInitiative && !isNaN(initiativeId)) {
                foundInitiative = await initiative.findByPk(initiativeId, {
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
            }

            if (!foundInitiative) {
                throw new CustomError({
                    message: `Initiative not found${isDraft ? ' or not a draft' : ''}`,
                    statusCode: 404,
                });
            }

            if (Number(foundInitiative.creator.id) !== Number(req.user.userId)) {
                throw new CustomError({
                    message: 'Unauthorized to delete this initiative',
                    statusCode: 403,
                });
            }

            await image.destroy({
                where: {
                    imageableId: foundInitiative.id,
                    imageLinkConnection: {
                        [Op.in]: ['initiative_main', 'initiative_main_gallery'],
                    },
                },
                transaction: t,
            });

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

            await foundInitiative.destroy({ transaction: t });
        });

        return res.status(200).json({
            message: `${isDraft ? 'Draft ' : ''}Initiative deleted successfully`,
        });
    } catch (err) {
        next(err);
    }
};

const getInitiativesByDraftStatus = async (isDraft, req, res, next) => {
    try {
        const { page, limit } = PaginationQuerySchema.parse(req.query);

        const totalCount = await initiative.count({
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
                    totalInitiatives: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            });
        }

        const actualPage = Math.min(page, totalPages);
        const offset = (actualPage - 1) * limit;

        const initiatives = await initiative.findAll({
            where: {
                isDraft: isDraft,
            },
            include: initiativeConfig,
            limit: limit,
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
                limit: limit,
                totalInitiatives: totalCount,
                totalPages,
                hasNextPage: actualPage < totalPages,
                hasPrevPage: actualPage > 1,
            },
        });
    } catch (err) {
        next(err);
    }
};

const createInitiative = async (initiativeData, req, res, next) => {
    try {
        const result = await initiative.sequelize.transaction(async (t) => {
            const newInitiative = await initiative.create(
                {
                    creatorId: req.user.userId,
                    ...initiativeData,
                },
                { transaction: t }
            );

            if (initiativeData.mainImage) {
                const { gallery: mainImageGallery, ...mainImageData } = initiativeData.mainImage;

                await image.create(
                    {
                        ...mainImageData,
                        imageableId: newInitiative.id,
                        imageLinkConnection: 'initiative_main',
                    },
                    { transaction: t }
                );

                if (mainImageGallery?.length > 0) {
                    await Promise.all(
                        mainImageGallery.map((imageData) =>
                            image.create(
                                {
                                    ...imageData,
                                    imageableId: newInitiative.id,
                                    imageLinkConnection: 'initiative_main_gallery',
                                },
                                { transaction: t }
                            )
                        )
                    );
                }
            }

            if (initiativeData.contact) {
                await contact.create(
                    {
                        ...initiativeData.contact,
                        contactableId: newInitiative.id,
                        contactLinkConnection: 'initiative_contact',
                        isMainContact: true,
                    },
                    { transaction: t }
                );
            }

            if (initiativeData.additionalContacts?.length > 0) {
                await Promise.all(
                    initiativeData.additionalContacts.map((contactData) =>
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

            if (initiativeData.responsible) {
                await contact.create(
                    {
                        ...initiativeData.responsible,
                        contactableId: newInitiative.id,
                        contactLinkConnection: 'initiative_responsible',
                    },
                    { transaction: t }
                );
            }

            if (initiativeData.sections?.length > 0) {
                await Promise.all(
                    initiativeData.sections.map(async (sectionData) => {
                        const { id: sectionId, images: sectionImages, ...sectionFields } = sectionData;
                        const createdSection = await section.create(
                            {
                                ...sectionFields,
                                sectionableId: newInitiative.id,
                                sectionLinkConnection: 'initiative',
                            },
                            { transaction: t }
                        );

                        if (sectionImages && Array.isArray(sectionImages)) {
                            await Promise.all(
                                sectionImages.map((imageData) => {
                                    const { id: imageId, ...imageFields } = imageData;
                                    return image.create(
                                        {
                                            ...imageFields,
                                            imageableId: createdSection.id,
                                            imageLinkConnection: 'section',
                                        },
                                        { transaction: t }
                                    );
                                })
                            );
                        }
                    })
                );
            }

            if (initiativeData.sponsors?.length > 0) {
                await Promise.all(
                    initiativeData.sponsors.map(async (sponsorData) => {
                        const { id: sponsorId, ...sponsorFields } = sponsorData;
                        await sponsor.create(
                            {
                                ...sponsorFields,
                                sponsorableId: newInitiative.id,
                                sponsorLinkConnection: 'initiative',
                            },
                            { transaction: t }
                        );
                    })
                );
            }

            if (initiativeData.partners?.length > 0) {
                await Promise.all(
                    initiativeData.partners.map(async (partnerData) => {
                        const { id: partnerId, ...partnerFields } = partnerData;
                        await partner.create(
                            {
                                ...partnerFields,
                                partnerableId: newInitiative.id,
                                partnerLinkConnection: 'initiative',
                            },
                            { transaction: t }
                        );
                    })
                );
            }

            if (initiativeData.downloadMaterials?.length > 0) {
                await Promise.all(
                    initiativeData.downloadMaterials.map(async (materialData) => {
                        const { id: materialId, image: materialImage, ...materialFields } = materialData;
                        const createdMaterial = await downloadMaterial.create(
                            {
                                ...materialFields,
                                downloadableId: newInitiative.id,
                                downloadLinkConnection: 'initiative_materials',
                            },
                            { transaction: t }
                        );

                        if (materialImage) {
                            const { id: imageId, ...imageFields } = materialImage;
                            await image.create(
                                {
                                    ...imageFields,
                                    imageableId: createdMaterial.id,
                                    imageLinkConnection: 'downloadMaterial',
                                },
                                { transaction: t }
                            );
                        }
                    })
                );
            }

            if (initiativeData.documents?.length > 0) {
                await Promise.all(
                    initiativeData.documents.map(async (documentData) => {
                        const { id: documentId, image: documentImage, ...documentFields } = documentData;
                        const createdDocument = await downloadMaterial.create(
                            {
                                ...documentFields,
                                downloadableId: newInitiative.id,
                                downloadLinkConnection: 'initiative_documents',
                            },
                            { transaction: t }
                        );

                        if (documentImage) {
                            const { id: imageId, ...imageFields } = documentImage;
                            await image.create(
                                {
                                    ...imageFields,
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
};

const updateInitiative = async (initiativeData, req, res, next, isDraft = false) => {
    try {
        const param = req.params.id;
        const initiativeId = parseInt(param);

        const result = await initiative.sequelize.transaction(async (t) => {
            let foundInitiative;

            foundInitiative = await initiative.findOne({
                where: {
                    slug: param,
                    isDraft: isDraft,
                },
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

            if (!foundInitiative && !isNaN(initiativeId)) {
                foundInitiative = await initiative.findByPk(initiativeId, {
                    where: { isDraft: isDraft },
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
                throw new CustomError({
                    message: `Initiative not found${isDraft ? ' or not a draft' : ''}`,
                    statusCode: 404,
                });
            }

            if (Number(foundInitiative.creator.id) !== Number(req.user.userId)) {
                throw new CustomError({
                    message: `Unauthorized to update this ${isDraft ? 'draft ' : ''}initiative`,
                    statusCode: 403,
                });
            }

            await foundInitiative.update({ ...initiativeData, isDraft: isDraft }, { transaction: t });

            if (initiativeData.mainImage) {
                const { gallery: mainImageGallery, ...mainImageData } = initiativeData.mainImage;

                await image.destroy({
                    where: {
                        imageableId: foundInitiative.id,
                        imageLinkConnection: ['initiative_main', 'initiative_main_gallery'],
                    },
                    transaction: t,
                });

                await image.create(
                    {
                        ...mainImageData,
                        imageableId: foundInitiative.id,
                        imageLinkConnection: 'initiative_main',
                    },
                    { transaction: t }
                );

                if (mainImageGallery?.length > 0) {
                    await Promise.all(
                        mainImageGallery.map((imageData) =>
                            image.create(
                                {
                                    ...imageData,
                                    imageableId: foundInitiative.id,
                                    imageLinkConnection: 'initiative_main_gallery',
                                },
                                { transaction: t }
                            )
                        )
                    );
                }
            }

            if (initiativeData.contact) {
                await contact.destroy({
                    where: {
                        contactableId: foundInitiative.id,
                        contactLinkConnection: 'initiative_contact',
                    },
                    transaction: t,
                });
                await contact.create(
                    {
                        ...initiativeData.contact,
                        contactableId: foundInitiative.id,
                        contactLinkConnection: 'initiative_contact',
                        isMainContact: true,
                    },
                    { transaction: t }
                );
            }

            if (initiativeData.additionalContacts) {
                await contact.destroy({
                    where: {
                        contactableId: foundInitiative.id,
                        contactLinkConnection: 'initiative_additional',
                    },
                    transaction: t,
                });
                if (initiativeData.additionalContacts.length > 0) {
                    await Promise.all(
                        initiativeData.additionalContacts.map((contactData) =>
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

            if (initiativeData.responsible) {
                await contact.destroy({
                    where: {
                        contactableId: foundInitiative.id,
                        contactLinkConnection: 'initiative_responsible',
                    },
                    transaction: t,
                });
                await contact.create(
                    {
                        ...initiativeData.responsible,
                        contactableId: foundInitiative.id,
                        contactLinkConnection: 'initiative_responsible',
                    },
                    { transaction: t }
                );
            }

            if (initiativeData.sections) {
                await section.destroy({
                    where: {
                        sectionableId: foundInitiative.id,
                        sectionLinkConnection: 'initiative',
                    },
                    transaction: t,
                });
                if (initiativeData.sections.length > 0) {
                    await Promise.all(
                        initiativeData.sections.map(async (sectionData) => {
                            const { id: sectionId, images: sectionImages, ...sectionFields } = sectionData;
                            const createdSection = await section.create(
                                {
                                    ...sectionFields,
                                    sectionableId: foundInitiative.id,
                                    sectionLinkConnection: 'initiative',
                                },
                                { transaction: t }
                            );

                            if (sectionImages && Array.isArray(sectionImages)) {
                                await Promise.all(
                                    sectionImages.map((imageData) => {
                                        const { id: imageId, ...imageFields } = imageData;
                                        return image.create(
                                            {
                                                ...imageFields,
                                                imageableId: createdSection.id,
                                                imageLinkConnection: 'section',
                                            },
                                            { transaction: t }
                                        );
                                    })
                                );
                            }
                        })
                    );
                }
            }

            if (initiativeData.sponsors) {
                await sponsor.destroy({
                    where: {
                        sponsorableId: foundInitiative.id,
                        sponsorLinkConnection: 'initiative',
                    },
                    transaction: t,
                });
                if (initiativeData.sponsors.length > 0) {
                    await Promise.all(
                        initiativeData.sponsors.map(async (sponsorData) => {
                            const { id: sponsorId, ...sponsorFields } = sponsorData;
                            await sponsor.create(
                                {
                                    ...sponsorFields,
                                    sponsorableId: foundInitiative.id,
                                    sponsorLinkConnection: 'initiative',
                                },
                                { transaction: t }
                            );
                        })
                    );
                }
            }

            if (initiativeData.partners) {
                await partner.destroy({
                    where: {
                        partnerableId: foundInitiative.id,
                        partnerLinkConnection: 'initiative',
                    },
                    transaction: t,
                });
                if (initiativeData.partners.length > 0) {
                    await Promise.all(
                        initiativeData.partners.map(async (partnerData) => {
                            const { id: partnerId, ...partnerFields } = partnerData;
                            await partner.create(
                                {
                                    ...partnerFields,
                                    partnerableId: foundInitiative.id,
                                    partnerLinkConnection: 'initiative',
                                },
                                { transaction: t }
                            );
                        })
                    );
                }
            }

            if (initiativeData.downloadMaterials) {
                await downloadMaterial.destroy({
                    where: {
                        downloadableId: foundInitiative.id,
                        downloadLinkConnection: 'initiative_materials',
                    },
                    transaction: t,
                });
                if (initiativeData.downloadMaterials.length > 0) {
                    await Promise.all(
                        initiativeData.downloadMaterials.map(async (materialData) => {
                            const { id: materialId, image: materialImage, ...materialFields } = materialData;
                            const createdMaterial = await downloadMaterial.create(
                                {
                                    ...materialFields,
                                    downloadableId: foundInitiative.id,
                                    downloadLinkConnection: 'initiative_materials',
                                },
                                { transaction: t }
                            );

                            if (materialImage) {
                                const { id: imageId, ...imageFields } = materialImage;
                                await image.create(
                                    {
                                        ...imageFields,
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

            if (initiativeData.documents) {
                await downloadMaterial.destroy({
                    where: {
                        downloadableId: foundInitiative.id,
                        downloadLinkConnection: 'initiative_documents',
                    },
                    transaction: t,
                });
                if (initiativeData.documents.length > 0) {
                    await Promise.all(
                        initiativeData.documents.map(async (documentData) => {
                            const { id: documentId, image: documentImage, ...documentFields } = documentData;
                            const createdDocument = await downloadMaterial.create(
                                {
                                    ...documentFields,
                                    downloadableId: foundInitiative.id,
                                    downloadLinkConnection: 'initiative_documents',
                                },
                                { transaction: t }
                            );

                            if (documentImage) {
                                const { id: imageId, ...imageFields } = documentImage;
                                await image.create(
                                    {
                                        ...imageFields,
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

            const updatedInitiative = await initiative.findByPk(foundInitiative.id, {
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
};

module.exports = initiativeController;
