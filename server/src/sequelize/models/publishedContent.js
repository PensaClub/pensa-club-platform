'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class publishedContent extends Model {
        static associate(models) {
            publishedContent.belongsTo(models.initiative, {
                foreignKey: 'initiativeId',
            });

            publishedContent.hasOne(models.image, {
                as: 'image',
                foreignKey: 'imageableId',
                constraints: false,
                scope: {
                    imageLinkConnection: 'publishedContent',
                },
            });
        }
    }
    publishedContent.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            'title-slug': {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'title_slug',
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            link: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            author: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            type: {
                type: DataTypes.ENUM('story', 'publication'),
                allowNull: false,
                validate: {
                    isIn: {
                        args: [['story', 'publication']],
                        msg: 'Type must be either story or publication',
                    },
                },
            },
            publishedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                field: 'published_at',
            },
            initiativeId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'initiatives',
                    key: 'id',
                },
                field: 'initiative_id',
            },
        },
        {
            sequelize,
            modelName: 'publishedContent',
        }
    );
    return publishedContent;
};
