'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class student_lecture extends Model {
    static associate(models) {
      // Belongs to student
      student_lecture.belongsTo(models.student, {
        foreignKey: 'studentId',
        targetKey: 'id',
        as: 'student',
      });

      // Belongs to lecture
      student_lecture.belongsTo(models.lecture, {
        foreignKey: 'lectureId',
        targetKey: 'id',
        as: 'lecture',
      });
    }
  }

  student_lecture.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'student_id',
      },
      lectureId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'lecture_id',
      },
      attended: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      attendedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'attended_at',
      },
      earnedCredits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'earned_credits',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: 'student_lecture',
      tableName: 'student_lectures',
      underscored: true,
    }
  );

  return student_lecture;
};