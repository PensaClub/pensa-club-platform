'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class content_view extends Model {
    static associate(models) {
      content_view.belongsTo(models.user_account, {
        foreignKey: 'userId',
        targetKey: 'id',
        as: 'user',
      });
    }
  }

  content_view.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      contentType: {
        type: DataTypes.STRING(30),
        allowNull: false,
        field: 'content_type',
      },
      contentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'content_id',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'user_id',
      },
      ipHash: {
        type: DataTypes.STRING(64),
        allowNull: true,
        field: 'ip_hash',
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'user_agent',
      },
      referer: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      isBot: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_bot',
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
      },
    },
    {
      sequelize,
      modelName: 'content_view',
      tableName: 'content_views',
      updatedAt: false,
    }
  );

  return content_view;
};
