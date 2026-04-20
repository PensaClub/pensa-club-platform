'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class subscriber_preference extends Model {
    static associate(models) {
      subscriber_preference.belongsTo(models.subscriber, {
        foreignKey: 'subscriberId',
        as: 'subscriber',
      });
    }
  }

  subscriber_preference.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      subscriberId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'subscriber_id',
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'subscriber_preference',
      tableName: 'subscriber_preferences',
      timestamps: true,
      underscored: true,
    }
  );

  return subscriber_preference;
};
