'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class user_account extends Model {
        static associate(models) {
            user_account.hasOne(models.user_details, {
                foreignKey: 'userAccountsId',
                sourceKey: 'id',
                as: 'details',
            });

            user_account.hasMany(models.user_ads, {
                foreignKey: 'userId',
                sourceKey: 'id',
                as: 'ads',
            });

            user_account.hasMany(models.refreshToken, {
                foreignKey: 'userId',
                sourceKey: 'id',
                as: 'refreshTokens',
            });

            user_account.belongsToMany(models.initiative, {
                through: models.initiativeBookmark,
                as: 'bookmarkedInitiatives',
                foreignKey: 'userId',
                otherKey: 'initiativeId',
            });
        }
    }

    user_account.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: {
                        msg: 'Email format is incorrect.',
                    },
                    notEmpty: {
                        msg: 'Email is required.',
                    },
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            finished: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            reset_token: DataTypes.STRING,
            token_expiration: DataTypes.DATE,
            role: {
                type: DataTypes.STRING,
                values: ['admin', 'moderator', 'user', 'guest', 'limited'],
                allowNull: false,
                defaultValue: 'user',
                validate: {
                    isIn: {
                        args: [['admin', 'moderator', 'user', 'guest', 'limited']],
                        msg: 'Role must be one of the following: admin, moderator, user, limited or guest.',
                    },
                },
            },
            roleChangeComment: {
                type: DataTypes.STRING(1000),
                allowNull: true,
                defaultValue: null,
                set(value) {
                    this.setDataValue('roleChangeComment', value === '' ? null : value);
                },
                field: 'role_change_comment',
                validate: {
                    customValidator(value) {
                        if (value !== null && value !== undefined && value !== '') {
                            if (value.length > 1000) {
                                throw new Error('Maximum comment length limit of 1000 characters is reached.');
                            }
                        }
                    },
                },
            },
            isGoogleUser: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_google_user',
            },
        },
        {
            sequelize,
            modelName: 'user_account',
        }
    );

    return user_account;
};
