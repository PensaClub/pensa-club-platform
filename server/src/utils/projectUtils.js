const {
    image,
    initiative,
    story,
    publication,
    section,
    downloadMaterial,
    contact,
    sponsor,
    partner,
    milestone,
    user_account,
    beneficiaries,
} = require('../sequelize/models');

const projectConfig = [
    {
        model: user_account,
        as: 'creator',
        attributes: ['id', 'email'],
    },
    {
        model: initiative,
        as: 'initiatives',
        attributes: ['id', 'slug'],
        through: { attributes: [] },
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
        model: image,
        as: 'mainImage',
        required: false,
        attributes: ['id', 'src', 'alt', 'caption', 'isUploading'],
    },
    {
        model: image,
        as: 'gallery',
        required: false,
        attributes: ['id', 'src', 'alt', 'caption', 'isUploading', 'name', 'size', 'type'],
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
        model: contact,
        as: 'team',
        required: false,
        attributes: ['id', 'name', 'role', 'email', 'phone', 'image'],
        where: {
            is_team_member: true,
        },
    },
    {
        model: contact,
        as: 'contact',
        required: false,
        attributes: ['id', 'name', 'role', 'email', 'phone', 'image'],
        contact: null,
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
        model: milestone,
        as: 'milestones',
        required: false,
        attributes: ['id', 'title', 'dueDate', 'status'],
    },
    {
        model: beneficiaries,
        as: 'beneficiaries',
        required: false,
        attributes: ['id', 'totalCount', 'totalAmountDistributed', 'currency', 'list'],
    },
];

const transformProject = (project) => {
    const plainProject = project.get({ plain: true });

    // Remove junction table data
    const { project_stories, project_publications, initiative_projects, ...projectData } = plainProject;

    if (projectData.creator) {
        projectData.userEmail = projectData.creator.email;
        delete projectData.creator;
        delete projectData.creatorId;
    }

    // Transform initiative data to just id and slug
    if (projectData.initiatives && projectData.initiatives.length > 0) {
        const initiative = projectData.initiatives[0];
        projectData.initiativeId = initiative.id;
        projectData.initiativeSlug = initiative.slug;
        delete projectData.initiatives;
    }

    // Transform sections
    if (projectData.sections) {
        projectData.sections = projectData.sections.map((section) => {
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

    // Clean up stories and publications
    if (projectData.stories) {
        projectData.stories = projectData.stories.map((story) => {
            const { project_stories, ...cleanStory } = story;
            return cleanStory;
        });
    }

    if (projectData.publications) {
        projectData.publications = projectData.publications.map((publication) => {
            const { project_publications, ...cleanPublication } = publication;
            return cleanPublication;
        });
    }

    return projectData;
};

module.exports = { transformProject, projectConfig };
