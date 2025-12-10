// server/src/sequelize/models/course_material.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class course_material extends Model {
    static associate(models) {
      course_material.belongsTo(models.course, {
        foreignKey: 'courseId',
        targetKey: 'id',
        as: 'course',
      });

      course_material.belongsTo(models.user_account, {
        foreignKey: 'uploadedBy',
        targetKey: 'id',
        as: 'uploader',
      });
    }
  }

  course_material.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'course_id',
        references: {
          model: 'courses',
          key: 'id',
        },
        onDelete: 'CASCADE',
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
      isRequired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_required',
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
      viewsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'views_count',
      },
      downloadsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'downloads_count',
      },
    },
    {
      sequelize,
      modelName: 'course_material',
      tableName: 'course_materials',
      timestamps: true,
      underscored: true,
    }
  );

  return course_material;
};