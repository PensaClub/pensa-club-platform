'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class image extends Model {
        static associate(models) {
            image.belongsTo(models.section, {
                foreignKey: 'sectionId',
            });
            image.belongsTo(models.mainImage, {
                foreignKey: 'mainImageId',
                as: 'sources',
            });
        }
    }
    image.init(
        {
            src: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            alt: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            caption: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            sectionId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'sections',
                    key: 'id',
                },
            },
            mainImageId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'mainImages',
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
            modelName: 'image',
        }
    );
    return image;
};
