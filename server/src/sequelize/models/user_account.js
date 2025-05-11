'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class user_account extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            user_account.hasOne(models.user_details, {
                foreignKey: 'user_accounts_id', // Foreign key in user_details table
                sourceKey: 'id', // Primary key in user_accounts table
                as: 'details',
            });
            user_account.hasMany(models.user_ads, {
                foreignKey: 'user_id', // Foreign key in user_details table
                sourceKey: 'id', // Primary key in user_accounts table
                as: 'ads',
            });
            user_account.hasMany(models.refreshToken, {
                foreignKey: 'userId', // Foreign key in refreshToken table
                sourceKey: 'id', // Primary key in user_accounts table
                as: 'refreshTokens',
            });
            // define association here
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
            role_change_comment: {
                type: DataTypes.STRING(1000),
                allowNull: true,
                defaultValue: null,
                set(value) {
                    this.setDataValue('role_change_comment', value === '' ? null : value);
                },
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
            is_google_user: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: 'user_account',
        }
    );

    return user_account;
};
