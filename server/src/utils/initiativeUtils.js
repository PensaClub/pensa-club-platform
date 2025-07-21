const { image, project, downloadMaterial, story, publication, contact, section, sponsor, partner, user_account, initiative } = require('../sequelize/models');
const { Op } = require('sequelize');

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
        as: 'mainImageGallery',
        attributes: ['id', 'src', 'alt', 'caption', 'isUploading'],
    },
    {
        model: project,
        as: 'projects',
        attributes: ['id', 'slug', 'title', 'shortDescription', 'status', 'location', 'logo'],
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
        required: false,
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
        required: false,
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
    {
        model: initiative,
        as: 'relatedInitiatives',
        required: false,
        attributes: ['id'],
        through: { attributes: [] },
    },
];

async function attachRelatedInitiatives(initiativeObj) {
    const id = initiativeObj.id;
    const relations = await initiative.sequelize.models.initiative_relations.findAll({
        where: {
            [Op.or]: [{ initiative_id: id }, { related_initiative_id: id }],
        },
        attributes: ['initiative_id', 'related_initiative_id'],
    });
    const relatedIds = new Set();
    relations.forEach((r) => {
        if (r.initiative_id !== id) relatedIds.add(r.initiative_id);
        if (r.related_initiative_id !== id) relatedIds.add(r.related_initiative_id);
    });
    initiativeObj.relatedInitiatives = Array.from(relatedIds);
    return initiativeObj;
}

async function transformInitiative(initiative) {
    const plainInitiative = initiative.get({ plain: true });

    // Remove junction table data and isDraft flag
    const { initiativeBookmarks, initiative_projects, initiative_stories, initiative_publications, initiative_relations, isDraft, ...initiativeData } =
        plainInitiative;

    // Add userEmail from creator and remove creator object
    if (initiativeData.creator) {
        initiativeData.userEmail = initiativeData.creator.email;
        delete initiativeData.creator;
        delete initiativeData.creatorId;
    }

    if (initiativeData.mainImage && initiativeData.mainImageGallery) {
        initiativeData.mainImage.gallery = initiativeData.mainImageGallery;
        delete initiativeData.mainImageGallery;
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

            let coordinates = { lat: null, lng: null };
            if (cleanProject.location && Array.isArray(cleanProject.location) && cleanProject.location.length > 0) {
                coordinates = cleanProject.location[0].coordinates;
            }

            return {
                titleSlug: cleanProject.slug,
                slug: cleanProject.slug,
                title: cleanProject.title,
                description: cleanProject.shortDescription,
                status: cleanProject.status,
                image: cleanProject.logo,
                link: `/projects/${cleanProject.slug}`,
                coordinates: coordinates,
            };
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

    if (initiativeData.relatedInitiatives) {
        initiativeData.relatedInitiatives = initiativeData.relatedInitiatives.map((relatedInitiative) => {
            const { initiative_relations, ...cleanRelatedInitiative } = relatedInitiative;
            return cleanRelatedInitiative.id;
        });
    }

    await attachRelatedInitiatives(initiativeData);

    return initiativeData;
}

function transformInitiativeListItem(initiative) {
    const plain = initiative.get({ plain: true });

    let mainImage = null;
    if (plain.mainImage) {
        mainImage = {
            src: plain.mainImage.src,
            alt: plain.mainImage.alt,
        };
    }

    return {
        id: plain.id,
        slug: plain.slug,
        title: plain.title,
        shortDescription: plain.shortDescription,
        category: plain.category,
        status: plain.status,
        mainImage,
        location: plain.location,
        applicationStatus: plain.applicationStatus,
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt,
        publishedAt: plain.publishedAt,
        currentParticipants: plain.currentParticipants,
    };
}

module.exports = { transformInitiative, transformInitiativeListItem, initiativeConfig };
