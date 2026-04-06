'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class session_attendance extends Model {
    static associate(models) {
      session_attendance.belongsTo(models.seminar_session, {
        foreignKey: 'sessionId',
        as: 'session',
      });
      session_attendance.belongsTo(models.student, {
        foreignKey: 'studentId',
        as: 'student',
      });
      session_attendance.belongsTo(models.seminar_guest_attendance, {
        foreignKey: 'guestAttendanceId',
        as: 'guestAttendance',
      });
      session_attendance.belongsTo(models.user_account, {
        foreignKey: 'markedBy',
        as: 'markedByUser',
      });
    }
  }

  session_attendance.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      sessionId: { type: DataTypes.INTEGER, allowNull: false, field: 'session_id' },
      studentId: { type: DataTypes.INTEGER, allowNull: true, field: 'student_id' },
      guestAttendanceId: { type: DataTypes.INTEGER, allowNull: true, field: 'guest_attendance_id' },
      registered: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      attended: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      attendedAt: { type: DataTypes.DATE, allowNull: true, field: 'attended_at' },
      participationLevel: { type: DataTypes.STRING(20), allowNull: true, defaultValue: 'passive', field: 'participation_level' },
      earnedCredits: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'earned_credits' },
      markedBy: { type: DataTypes.INTEGER, allowNull: true, field: 'marked_by' },
    },
    {
      sequelize,
      modelName: 'session_attendance',
      tableName: 'session_attendances',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );

  return session_attendance;
};
