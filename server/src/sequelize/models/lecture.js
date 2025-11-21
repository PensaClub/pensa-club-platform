'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class lecture extends Model {
    static associate(models) {
      // Belongs to course
      lecture.belongsTo(models.course, {
        foreignKey: 'courseId',
        targetKey: 'id',
        as: 'course',
      });

      // Has many student_lectures
      lecture.hasMany(models.student_lecture, {
        foreignKey: 'lectureId',
        sourceKey: 'id',
        as: 'attendances',
      });

      // Belongs to creator
      lecture.belongsTo(models.user_account, {
        foreignKey: 'createdBy',
        targetKey: 'id',
        as: 'creator',
      });
    }
  }

  lecture.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'course_id',
      },
      scheduledDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'scheduled_date',
      },
      durationMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60,
        field: 'duration_minutes',
      },
      maxCredits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'max_credits',
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      meetingLink: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        defaultValue: null,
        field: 'meeting_link',
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'scheduled',
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'created_by',
      },
    },
    {
      sequelize,
      modelName: 'lecture',
      tableName: 'lectures',
      underscored: true,
    }
  );

  return lecture;
};