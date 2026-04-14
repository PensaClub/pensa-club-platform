'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class file_share extends Model {
    static associate(models) {
      file_share.belongsTo(models.user_account, {
        foreignKey: 'sharedBy',
        as: 'sharer',
      });
      file_share.belongsTo(models.user_account, {
        foreignKey: 'sharedWith',
        as: 'recipient',
      });
    }
  }

  file_share.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      filePath: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'file_path',
      },
      fileName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'file_name',
      },
      sharedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'shared_by',
      },
      sharedWith: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'shared_with',
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_read',
      },
      isFolder: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_folder',
      },
    },
    {
      sequelize,
      modelName: 'file_share',
      tableName: 'file_shares',
      underscored: true,
      timestamps: true,
    }
  );

  return file_share;
};
