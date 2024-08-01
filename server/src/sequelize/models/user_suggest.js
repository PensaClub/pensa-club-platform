'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class user_suggest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  user_suggest.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.STRING(16),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Phone number is required.',
          },
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
      name: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: null,
        validate: {
          customValidator(value) {
            if (value && value.length > 0) {
              if (value.length < 3 || value.length > 20) {
                throw new Error('Name must be between 3 and 20 characters in length.');
              }
              if (!/^[a-zA-Zа-яА-Я0-9_\s]+(-[a-zA-Zа-яА-Я0-9_]+)*$/i.test(value)) {
                throw new Error('Name must be 3-20 characters, using letters, hyphens, and include both Cyrillic or Latin alphabets.');
              }
            }
          },
        },
      },

      refferer_name: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: null,
        validate: {
          customValidator(value) {
            if (value && value.length > 0) {
              if (value.length < 3 || value.length > 20) {
                throw new Error('Name must be between 3 and 20 characters in length.');
              }
              if (!/^[a-zA-Zа-яА-Я0-9_\s]+(-[a-zA-Zа-яА-Я0-9_]+)*$/i.test(value)) {
                throw new Error('Name must be 3-20 characters, using letters, hyphens, and include both Cyrillic or Latin alphabets.');
              }
            }
          },
        },
      },

      message: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },

      resolved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'user_suggest',
    }
  );

  return user_suggest;
};
