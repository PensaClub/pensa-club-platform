'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class section extends Model {
        static associate(models) {
            section.belongsTo(models.article, {
                foreignKey: 'articleId',
            });
            section.hasMany(models.image, {
                foreignKey: 'sectionId',
            });
        }
    }
    section.init(
        {
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
