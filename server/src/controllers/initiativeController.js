const initiativeController = require('express').Router();
const { where } = require('sequelize');
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');
const { initiative, image, project, downloadMaterial, publishedContent, contact, section, user_account, user_details } = require('../sequelize/models');
const customError = require('../utils/customError');
const transformInitiative = require('../utils/initiativeUtils');
const { InitiativeSchema } = require('../schemas/initiatives.schema');
const z = require('zod');

const initiativeConfig = [
    {
        model: user_account,
        as: 'creator',
        required: true,
        attributes: ['id', 'email'],
        include: [
            {
                model: user_details,
                as: 'details',
                attributes: ['username', 'firstName', 'lastName', 'imageURL'],
            },
        ],
    },
    {
        model: image,
        as: 'mainImage',
        where: { imageLinkConnection: 'initiative' },
        required: false,
        attributes: ['alt', 'src', 'id'],
    },
    {
        model: project,
        as: 'projects',
        required: true,
        attributes: ['id', 'titleSlug', 'slug', 'title', 'description', 'status', 'image', 'link', 'lat', 'lng'],
    },
    {
        model: downloadMaterial,
        as: 'downloadMaterials',
        required: true,
        attributes: ['id', 'titleSlug', 'title', 'description', 'fileType', 'fileSize', 'downloadUrl'],
        include: [
            {
                model: image,
                as: 'image',
                attributes: ['id', 'src', 'alt'],
                where: { imageLinkConnection: 'downloadMaterial' },
                required: false,
            },
        ],
    },
    {
        model: publishedContent,
        as: 'stories',
        where: { type: 'story' },
        required: true,
        attributes: ['id', 'titleSlug', 'title', 'description', 'link', 'publishedAt', 'author'],
        include: [
            {
                model: image,
                as: 'image',
                attributes: ['id', 'src', 'alt'],
                where: { imageLinkConnection: 'publishedContent' },
                required: false,
            },
        ],
    },
    {
        model: publishedContent,
        as: 'publications',
        where: { type: 'publication' },
        required: true,
        attributes: ['id', 'titleSlug', 'title', 'description', 'link', 'publishedAt'],
        include: [
            {
                model: image,
                as: 'image',
                attributes: ['id', 'src', 'alt'],
                where: { imageLinkConnection: 'publishedContent' },
                required: false,
            },
        ],
    },
    {
        model: contact,
        as: 'contact',
        where: { isMainContact: true },
        required: true,
        attributes: ['id', 'name', 'position', 'email', 'phone', 'image'],
    },
    {
        model: contact,
        as: 'additionalContacts',
        where: { isMainContact: false },
        required: false,
        attributes: ['id', 'name', 'email', 'phone'],
    },
    {
        model: section,
        as: 'sections',
        where: { sectionLinkConnection: 'initiative' },
        required: true,
        attributes: ['id', 'titleSlug', 'title', 'content'],
        include: [
            {
                model: image,
                as: 'sectionImages',
                attributes: ['id', 'src', 'alt'],
                where: { imageLinkConnection: 'section' },
                required: false,
            },
        ],
    },
];

const initiativeAttributes = ['id', 'slug', 'title', 'shortDescription', 'category', 'address', 'lat', 'lng', 'status', 'campaignStatus', 'commentsEnabled'];

initiativeController.get('/single/:id', async (req, res, next) => {
    try {
        const initiativeId = parseInt(req.params.id);

        if (isNaN(initiativeId)) {
            throw new customError({
                message: 'Invalid initiative ID',
                statusCode: 400,
            });
        }

        const foundInitiative = await initiative.findByPk(initiativeId, {
            include: initiativeConfig,
            attributes: initiativeAttributes,
        });

        if (!foundInitiative) {
            throw new customError({
                message: 'Initiative not found',
                statusCode: 404,
            });
        }

        const transformedInitiative = transformInitiative(foundInitiative);
        return res.status(200).json(transformedInitiative);
    } catch (err) {
        next(err);
    }
});

initiativeController.get('/user-initiatives/:email', async (req, res, next) => {
    try {
        const { email } = req.params;

        const initiatives = await initiative.findAll({
            include: initiativeConfig,
            attributes: initiativeAttributes,
            where: {
                '$creator.email$': email,
            },
            order: [['id', 'ASC']],
        });

        const transformedInitiatives = initiatives.map(transformInitiative);
        return res.status(200).json(transformedInitiatives);
    } catch (err) {
        next(err);
    }
});

initiativeController.get('/all', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const offset = (page - 1) * limit;

        const initiatives = await initiative.findAll({
            include: initiativeConfig,
            attributes: initiativeAttributes,
            limit,
            offset,
            order: [['id', 'ASC']],
        });

        const transformedInitiatives = initiatives.map(transformInitiative);
        return res.status(200).json(transformedInitiatives);
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
                                lat: projectData.coordinates?.lat,
                                lng: projectData.coordinates?.lng,
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
                        const createdStory = await publishedContent.create(
                            {
                                titleSlug: storyData.title,
                                title: storyData.title,
                                description: storyData.description,
                                link: storyData.link,
                                author: storyData.author,
                                type: 'story',
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
                                    imageLinkConnection: 'publishedContent',
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
                        const createdPublication = await publishedContent.create(
                            {
                                titleSlug: publicationData.title,
                                title: publicationData.title,
                                description: publicationData.description,
                                link: publicationData.link,
                                type: 'publication',
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
                                    imageLinkConnection: 'publishedContent',
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

            const completeInitiative = await initiative.findByPk(newInitiative.id, {
                include: initiativeConfig,
                attributes: initiativeAttributes,
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

module.exports = initiativeController;
