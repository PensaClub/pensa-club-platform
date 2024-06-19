"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class user_account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      user_account.hasOne(models.user_details, {
        foreignKey: "user_accounts_id", // Foreign key in user_details table
        sourceKey: "id", // Primary key in user_accounts table
        as: "details",
      });
      // define association here
    }
  }

  user_account.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: "Email format is incorrect.",
          },
          notEmpty: {
            msg: "Email is required.",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Password is required.'
          },
        }
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
        values: ['admin', 'user'],
        allowNull: false,
        defaultValue: 'user',
      },
    }, {
    sequelize,
    modelName: 'user_account',
  });

  return user_account;
};
