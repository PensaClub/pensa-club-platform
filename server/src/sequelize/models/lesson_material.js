// server/src/sequelize/models/lesson_material.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class lesson_material extends Model {
    static associate(models) {
      // Belongs to lesson
      lesson_material.belongsTo(models.lesson, {
        foreignKey: 'lessonId',
        targetKey: 'id',
        as: 'lesson',
      });

      // Belongs to uploader
      lesson_material.belongsTo(models.user_account, {
        foreignKey: 'uploadedBy',
        targetKey: 'id',
        as: 'uploader',
      });
    }
  }

  lesson_material.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      lessonId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'lesson_id',
        references: {
          model: 'lessons',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      uploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'uploaded_by',
        references: {
          model: 'user_accounts',
          key: 'id',
        },
      },

      // === ОСНОВНА ИНФОРМАЦИЯ ===
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // === ТИП НА МАТЕРИАЛА ===
      // pdf, doc, docx, ppt, pptx, xls, xlsx, image, video, link, other
      materialType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'material_type',
      },

      // === ФАЙЛ ===
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
        // в байтове
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'mime_type',
      },

      // === ВЪНШЕН ЛИНК ===
      // За материали от интернет (YouTube видео, Google Docs, и т.н.)
      externalUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        field: 'external_url',
      },

      // === ПОДРЕДБА И ДОСТЪП ===
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'sort_order',
      },

      // isRequired: Дали материалът е задължителен за преглед
      isRequired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_required',
      },

      // isDownloadable: Дали може да се изтегля
      isDownloadable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_downloadable',
      },

      // === СТАТУС ===
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
        // active, hidden, deleted
      },

      // === СТАТИСТИКИ ===
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
      modelName: 'lesson_material',
      tableName: 'lesson_materials',
      timestamps: true,
      underscored: true,
    }
  );

  return lesson_material;
};