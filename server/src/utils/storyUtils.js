const { initiative, project, section, image, comment, story, user_account } = require('../sequelize/models');

const storyConfig = [
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
        model: story,
        as: 'relatedStories',
        attributes: ['id', 'slug', 'title', 'shortDescription', 'isDraft'],
    },
];

const transformStory = async (storyData) => {
    if (!storyData) return null;

    const plainStory = storyData.get({ plain: true });

    const { story_bookmarks, story_likes, related_stories, project_stories, initiative_stories, likedBy, ...cleanStoryData } = plainStory;

    if (cleanStoryData.creator) {
        cleanStoryData.userEmail = cleanStoryData.creator.email;
        delete cleanStoryData.creator;
        delete cleanStoryData.creatorId;
    }

    const currentStoryIsDraft = cleanStoryData.isDraft;

    if (cleanStoryData.initiatives) {
        cleanStoryData.initiatives = cleanStoryData.initiatives
            .filter((initiative) => {
                if (currentStoryIsDraft) {
                    return true;
                } else {
                    return !initiative.isDraft;
                }
            })
            .map((initiative) => {
                const { initiative_stories, ...cleanInitiative } = initiative;
                return {
                    id: cleanInitiative.id,
                    title: cleanInitiative.title,
                    slug: cleanInitiative.slug,
                };
            });
    }

    if (cleanStoryData.projects) {
        cleanStoryData.projects = cleanStoryData.projects
            .filter((project) => {
                if (currentStoryIsDraft) {
                    return true;
                } else {
                    return !project.isDraft;
                }
            })
            .map((project) => {
                const { project_stories, ...cleanProject } = project;
                return {
                    id: cleanProject.id,
                    title: cleanProject.title,
                    slug: cleanProject.slug,
                };
            });
    }

    if (cleanStoryData.relatedStories) {
        cleanStoryData.relatedStories = cleanStoryData.relatedStories
            .filter((relatedStory) => {
                if (currentStoryIsDraft) {
                    return true;
                } else {
                    return !relatedStory.isDraft;
                }
            })
            .map((relatedStory) => {
                const { related_stories, ...cleanRelatedStory } = relatedStory;
                return {
                    id: cleanRelatedStory.id,
                    title: cleanRelatedStory.title,
                    slug: cleanRelatedStory.slug,
                };
            });
    }

    if (cleanStoryData.sections) {
        cleanStoryData.sections = cleanStoryData.sections.map((section) => {
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

    // Transform main image
    if (cleanStoryData.image) {
        cleanStoryData.mainImage = cleanStoryData.image;
        delete cleanStoryData.image;
    }

    return cleanStoryData;
};

module.exports = {
    storyConfig,
    transformStory,
};
