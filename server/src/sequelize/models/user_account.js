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
      // define association here
    }
  }

  user_account.init({
    phone_number: {
      type: DataTypes.STRING(16),
      unique: true,
      allowNull: false,
      notEmpty: true,
      validate: {
        len: {
          args: [8, 16],
          msg: 'Phone number is not valid.'
        },
        is: {
          args: /^(?:\+\d{7,15}|\d{10})$/,
          msg: 'Phone number is not valid.'
        },
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      notEmpty: true,
    }
  }, {
    sequelize,
    modelName: 'user_account',
  });

  return user_account;
};