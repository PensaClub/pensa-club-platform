'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Initiative extends Model {
        static associate(models) {
            Initiative.hasMany(models.projects, {
                foreignKey: 'initiativeId',
                as: 'projects',
            });

            Initiative.hasMany(models.downloadMaterials, {
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

            Initiative.hasMany(models.contacts, {
                foreignKey: 'initiativeId',
                as: 'additionalContacts',
            });

            Initiative.hasOne(models.contacts, {
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
            slug: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            shortDescription: {
                type: DataTypes.STRING,
                allowNull: true,
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
                type: DataTypes.ENUM('in-progress', 'active', 'planned'),
                allowNull: false,
                defaultValue: 'in-progress',
                validate: {
                    isIn: {
                        args: ['in-progress', 'active', 'planned'],
                        msg: 'Status must be in-progress, active or planned',
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
            },
            commentsEnabled: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'initiative',
        }
    );
    return Initiative;
};
