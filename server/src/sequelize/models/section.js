'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class section extends Model {
        static associate(models) {
            section.belongsTo(models.article, {
                foreignKey: 'sectionableId',
                constraints: false,
                scope: {
                    section_link_connection: 'article',
                },
            });
            section.belongsTo(models.initiative, {
                foreignKey: 'sectionableId',
                constraints: false,
                scope: {
                    section_link_connection: 'initiative',
                },
            });
            section.hasMany(models.image, {
                as: 'sectionImages',
                foreignKey: 'imageableId',
                constraints: false,
                scope: {
                    image_link_connection: 'section',
                },
            });
        }
    }
    section.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            titleSlug: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'title_slug',
            },
            title: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            order: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            sectionableId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'sectionable_id',
            },
            sectionLinkConnection: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'section_link_connection',
            },
            createdAt: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'section',
        }
    );
    return section;
};
