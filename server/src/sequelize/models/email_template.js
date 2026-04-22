'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class email_template extends Model {
    static associate(models) {
      email_template.belongsTo(models.user_account, {
        foreignKey: 'updatedBy',
        as: 'editor',
      });
    }
  }

  email_template.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      templateKey: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true,
        field: 'template_key',
      },
      headerHtml: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'header_html',
      },
      footerHtml: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'footer_html',
      },
      logoUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        field: 'logo_url',
      },
      primaryColor: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'primary_color',
      },
      secondaryColor: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'secondary_color',
      },
      signature: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'updated_by',
      },
    },
    {
      sequelize,
      modelName: 'email_template',
      tableName: 'email_templates',
      timestamps: true,
      underscored: true,
    },
  );

  return email_template;
};
