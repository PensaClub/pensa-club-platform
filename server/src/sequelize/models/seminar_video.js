// server/src/sequelize/models/seminar_video.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class seminar_video extends Model {
    static associate(models) {
      seminar_video.belongsTo(models.seminar, {
        foreignKey: 'seminarId',
        targetKey: 'id',
        as: 'seminar',
      });
    }
  }

  seminar_video.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      seminarId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'seminar_id',
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      videoUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'video_url',
      },
      videoProvider: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'youtube',
        field: 'video_provider',
      },
      thumbnailUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'thumbnail_url',
      },
      durationMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'duration_minutes',
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'sort_order',
      },
    },
    {
      sequelize,
      modelName: 'seminar_video',
      tableName: 'seminar_videos',
      timestamps: true,
      underscored: true,
    }
  );

  return seminar_video;
};
