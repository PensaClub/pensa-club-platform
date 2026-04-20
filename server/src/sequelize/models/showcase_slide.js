'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class showcase_slide extends Model {
    static associate() {}
  }

  showcase_slide.init(
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
        defaultValue: 'custom',
      },
      referenceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'reference_id',
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      categoryLabel: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'category_label',
      },
      imageUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'image_url',
      },
      linkUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'link_url',
      },
      buttonText: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'Разгледай още',
        field: 'button_text',
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'sort_order',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
      },
      durationSeconds: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 6,
        field: 'duration_seconds',
      },
    },
    {
      sequelize,
      modelName: 'showcase_slide',
      tableName: 'showcase_slides',
      timestamps: true,
      underscored: true,
    }
  );

  return showcase_slide;
};
