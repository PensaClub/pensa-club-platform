'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class initiative extends Model {
        static associate(models) {
            initiative.belongsTo(models.user_account, {
                foreignKey: 'creatorId',
                as: 'creator',
            });

            initiative.belongsToMany(models.project, {
                through: 'initiative_projects',
                as: 'projects',
                foreignKey: 'initiative_id',
                otherKey: 'project_id',
            });

            initiative.belongsToMany(models.story, {
                through: 'initiative_stories',
                as: 'stories',
                foreignKey: 'initiative_id',
                otherKey: 'story_id',
            });

            initiative.belongsToMany(models.publication, {
                through: 'initiative_publications',
                as: 'publications',
                foreignKey: 'initiative_id',
                otherKey: 'publication_id',
            });

            initiative.hasMany(models.downloadMaterial, {
                foreignKey: 'downloadableId',
                constraints: false,
                scope: {
                    download_link_connection: 'initiative',
                },
                as: 'downloadMaterials',
            });

            initiative.hasMany(models.contact, {
                foreignKey: 'contactableId',
                constraints: false,
                scope: {
                    contact_link_connection: 'initiative',
                },
                as: 'additionalContacts',
            });

            initiative.hasOne(models.contact, {
                foreignKey: 'contactableId',
                constraints: false,
                scope: {
                    contact_link_connection: 'initiative',
                    is_main_contact: true,
                },
                as: 'contact',
            });

            initiative.hasOne(models.image, {
                as: 'mainImage',
                foreignKey: 'imageableId',
                constraints: false,
                scope: {
                    image_link_connection: 'initiative_main',
                },
            });

            initiative.hasOne(models.image, {
                as: 'logo',
                foreignKey: 'imageableId',
                constraints: false,
                scope: {
                    image_link_connection: 'initiative_logo',
                },
            });

            initiative.hasMany(models.section, {
                as: 'sections',
                foreignKey: 'sectionableId',
                constraints: false,
                scope: {
                    section_link_connection: 'initiative',
                },
            });

            initiative.hasMany(models.comment, {
                foreignKey: 'commentableId',
                as: 'comments',
                constraints: false,
                scope: {
                    comment_link_connection: 'initiative',
                },
            });

            initiative.belongsToMany(models.user_account, {
                through: 'initiative_bookmarks',
                as: 'bookmarkedBy',
                foreignKey: 'initiative_id',
                otherKey: 'user_id',
            });

            initiative.hasMany(models.sponsor, {
                foreignKey: 'sponsorableId',
                constraints: false,
                scope: { sponsor_link_connection: 'initiative' },
                as: 'sponsors',
            });

            initiative.hasMany(models.partner, {
                foreignKey: 'partnerableId',
                constraints: false,
                scope: { partner_link_connection: 'initiative' },
                as: 'partners',
            });
        }
    }
    initiative.init(
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
                allowNull: true,
                unique: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            shortDescription: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'short_description',
            },
            category: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            address: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            lat: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            lng: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM('in-progress', 'active', 'planned', 'completed'),
                allowNull: false,
                defaultValue: 'in-progress',
            },
            campaignStatus: {
                type: DataTypes.ENUM('open', 'closed'),
                allowNull: false,
                defaultValue: 'open',
                field: 'campaign_status',
            },
            commentsEnabled: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                field: 'comments_enabled',
            },
        },
        {
            sequelize,
            modelName: 'initiative',
            timestamps: true,
            underscored: true,
        }
    );
    return initiative;
};
