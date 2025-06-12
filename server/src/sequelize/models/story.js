'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class story extends Model {
        static associate(models) {
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

            story.belongsToMany(models.story, {
                through: 'related_stories',
                as: 'relatedStories',
                foreignKey: 'story_id',
                otherKey: 'related_story_id',
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
            slug: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            titleSlug: {
                type: DataTypes.STRING,
                allowNull: false,
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
                allowNull: false,
                field: 'published_at',
            },
            author: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            authorEmail: {
                type: DataTypes.STRING,
                allowNull: false,
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
                allowNull: false,
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
        },
        {
            sequelize,
            modelName: 'story',
            timestamps: true,
        }
    );

    return story;
};
