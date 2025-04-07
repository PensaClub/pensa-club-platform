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
                type: DataTypes.ENUM('image', 'slider', 'video'),
                allowNull: false,
            },
            sources: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                allowNull: false,
                validate: {
                    validateSources(value) {
                        if (!Array.isArray(value)) {
                            throw new Error('Sources must be an array');
                        }

                        if (this.type === 'image' && value.length !== 1) {
                            throw new Error('Image type must have exactly one source');
                        }
                        if (this.type === 'slider' && value.length < 2) {
                            throw new Error('Slider must have at least two sources');
                        }
                        if (this.type === 'video' && value.length !== 1) {
                            throw new Error('Video must have exactly one source');
                        }
                    },
                },
            },
            alt: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            thumbnail: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    isForVideo() {
                        if (this.type !== 'video' && this.thumbnail) {
                            throw new Error('Thumbnail can only be set for video type');
                        }
                    },
                },
                get() {
                    const value = this.getDataValue('thumbnail');
                    return this.type === 'video' ? value : undefined;
                },
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
            modelName: 'mainImage',
        }
    );
    return mainImage;
};
