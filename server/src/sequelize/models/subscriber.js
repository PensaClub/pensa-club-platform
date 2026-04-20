'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class subscriber extends Model {
    static associate(models) {
      subscriber.hasMany(models.subscriber_preference, {
        foreignKey: 'subscriberId',
        as: 'preferences',
      });
    }
  }
  subscriber.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Name is required.' },
          len: { args: [2, 50], msg: 'Name must be between 2 and 50 characters.' },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: 'Email format is incorrect.' },
          notEmpty: { msg: 'Email is required.' },
        },
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active',
      },
      unsubscribeToken: {
        type: DataTypes.UUID,
        allowNull: true,
        unique: true,
        defaultValue: DataTypes.UUIDV4,
        field: 'unsubscribe_token',
      },
      unsubscribedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'unsubscribed_at',
      },
      source: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'website',
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'subscriber',
      underscored: false,
    }
  );
  return subscriber;
};
