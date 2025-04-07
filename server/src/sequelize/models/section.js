'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class section extends Model {
        static associate(models) {
            section.belongsTo(models.article, {
                foreignKey: 'articleId',
            });
            section.hasOne(models.sectionImage, {
                foreignKey: 'sectionId',
            });
        }
    }
    section.init(
        {
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            order: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            articleId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'articles',
                    key: 'id',
                },
            },
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
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
