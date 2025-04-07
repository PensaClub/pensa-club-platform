'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class mainImage extends Model {
        static associate(models) {
            mainImage.belongsTo(models.article, {
                foreignKey: 'articleId',
            });
        }
    }
    mainImage.init(
        {
            type: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            sources: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                defaultValue: [],
            },
            alt: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            thumbnail: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            articleId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'articles',
                    key: 'id',
                },
                unique: true,
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
            modelName: 'mainImage',
        }
    );
    return mainImage;
};
