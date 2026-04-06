'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class seminar_media extends Model {
    static associate(models) {
      seminar_media.belongsTo(models.seminar, {
        foreignKey: 'seminarId',
        targetKey: 'id',
        as: 'seminar',
      });
      seminar_media.belongsTo(models.user_account, {
        foreignKey: 'uploadedBy',
        targetKey: 'id',
        as: 'uploader',
      });
    }
  }

  seminar_media.init(
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
      uploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'uploaded_by',
      },
      mediaType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'media_type',
      },
      fileUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'file_url',
      },
      fileName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'file_name',
      },
      fileType: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'file_type',
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'file_size',
      },
      thumbnailUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'thumbnail_url',
      },
      youtubeVideoId: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'youtube_video_id',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'seminar_media',
      tableName: 'seminar_media',
      underscored: true,
      timestamps: true,
    }
  );

  return seminar_media;
};
