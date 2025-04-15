'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class sectionImage extends Model {
        static associate(models) {
            sectionImage.belongsTo(models.section, {
                foreignKey: 'sectionId',
            });
        }
    }
    sectionImage.init(
        {
            src: {
                type: DataTypes.STRING,
                allowNull: true,
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
                allowNull: false,
                references: {
                    model: 'sections',
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
            modelName: 'sectionImage',
        }
    );
    return sectionImage;
};
