'use strict';
const {
  Model
} = require('sequelize');
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
        foreignKey: "user_id", // Foreign key in user_details table
        targetKey: "id", // Primary key in user_accounts table
        as: "account",
      });
    }
  }
  user_ads.init({
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    summary: {
      type: DataTypes.STRING(32),
      allowNull: false,
      validate: {
        len: {
          args: [8, 32],
          msg: "Summary must be between 8 and 32 characters in length."
        }
      }
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: "Maximum description length limit of 1000 characters is reached."
        }
      }
    },
    creation_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    expiration_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: () => new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)

    },
    approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'user_ads',
  });
  return user_ads;
};