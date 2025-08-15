const { initiative, project, section, image, comment, publication, user_account } = require('../sequelize/models');

const publicationConfig = [
    {
        model: user_account,
        as: 'creator',
        attributes: ['id', 'email'],
    },
    {
        model: initiative,
        as: 'initiatives',
        attributes: ['id', 'title', 'slug'],
    },
    {
        model: project,
        as: 'projects',
        attributes: ['id', 'title', 'slug'],
    },
    {
        model: section,
        as: 'sections',
        include: [
            {
                model: image,
                as: 'sectionImage',
            },
        ],
    },
    {
        model: image,
        as: 'image',
    },
    {
        model: comment,
        as: 'comments',
    },
    {
        model: publication,
        as: 'relatedPublications',
        attributes: ['id', 'slug', 'title', 'shortDescription'],
    },
];

const transformPublication = async (pub) => {
    if (!pub) return null;

    const plainPublication = pub.get({ plain: true });

    // Remove junction table data, isDraft flag, and likedBy for security
    const {
        publication_bookmarks,
        publication_likes,
        related_publications,
        project_publications,
        initiative_publications,
        isDraft,
        likedBy,
        ...publicationData
    } = plainPublication;

    // Add userEmail from creator and remove creator object
    if (publicationData.creator) {
        publicationData.userEmail = publicationData.creator.email;
        delete publicationData.creator;
        delete publicationData.creatorId;
    }

    // Transform sections
    if (publicationData.sections) {
        publicationData.sections = publicationData.sections.map((section) => {
            let sectionImage = null;

            if (section.sectionImage) {
                sectionImage = section.sectionImage;
            } else if (section.sectionImages && Array.isArray(section.sectionImages) && section.sectionImages.length > 0) {
                sectionImage = section.sectionImages[0];
            }

            if (sectionImage) {
                const { sectionImage: _, sectionImages: __, ...singleSection } = section;
                return {
                    ...singleSection,
                    image: sectionImage,
                };
            }
            return section;
        });
    }

    // Clean up related publications
    if (publicationData.relatedPublications) {
        publicationData.relatedPublications = publicationData.relatedPublications.map((relatedPub) => {
            const { related_publications, ...cleanRelatedPub } = relatedPub;
            return cleanRelatedPub.id;
        });
    }

    return publicationData;
};

module.exports = {
    publicationConfig,
    transformPublication,
};
