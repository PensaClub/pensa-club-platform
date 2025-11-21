'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class student_presentation extends Model {
    static associate(models) {
      // Belongs to student
      student_presentation.belongsTo(models.student, {
        foreignKey: 'studentId',
        targetKey: 'id',
        as: 'student',
      });

      // Belongs to presentation
      student_presentation.belongsTo(models.presentation, {
        foreignKey: 'presentationId',
        targetKey: 'id',
        as: 'presentation',
      });

      // Belongs to grader
      student_presentation.belongsTo(models.user_account, {
        foreignKey: 'gradedBy',
        targetKey: 'id',
        as: 'grader',
      });
    }
  }

  student_presentation.init(
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
      presentationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'presentation_id',
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'not_submitted',
      },
      submissionUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        defaultValue: null,
        field: 'submission_url',
      },
      submissionText: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        field: 'submission_text',
      },
      submittedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'submitted_at',
      },
      gradedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'graded_at',
      },
      earnedCredits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'earned_credits',
      },
      feedback: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      gradedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'graded_by',
      },
    },
    {
      sequelize,
      modelName: 'student_presentation',
      tableName: 'student_presentations',
      underscored: true,
    }
  );

  return student_presentation;
};