'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class newsletter extends Model {
    static associate(models) {
      newsletter.hasMany(models.newsletter_log, {
        foreignKey: 'newsletterId',
        as: 'logs',
      });
      newsletter.belongsTo(models.user_account, {
        foreignKey: 'createdBy',
        as: 'author',
      });
    }
  }

  newsletter.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'manual',
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'draft',
      },
      targetCategories: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'target_categories',
      },
      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'scheduled_at',
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'sent_at',
      },
      sentCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'sent_count',
      },
      failedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'failed_count',
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'created_by',
      },
      platformUpdates: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'platform_updates',
      },
    },
    {
      sequelize,
      modelName: 'newsletter',
      tableName: 'newsletters',
      timestamps: true,
      underscored: true,
    }
  );

  return newsletter;
};
