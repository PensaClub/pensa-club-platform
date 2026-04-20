'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class notification_queue extends Model {
    static associate() {}
  }

  notification_queue.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      referenceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'reference_id',
      },
      referenceTitle: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'reference_title',
      },
      referenceSlug: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'reference_slug',
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
      },
      processedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'processed_at',
      },
    },
    {
      sequelize,
      modelName: 'notification_queue',
      tableName: 'notification_queue',
      timestamps: true,
      underscored: true,
    }
  );

  return notification_queue;
};
