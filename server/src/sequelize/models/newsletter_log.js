'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class newsletter_log extends Model {
    static associate(models) {
      newsletter_log.belongsTo(models.newsletter, {
        foreignKey: 'newsletterId',
        as: 'newsletter',
      });
      newsletter_log.belongsTo(models.subscriber, {
        foreignKey: 'subscriberId',
        as: 'subscriber',
      });
    }
  }

  newsletter_log.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      newsletterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'newsletter_id',
      },
      subscriberId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'subscriber_id',
      },
      channel: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'email',
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'error_message',
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'sent_at',
      },
    },
    {
      sequelize,
      modelName: 'newsletter_log',
      tableName: 'newsletter_logs',
      timestamps: true,
      underscored: true,
    }
  );

  return newsletter_log;
};
