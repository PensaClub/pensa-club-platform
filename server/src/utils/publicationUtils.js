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
        attributes: ['id', 'title', 'slug', 'isDraft'],
    },
    {
        model: project,
        as: 'projects',
        attributes: ['id', 'title', 'slug', 'isDraft'],
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
        attributes: ['id', 'slug', 'title', 'shortDescription', 'isDraft'],
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

    // Filter connections based on current publication's draft status
    const currentPublicationIsDraft = plainPublication.isDraft;

    // Filter initiatives: if current publication is published, only show published initiatives
    if (publicationData.initiatives) {
        publicationData.initiatives = publicationData.initiatives.filter((initiative) => {
            if (currentPublicationIsDraft) {
                // If current publication is draft, show all initiatives (draft and published)
                return true;
            } else {
                // If current publication is published, only show published initiatives
                return !initiative.isDraft;
            }
        });
    }

    // Filter projects: if current publication is published, only show published projects
    if (publicationData.projects) {
        publicationData.projects = publicationData.projects.filter((project) => {
            if (currentPublicationIsDraft) {
                // If current publication is draft, show all projects (draft and published)
                return true;
            } else {
                // If current publication is published, only show published projects
                return !project.isDraft;
            }
        });
    }

    // Filter related publications: if current publication is published, only show published related publications
    if (publicationData.relatedPublications) {
        publicationData.relatedPublications = publicationData.relatedPublications
            .filter((relatedPub) => {
                if (currentPublicationIsDraft) {
                    // If current publication is draft, show all related publications (draft and published)
                    return true;
                } else {
                    // If current publication is published, only show published related publications
                    return !relatedPub.isDraft;
                }
            })
            .map((relatedPub) => {
                const { related_publications, ...cleanRelatedPub } = relatedPub;
                return cleanRelatedPub.id;
            });
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

    return publicationData;
};

module.exports = {
    publicationConfig,
    transformPublication,
};
