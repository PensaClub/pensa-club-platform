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
      type: DataTypes.STRING(10),
      unique: true,
      allowNull: false,
      notEmpty: true,
      validate: {
        is: {
          args: /^(\+?\d{1,3})?\s*\d{9}$/,
          msg: 'Phone number is not a valid.'
        }
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