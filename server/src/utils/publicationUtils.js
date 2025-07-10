const { initiative, section, image, comment, publication, user_account } = require('../sequelize/models');

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
        model: section,
        as: 'sections',
        include: [
            {
                model: image,
                as: 'image',
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
        attributes: ['id', 'slug', 'title', 'shortDescription', 'image'],
    },
];

const transformPublication = async (pub) => {
    if (!pub) return null;

    const plainPublication = pub.get({ plain: true });

    // Remove junction table data and isDraft flag
    const { publication_bookmarks, publication_likes, related_publications, isDraft, ...publicationData } = plainPublication;

    // Add userEmail from creator and remove creator object
    if (publicationData.creator) {
        publicationData.userEmail = publicationData.creator.email;
        delete publicationData.creator;
        delete publicationData.creatorId;
    }

    // Transform sections
    if (publicationData.sections) {
        publicationData.sections = publicationData.sections.map((section) => {
            if (section.image) {
                const { image, ...singleSection } = section;
                return {
                    ...singleSection,
                    images: [image],
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
