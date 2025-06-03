const initiativeController = require('express').Router();
const { where } = require('sequelize');
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');
const { initiative, image, project, downloadMaterial, publishedContent, contact, section, user_account, user_details } = require('../sequelize/models');
const customError = require('../utils/customError');
const transformInitiative = require('../utils/initiativeUtils');

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
        attributes: ['id', 'titleSlug', 'title', 'description', 'status', 'image', 'link', 'lat', 'lng'],
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
        const {
            title,
            slug,
            shortDescription,
            category,
            location,
            status,
            campaignStatus,
            commentsEnabled,
            mainImage,
            projects,
            downloadMaterials,
            stories,
            publications,
            contact: incomingContact,
            additionalContacts,
            sections,
        } = req.body;

        // Basic validation
        if (!title || !slug) {
            throw new customError({
                message: 'Title and slug are required',
                statusCode: 400,
            });
        }

        // Check if initiative with same slug exists
        const existingInitiative = await initiative.findOne({ where: { slug } });
        if (existingInitiative) {
            throw new customError({
                message: 'Initiative with this slug already exists',
                statusCode: 409,
            });
        }

        // Create initiative with all associated data using transaction
        const result = await initiative.sequelize.transaction(async (t) => {
            // Create main initiative
            const newInitiative = await initiative.create(
                {
                    title,
                    slug,
                    shortDescription,
                    category,
                    address: location?.address,
                    lat: location?.coordinates?.lat,
                    lng: location?.coordinates?.lng,
                    status: status || 'in-progress',
                    campaignStatus: campaignStatus || 'open',
                    commentsEnabled: commentsEnabled ?? true,
                    creatorId: req.user.userId,
                },
                { transaction: t }
            );

            // Create main image if provided
            if (mainImage) {
                await image.create(
                    {
                        ...mainImage,
                        imageableId: newInitiative.id,
                        imageLinkConnection: 'initiative',
                    },
                    { transaction: t }
                );
            }

            // Create projects
            if (projects && projects.length > 0) {
                await Promise.all(
                    projects.map((projectData) =>
                        project.create(
                            {
                                ...projectData,
                                initiativeId: newInitiative.id,
                            },
                            { transaction: t }
                        )
                    )
                );
            }

            // Create download materials
            if (downloadMaterials && downloadMaterials.length > 0) {
                await Promise.all(
                    downloadMaterials.map(async (materialData) => {
                        const { image: materialImage, ...materialFields } = materialData;
                        const createdMaterial = await downloadMaterial.create(
                            {
                                ...materialFields,
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
            if (stories && stories.length > 0) {
                await Promise.all(
                    stories.map(async (storyData) => {
                        const { image: storyImage, ...storyFields } = storyData;
                        const createdStory = await publishedContent.create(
                            {
                                ...storyFields,
                                type: 'story',
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
            if (publications && publications.length > 0) {
                await Promise.all(
                    publications.map(async (publicationData) => {
                        const { image: publicationImage, ...publicationFields } = publicationData;
                        const createdPublication = await publishedContent.create(
                            {
                                ...publicationFields,
                                type: 'publication',
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
            if (incomingContact) {
                await contact.create(
                    {
                        ...incomingContact,
                        isMainContact: true,
                        initiativeId: newInitiative.id,
                    },
                    { transaction: t }
                );
            }

            // Create additional contacts
            if (additionalContacts && additionalContacts.length > 0) {
                await Promise.all(
                    additionalContacts.map((contactData) =>
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
            if (sections && sections.length > 0) {
                await Promise.all(
                    sections.map(async (sectionData) => {
                        const { sectionImages, ...sectionFields } = sectionData;
                        const createdSection = await section.create(
                            {
                                ...sectionFields,
                                sectionableId: newInitiative.id,
                                sectionLinkConnection: 'initiative',
                            },
                            { transaction: t }
                        );

                        if (sectionImages && sectionImages.length > 0) {
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

            // Fetch the complete initiative with all associations
            const completeInitiative = await initiative.findByPk(newInitiative.id, {
                include: initiativeConfig,
                attributes: initiativeAttributes,
                transaction: t,
            });

            return completeInitiative;
        });

        const transformedInitiative = transformInitiative(result);
        return res.status(201).json(transformedInitiative);
    } catch (err) {
        next(err);
    }
});

module.exports = initiativeController;
