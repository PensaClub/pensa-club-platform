'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class user_details extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            user_details.belongsTo(models.user_account, {
                foreignKey: 'userAccountsId',
                targetKey: 'id', // Primary key in user_accounts table
                as: 'account',
            });
        }
    }
    user_details.init(
        {
            phoneNumber: {
                type: DataTypes.STRING(16),
                allowNull: true,
                defaultValue: null,
                field: 'phone_number',
                validate: {
                    len: {
                        args: [8, 16],
                        msg: 'Phone number has invalid number of characters.',
                    },
                    is: {
                        args: /^(?:\+\d{7,15}|\d{10})$/,
                        msg: 'Phone number must be a valid format.',
                    },
                },
            },
            username: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    notEmpty: {
                        msg: 'Username is required.',
                    },
                    len: {
                        args: [6, 16],
                        msg: 'Username must be between 6 and 16 characters.',
                    },
                    is: {
                        args: /^[a-zA-Zа-яА-Я][a-zA-Zа-яА-Я0-9_-]{6,16}$/,
                        msg: 'Username must start with a letter and can only contain letters, numbers, and underscores.',
                    },
                },
            },
            firstName: {
                type: DataTypes.STRING(20),
                allowNull: true,
                defaultValue: null,
                field: 'first_name',
                validate: {
                    customValidator(value) {
                        if (value && value.length > 0) {
                            if (value.length < 3 || value.length > 20) {
                                throw new Error('First name must be between 3 and 20 characters in length.');
                            }
                            if (!/^[a-zA-Zа-яА-Я0-9_]+(-[a-zA-Zа-яА-Я0-9_]+)*$/i.test(value)) {
                                throw new Error('First name must be 3-20 characters, using letters, hyphens, and include both Cyrillic or Latin alphabets.');
                            }
                        }
                    },
                },
            },
            lastName: {
                type: DataTypes.STRING(20),
                allowNull: true,
                defaultValue: null,
                field: 'last_name',
                validate: {
                    customValidator(value) {
                        if (value && value.length > 0) {
                            if (value.length < 3 || value.length > 20) {
                                throw new Error('Last name must be between 3 and 20 characters in length.');
                            }
                            if (!/^[a-zA-Zа-яА-Я0-9_]+(-[a-zA-Zа-яА-Я0-9_]+)*$/i.test(value)) {
                                throw new Error('Last name must be 3-20 characters, using letters, hyphens, and include both Cyrillic or Latin alphabets.');
                            }
                        }
                    },
                },
            },
            region: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    notEmpty: {
                        msg: 'Region is required.',
                    },
                },
            },
            workOptions: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                allowNull: true,
                field: 'work_options',
                validate: {
                    isArray(value) {
                        if (value !== null && !Array.isArray(value)) {
                            throw new Error('Work options must be an array of strings.');
                        }
                    },
                },
            },
            skills: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                allowNull: true,
                validate: {
                    isArray(value) {
                        if (value !== null && !Array.isArray(value)) {
                            throw new Error('Skills must be an array of strings.');
                        }
                    },
                },
            },
            interestOptions: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                allowNull: true,
                field: 'interest_options',
                validate: {
                    isArray(value) {
                        if (value !== null && !Array.isArray(value)) {
                            throw new Error('Interest options must be an array of strings.');
                        }
                    },
                },
            },
            gender: {
                type: DataTypes.ENUM,
                values: ['male', 'female', 'other'],
                allowNull: true,
                defaultValue: null,
                validate: {
                    isIn: {
                        args: [['male', 'female', 'other']],
                        msg: "Gender must be 'male', 'female', or 'other'.",
                    },
                },
            },
            birthDate: {
                type: DataTypes.DATEONLY,
                defaultValue: null,
                allowNull: true,
                field: 'birth_date',
                validate: {
                    isDate: true,
                    isNotInFuture(value) {
                        if (new Date(value) > new Date()) {
                            throw new Error('Date cannot be in the future.');
                        }
                    },
                },
            },
            imageURL: {
                type: DataTypes.STRING(2048),
                allowNull: true,
                defaultValue: null,
                validate: {
                    isUrl: true,
                },
            },
            firebaseImagePath: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null,
                field: 'firebase_image_path',
            },
            userAccountsId: {
                type: DataTypes.INTEGER,
                field: 'user_accounts_id',
            },
        },
        {
            sequelize,
            modelName: 'user_details',
        }
    );
    return user_details;
};
