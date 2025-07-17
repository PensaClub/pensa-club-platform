const { initiative, section, image, comment, story, user_account } = require('../sequelize/models');

const storyConfig = [
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
                as: 'sectionImages',
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
        attributes: ['id', 'slug', 'title', 'shortDescription'],
    },
];

const transformStory = async (storyData) => {
    if (!storyData) return null;

    const plainStory = storyData.get({ plain: true });

    // Remove junction table data and isDraft flag
    const { story_bookmarks, story_likes, related_stories, isDraft, ...cleanStoryData } = plainStory;

    // Add userEmail from creator and remove creator object
    if (cleanStoryData.creator) {
        cleanStoryData.userEmail = cleanStoryData.creator.email;
        delete cleanStoryData.creator;
        delete cleanStoryData.creatorId;
    }

    // Transform sections
    if (cleanStoryData.sections) {
        cleanStoryData.sections = cleanStoryData.sections.map((section) => {
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

    // Clean up related stories
    if (cleanStoryData.relatedStories) {
        cleanStoryData.relatedStories = cleanStoryData.relatedStories.map((relatedStory) => {
            const { related_stories, ...cleanRelatedStory } = relatedStory;
            return cleanRelatedStory.id;
        });
    }

    return cleanStoryData;
};

module.exports = {
    storyConfig,
    transformStory,
};
