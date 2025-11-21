'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class mentor_history extends Model {
    static associate(models) {
      // Belongs to student
      mentor_history.belongsTo(models.student, {
        foreignKey: 'studentId',
        targetKey: 'id',
        as: 'student',
      });

      // Belongs to mentor
      mentor_history.belongsTo(models.mentor, {
        foreignKey: 'mentorId',
        targetKey: 'id',
        as: 'mentor',
      });
    }
  }

  mentor_history.init(
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
      mentorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'mentor_id',
      },
      mentorName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'mentor_name',
      },
      periodStart: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'period_start',
      },
      periodEnd: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'period_end',
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: 'mentor_history',
      tableName: 'mentor_history',
      underscored: true,
    }
  );

  return mentor_history;
};