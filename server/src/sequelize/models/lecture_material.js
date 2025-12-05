// server/src/sequelize/models/lecture_material.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class lecture_material extends Model {
    static associate(models) {
      lecture_material.belongsTo(models.lecture, {
        foreignKey: 'lectureId',
        targetKey: 'id',
        as: 'lecture',
      });

      lecture_material.belongsTo(models.user_account, {
        foreignKey: 'uploadedBy',
        targetKey: 'id',
        as: 'uploader',
      });
    }
  }

  lecture_material.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      lectureId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'lecture_id',
      },
      uploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'uploaded_by',
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      materialType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'material_type',
      },
      fileUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        field: 'file_url',
      },
      originalFileName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'original_file_name',
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'file_size',
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'mime_type',
      },
      externalUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        field: 'external_url',
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'sort_order',
      },
      isDownloadable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_downloadable',
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      sequelize,
      modelName: 'lecture_material',
      tableName: 'lecture_materials',
      timestamps: true,
      underscored: true,
    }
  );

  return lecture_material;
};