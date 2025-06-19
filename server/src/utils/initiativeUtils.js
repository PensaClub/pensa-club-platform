const { image, project, downloadMaterial, story, publication, contact, section, sponsor, partner, user_account } = require('../sequelize/models');

const initiativeConfig = [
    {
        model: user_account,
        as: 'creator',
        attributes: ['id', 'email'],
    },
    {
        model: image,
        as: 'mainImage',
        attributes: ['id', 'src', 'alt', 'caption', 'isUploading'],
    },
    {
        model: image,
        as: 'gallery',
        required: false,
        attributes: ['id', 'src', 'alt', 'caption', 'isUploading'],
    },
    {
        model: project,
        as: 'projects',
        attributes: ['id', 'slug', 'title', 'shortDescription', 'status', 'location'],
        include: [
            {
                model: image,
                as: 'mainImage',
                attributes: ['id', 'src', 'alt', 'caption', 'isUploading'],
                required: false,
            },
        ],
    },
    {
        model: downloadMaterial,
        as: 'downloadMaterials',
        required: false,
        attributes: ['id', 'titleSlug', 'title', 'description', 'fileType', 'fileSize', 'downloadUrl'],
        include: [
            {
                model: image,
                as: 'image',
                attributes: ['id', 'src', 'alt', 'caption', 'isUploading'],
                required: false,
            },
        ],
    },
    {
        model: downloadMaterial,
        as: 'documents',
        required: false,
        attributes: ['id', 'titleSlug', 'title', 'description', 'fileType', 'fileSize', 'downloadUrl'],
    },
    {
        model: story,
        as: 'stories',
        attributes: ['id', 'titleSlug', 'title', 'shortDescription', 'publishedAt', 'author'],
        include: [
            {
                model: image,
                as: 'image',
                attributes: ['id', 'src', 'alt', 'caption', 'isUploading'],
                required: false,
            },
        ],
        through: { attributes: [] },
    },
    {
        model: publication,
        as: 'publications',
        attributes: ['id', 'titleSlug', 'title', 'shortDescription', 'publishedAt'],
        include: [
            {
                model: image,
                as: 'image',
                attributes: ['id', 'src', 'alt', 'caption', 'isUploading'],
                required: false,
            },
        ],
        through: { attributes: [] },
    },
    {
        model: contact,
        as: 'contact',
        required: true,
        attributes: ['id', 'name', 'position', 'email', 'phone', 'image'],
    },
    {
        model: contact,
        as: 'additionalContacts',
        required: false,
        attributes: ['id', 'name', 'email', 'phone'],
    },
    {
        model: contact,
        as: 'responsible',
        required: false,
        attributes: ['id', 'name', 'position', 'email', 'phone'],
    },
    {
        model: section,
        as: 'sections',
        required: true,
        attributes: ['id', 'titleSlug', 'title', 'content'],
        include: [
            {
                model: image,
                as: 'sectionImages',
                attributes: ['id', 'src', 'alt', 'caption', 'isUploading'],
                required: false,
            },
        ],
    },
    {
        model: sponsor,
        as: 'sponsors',
        required: false,
        attributes: ['id', 'name', 'website', 'amount', 'currency', 'type', 'visible', 'logo'],
    },
    {
        model: partner,
        as: 'partners',
        required: false,
        attributes: ['id', 'name', 'website', 'description', 'type', 'visible', 'logo'],
    },
];

const transformInitiative = (initiative) => {
    const plainInitiative = initiative.get({ plain: true });

    // Remove junction table data
    const { initiativeBookmarks, initiative_projects, initiative_stories, initiative_publications, ...initiativeData } = plainInitiative;

    // Add userEmail from creator and remove creator object
    if (initiativeData.creator) {
        initiativeData.userEmail = initiativeData.creator.email;
        delete initiativeData.creator;
        delete initiativeData.creatorId;
    }

    // Transform main image and gallery
    if (initiativeData.mainImage || initiativeData.gallery) {
        initiativeData.mainImage = {
            ...initiativeData.mainImage,
            gallery: initiativeData.gallery || [],
        };
        delete initiativeData.gallery;
    }

    // Transform sections
    if (initiativeData.sections) {
        initiativeData.sections = initiativeData.sections.map((section) => {
            if (section.sectionImages) {
                const { sectionImages, ...singleSection } = section;
                return {
                    ...singleSection,
                    images: sectionImages,
                };
            }
            return section;
        });
    }

    // Clean up projects, stories, and publications
    if (initiativeData.projects) {
        initiativeData.projects = initiativeData.projects.map((project) => {
            const { initiative_projects, ...cleanProject } = project;
            return cleanProject;
        });
    }

    if (initiativeData.stories) {
        initiativeData.stories = initiativeData.stories.map((story) => {
            const { initiative_stories, ...cleanStory } = story;
            return cleanStory;
        });
    }

    if (initiativeData.publications) {
        initiativeData.publications = initiativeData.publications.map((publication) => {
            const { initiative_publications, ...cleanPublication } = publication;
            return cleanPublication;
        });
    }

    return initiativeData;
};

module.exports = { transformInitiative, initiativeConfig };
