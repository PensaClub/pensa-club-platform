// server/src/sequelize/models/seminar_material.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class seminar_material extends Model {
    static associate(models) {
      seminar_material.belongsTo(models.seminar, {
        foreignKey: 'seminarId',
        targetKey: 'id',
        as: 'seminar',
      });

      seminar_material.belongsTo(models.user_account, {
        foreignKey: 'uploadedBy',
        targetKey: 'id',
        as: 'uploader',
      });
    }
  }

  seminar_material.init(
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
      modelName: 'seminar_material',
      tableName: 'seminar_materials',
      timestamps: true,
      underscored: true,
    }
  );

  return seminar_material;
};