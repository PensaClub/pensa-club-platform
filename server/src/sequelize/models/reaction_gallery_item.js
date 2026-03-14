'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class reaction_gallery_item extends Model {
    static associate(models) {
      reaction_gallery_item.belongsTo(models.user_account, {
        foreignKey: 'uploadedBy',
        targetKey: 'id',
        as: 'uploader',
      });
    }
  }

  reaction_gallery_item.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      mediaType: {
        type: DataTypes.ENUM('image', 'video'),
        allowNull: false,
        field: 'media_type',
      },
      mediaUrl: {
        type: DataTypes.STRING(2048),
        allowNull: false,
        field: 'media_url',
        validate: {
          notEmpty: { msg: 'Media URL is required.' },
        },
      },
      thumbnailUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        defaultValue: null,
        field: 'thumbnail_url',
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: true,
        defaultValue: null,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'sort_order',
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_published',
      },
      uploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'uploaded_by',
        references: {
          model: 'user_accounts',
          key: 'id',
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      modelName: 'reaction_gallery_item',
      tableName: 'reaction_gallery_items',
    }
  );

  return reaction_gallery_item;
};
