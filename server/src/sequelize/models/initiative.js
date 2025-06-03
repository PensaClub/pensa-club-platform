'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Initiative extends Model {
        static associate(models) {
            Initiative.belongsTo(models.user_account, {
                foreignKey: 'creatorId',
                as: 'creator',
            });

            Initiative.hasMany(models.project, {
                foreignKey: 'initiativeId',
                as: 'projects',
            });

            Initiative.hasMany(models.downloadMaterial, {
                foreignKey: 'initiativeId',
                as: 'downloadMaterials',
            });

            Initiative.hasMany(models.publishedContent, {
                foreignKey: 'initiativeId',
                as: 'stories',
                scope: {
                    type: 'story',
                },
            });

            Initiative.hasMany(models.publishedContent, {
                foreignKey: 'initiativeId',
                as: 'publications',
                scope: {
                    type: 'publication',
                },
            });

            Initiative.hasMany(models.contact, {
                foreignKey: 'initiativeId',
                as: 'additionalContacts',
            });

            Initiative.hasOne(models.contact, {
                foreignKey: 'initiativeId',
                as: 'contact',
                scope: {
                    isMainContact: true,
                },
            });

            Initiative.hasOne(models.image, {
                as: 'mainImage',
                foreignKey: 'imageableId',
                constraints: false,
                scope: {
                    imageLinkConnection: 'initiative',
                },
            });

            Initiative.hasMany(models.section, {
                as: 'sections',
                foreignKey: 'sectionableId',
                constraints: false,
                scope: {
                    sectionLinkConnection: 'initiative',
                },
            });
        }
    }
    Initiative.init(
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
                validate: {
                    isIn: {
                        args: ['in-progress', 'active', 'planned', 'completed'],
                        msg: 'Status must be in-progress, active, planned or completed',
                    },
                },
            },
            campaignStatus: {
                type: DataTypes.ENUM('open', 'closed'),
                allowNull: false,
                defaultValue: 'open',
                validate: {
                    isIn: {
                        args: ['open', 'closed'],
                        msg: 'Campaign Status must be open or closed',
                    },
                },
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
        }
    );
    return Initiative;
};
