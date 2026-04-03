// server/src/sequelize/models/seminar_guest_attendance.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class seminar_guest_attendance extends Model {
    static associate(models) {
      seminar_guest_attendance.belongsTo(models.seminar, {
        foreignKey: 'seminarId',
        targetKey: 'id',
        as: 'seminar',
      });
      seminar_guest_attendance.belongsTo(models.user_account, {
        foreignKey: 'markedBy',
        targetKey: 'id',
        as: 'markedByUser',
      });
    }
  }

  seminar_guest_attendance.init(
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
      guestFirstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'guest_first_name',
      },
      guestLastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'guest_last_name',
      },
      guestEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'guest_email',
      },
      guestPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'guest_phone',
      },
      participationLevel: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: 'passive',
        field: 'participation_level',
      },
      markedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'marked_by',
      },
      convertedToUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'converted_to_user_id',
      },
    },
    {
      sequelize,
      modelName: 'seminar_guest_attendance',
      tableName: 'seminar_guest_attendances',
      underscored: true,
      timestamps: true,
    }
  );

  return seminar_guest_attendance;
};