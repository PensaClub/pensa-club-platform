'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UsefulLink extends Model {
        static associate(models) {
            UsefulLink.belongsTo(models.user_account, {
                foreignKey: 'createdBy',
                as: 'creator',
            });
        }
    }

    UsefulLink.init(
        {
            slug: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            titleEn: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            titleDe: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            descriptionEn: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            descriptionDe: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            url: {
                type: DataTypes.STRING(2048),
                allowNull: false,
            },
            imageUrl: {
                type: DataTypes.STRING(2048),
                allowNull: true,
            },
            category: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'general',
            },
            viewCount: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            displayOrder: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            firebaseImagePath: {
                type: DataTypes.STRING(2048),
                allowNull: true,
            },
            createdBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'user_accounts',
                    key: 'id',
                },
            },
        },
        {
            sequelize,
            modelName: 'useful_link',
        }
    );

    return UsefulLink;
};
