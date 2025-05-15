'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class user_ads extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            user_ads.belongsTo(models.user_account, {
                foreignKey: 'userId',
                targetKey: 'id',
                as: 'account',
            });
        }
    }
    user_ads.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
            adId: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                field: 'ad_id',
                validate: {
                    notNull: {
                        msg: 'Ad id is required.',
                    },
                    notEmpty: {
                        msg: 'Ad id cannot be empty.',
                    },
                },
            },
            summary: {
                type: DataTypes.STRING(32),
                allowNull: false,
                validate: {
                    len: {
                        args: [4, 32],
                        msg: 'Summary must be between 4 and 32 characters in length.',
                    },
                },
            },
            category: {
                type: DataTypes.ENUM,
                values: ['recommend', 'donate', 'sell', 'work', 'courses', 'health', 'initiatives_projects', 'tours', 'games', 'arbitration'],
                allowNull: true,
                defaultValue: null,
                validate: {
                    isIn: {
                        args: [['recommend', 'donate', 'sell', 'work', 'courses', 'health', 'initiatives_projects', 'tours', 'games', 'arbitration']],
                        msg: 'Category must be one of the following: recommend, donate, sell, work, courses, health, initiatives_projects, tours, games or arbitration.',
                    },
                },
            },
            description: {
                type: DataTypes.STRING(1000),
                allowNull: false,
                validate: {
                    customValidator(value) {
                        if (value.length < 10) {
                            throw new Error('Description must be at least 10 characters long.');
                        } else if (value.length > 1000) {
                            throw new Error('Maximum description length limit of 1000 characters is reached.');
                        }
                    },
                },
            },
            adRegion: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'ad_region',
                validate: {
                    notEmpty: {
                        msg: 'Region is required.',
                    },
                },
            },
            adSubregion: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'ad_subregion',
                validate: {
                    notEmpty: {
                        msg: 'Subregion is required.',
                    },
                },
            },
            adTown: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'ad_town',
                validate: {
                    notEmpty: {
                        msg: 'Town is required.',
                    },
                },
            },
            street: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: {
                        msg: 'Street is required.',
                    },
                },
            },
            tags: {
                type: DataTypes.ARRAY(DataTypes.STRING(16)),
                allowNull: false,
                defaultValue: [],
                validate: {
                    customValidator(value) {
                        if (!Array.isArray(value)) {
                            throw new Error('Tags must be an array.');
                        }
                        if (value.length > 5) {
                            throw new Error('Tags array must contain between 0 to 5 elements.');
                        }
                        value.forEach((tag) => {
                            if (typeof tag !== 'string' || tag.length > 16) {
                                throw new Error('Each tag must be a string of max length 16.');
                            }
                        });
                    },
                },
            },
            images: {
                type: DataTypes.JSON,
                allowNull: false,
                validate: {
                    isValidArray(value) {
                        if (!Array.isArray(value)) {
                            throw new Error('Images must be an array.');
                        }
                        if (value.length > 4) {
                            throw new Error('Cannot have more than 4 images per ad.');
                        }
                        if (value.length <= 0) {
                            throw new Error('Each ad should contain at least 1 image.');
                        }
                        value.forEach((image) => {
                            if (!image.imageURL || !image.firebaseImagePath) {
                                throw new Error('Each image must have a url and a path.');
                            }
                        });
                    },
                },
            },
            creationDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                field: 'creation_date',
                defaultValue: DataTypes.NOW,
            },
            expirationDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                field: 'expiration_date',
                defaultValue: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'pending',
                validate: {
                    isIn: {
                        args: [['pending', 'approved', 'denied']],
                        message: 'Invalid status type. Status must be approved, denied or pending.',
                    },
                },
            },
            adminComment: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'admin_comment',
            },
            extraFields: {
                type: DataTypes.JSONB,
                allowNull: true,
                field: 'extra_fields',
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE,
            },
        },
        {
            sequelize,
            modelName: 'user_ads',
        }
    );
    return user_ads;
};
