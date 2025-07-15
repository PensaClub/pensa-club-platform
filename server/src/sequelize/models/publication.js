'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class publication extends Model {
        static associate(models) {
            publication.belongsTo(models.user_account, {
                foreignKey: 'creatorId',
                as: 'creator',
            });

            publication.belongsToMany(models.initiative, {
                through: 'initiative_publications',
                as: 'initiatives',
                foreignKey: 'publication_id',
                otherKey: 'initiative_id',
            });

            publication.belongsToMany(models.project, {
                through: 'project_publications',
                as: 'projects',
                foreignKey: 'publication_id',
                otherKey: 'project_id',
            });

            publication.belongsToMany(models.publication, {
                through: 'related_publications',
                as: 'relatedPublications',
                foreignKey: 'publication_id',
                otherKey: 'related_publication_id',
            });

            publication.belongsToMany(models.user_account, {
                through: 'publication_bookmarks',
                as: 'bookmarkedBy',
                foreignKey: 'publication_id',
                otherKey: 'user_id',
            });

            publication.belongsToMany(models.user_account, {
                through: 'publication_likes',
                as: 'likedBy',
                foreignKey: 'publication_id',
                otherKey: 'user_id',
            });

            publication.hasMany(models.section, {
                foreignKey: 'sectionableId',
                constraints: false,
                scope: {
                    section_link_connection: 'publication',
                },
                as: 'sections',
            });

            publication.hasOne(models.image, {
                foreignKey: 'imageableId',
                constraints: false,
                scope: {
                    image_link_connection: 'publication',
                },
                as: 'image',
            });

            publication.hasMany(models.comment, {
                foreignKey: 'commentableId',
                constraints: false,
                scope: {
                    comment_link_connection: 'publication',
                },
                as: 'comments',
            });
        }
    }
    publication.init(
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
            readTime: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'read_time',
            },
            category: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            fileType: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'file_type',
            },
            fileSize: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'file_size',
            },
            downloadUrl: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'download_url',
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
            downloads: {
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
        },
        {
            sequelize,
            modelName: 'publication',
            timestamps: true,
            underscored: true,
        }
    );
    return publication;
};
