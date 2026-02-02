
// server/src/sequelize/models/student_seminar.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class student_seminar extends Model {
    static associate(models) {
      // Belongs to student
      student_seminar.belongsTo(models.student, {
        foreignKey: 'studentId',
        targetKey: 'id',
        as: 'student',
      });

      // Belongs to seminar
      student_seminar.belongsTo(models.seminar, {
        foreignKey: 'seminarId',
        targetKey: 'id',
        as: 'seminar',
      });
    }
  }

  student_seminar.init(
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
      seminarId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'seminar_id',
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
      status: {
  type: DataTypes.STRING,
  allowNull: false,
  defaultValue: 'registered',
  // registered, approved, pending, rejected, cancelled
},
    },
    {
      sequelize,
      modelName: 'student_seminar',
      tableName: 'student_seminars',
      underscored: true,
    }
  );

  return student_seminar;
};