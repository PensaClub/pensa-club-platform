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

    const { publication_bookmarks, publication_likes, related_publications, project_publications, initiative_publications, likedBy, ...publicationData } =
        plainPublication;

    if (publicationData.creator) {
        publicationData.userEmail = publicationData.creator.email;
        delete publicationData.creator;
        delete publicationData.creatorId;
    }

    const currentPublicationIsDraft = publicationData.isDraft;

    if (publicationData.initiatives) {
        publicationData.initiatives = publicationData.initiatives.filter((initiative) => {
            if (currentPublicationIsDraft) {
                return true;
            } else {
                return !initiative.isDraft;
            }
        });
    }

    if (publicationData.projects) {
        publicationData.projects = publicationData.projects.filter((project) => {
            if (currentPublicationIsDraft) {
                return true;
            } else {
                return !project.isDraft;
            }
        });
    }

    if (publicationData.relatedPublications) {
        publicationData.relatedPublications = publicationData.relatedPublications
            .filter((relatedPub) => {
                if (currentPublicationIsDraft) {
                    return true;
                } else {
                    return !relatedPub.isDraft;
                }
            })
            .map((relatedPub) => {
                const { related_publications, ...cleanRelatedPub } = relatedPub;
                return cleanRelatedPub.id;
            });
    }

    if (publicationData.sections) {
        publicationData.sections = publicationData.sections.map((section) => {
            if (section.sectionImage) {
                const { sectionImage, ...singleSection } = section;
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
