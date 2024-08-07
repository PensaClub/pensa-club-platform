'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class refreshToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      refreshToken.belongsTo(models.user_account, {
        foreignKey: 'userId', // Foreign key in refreshToken table
        targetKey: 'id', // Primary key in user_account table
        as: 'user', // Alias for association
      });
    }
  }
  refreshToken.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user_accounts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: 'Token cannot be empty.',
          },
        },
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          isAfter: new Date().toString(), // Ensures the date is in the future
        },
      },
    },
    {
      sequelize,
      modelName: 'refreshToken',
      timestamps: true,
    }
  );
  return refreshToken;
};
