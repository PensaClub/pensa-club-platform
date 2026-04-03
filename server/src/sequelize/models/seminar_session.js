'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class seminar_session extends Model {
    static associate(models) {
      seminar_session.belongsTo(models.seminar, {
        foreignKey: 'seminarId',
        as: 'seminar',
      });
      seminar_session.hasMany(models.session_attendance, {
        foreignKey: 'sessionId',
        as: 'attendances',
      });
    }
  }

  seminar_session.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      seminarId: { type: DataTypes.INTEGER, allowNull: false, field: 'seminar_id' },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      startTime: { type: DataTypes.TIME, allowNull: false, field: 'start_time' },
      endTime: { type: DataTypes.TIME, allowNull: true, field: 'end_time' },
      location: { type: DataTypes.STRING(500), allowNull: true },
      maxParticipants: { type: DataTypes.INTEGER, allowNull: true, field: 'max_participants' },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      sequelize,
      modelName: 'seminar_session',
      tableName: 'seminar_sessions',
      underscored: true,
      timestamps: true,
    }
  );

  return seminar_session;
};
