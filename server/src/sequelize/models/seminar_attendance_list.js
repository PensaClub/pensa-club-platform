'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class seminar_attendance_list extends Model {
    static associate(models) {
      seminar_attendance_list.belongsTo(models.seminar, {
        foreignKey: 'seminarId',
        targetKey: 'id',
        as: 'seminar',
      });
      seminar_attendance_list.belongsTo(models.user_account, {
        foreignKey: 'uploadedBy',
        targetKey: 'id',
        as: 'uploader',
      });
    }
  }

  seminar_attendance_list.init(
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
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'file_type',
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'file_size',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'seminar_attendance_list',
      tableName: 'seminar_attendance_lists',
      underscored: true,
      timestamps: true,
    }
  );

  return seminar_attendance_list;
};
