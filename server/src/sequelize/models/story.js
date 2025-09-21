'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class story extends Model {
        static associate(models) {
            story.belongsTo(models.user_account, {
                foreignKey: 'creatorId',
                as: 'creator',
            });

            story.belongsToMany(models.initiative, {
                through: 'initiative_stories',
                as: 'initiatives',
                foreignKey: 'story_id',
                otherKey: 'initiative_id',
            });

            story.belongsToMany(models.project, {
                through: 'project_stories',
                as: 'projects',
                foreignKey: 'story_id',
                otherKey: 'project_id',
            });

            story.belongsToMany(models.story, {
                through: 'related_stories',
                as: 'relatedStories',
                foreignKey: 'story_id',
                otherKey: 'related_story_id',
            });

            story.belongsToMany(models.user_account, {
                through: 'story_bookmarks',
                as: 'bookmarkedBy',
                foreignKey: 'story_id',
                otherKey: 'user_id',
            });

            story.belongsToMany(models.user_account, {
                through: 'story_likes',
                as: 'likedBy',
                foreignKey: 'story_id',
                otherKey: 'user_id',
            });

            story.hasMany(models.section, {
                foreignKey: 'sectionableId',
                constraints: false,
                scope: {
                    section_link_connection: 'story',
                },
                as: 'sections',
            });

            story.hasOne(models.image, {
                foreignKey: 'imageableId',
                constraints: false,
                scope: {
                    image_link_connection: 'story',
                },
                as: 'image',
            });

            story.hasMany(models.comment, {
                foreignKey: 'commentableId',
                constraints: false,
                scope: {
                    comment_link_connection: 'story',
                },
                as: 'comments',
            });
        }
    }

    story.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            creatorId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'user_accounts',
                    key: 'id',
                },
                field: 'creator_id',
                onDelete: 'CASCADE',
            },
            slug: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            titleSlug: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'title_slug',
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            shortDescription: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'short_description',
            },
            publishedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'published_at',
            },
            author: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            authorEmail: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'author_email',
            },
            authorImage: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'author_image',
            },
            readTime: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'read_time',
            },
            category: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            tags: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                allowNull: true,
                defaultValue: [],
            },
            views: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            likes: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            commentsEnabled: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'comments_enabled',
            },
            isDraft: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_draft',
            },
            showAuthor: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'show_author',
            },
        },
        {
            sequelize,
            modelName: 'story',
            timestamps: true,
            underscored: true,
        }
    );

    return story;
};
