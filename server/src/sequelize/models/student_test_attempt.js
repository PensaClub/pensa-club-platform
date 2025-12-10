// server/src/sequelize/models/student_test_attempt.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class student_test_attempt extends Model {
    static associate(models) {
      // Belongs to student
      student_test_attempt.belongsTo(models.student, {
        foreignKey: 'studentId',
        targetKey: 'id',
        as: 'student',
      });
      // Has many attempt answers
      student_test_attempt.hasMany(models.test_attempt_answer, {
        foreignKey: 'attemptId',
        sourceKey: 'id',
        as: 'attemptAnswers',
      })
      // Belongs to test
      student_test_attempt.belongsTo(models.lesson_test, {
        foreignKey: 'testId',
        targetKey: 'id',
        as: 'test',
      });
    }
  }

  student_test_attempt.init(
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
        references: {
          model: 'students',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      testId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'test_id',
        references: {
          model: 'lesson_tests',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      // === ОПИТ ===
      attemptNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: 'attempt_number',
      },

      // === ВРЕМЕ ===
      startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'started_at',
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'completed_at',
      },
      timeSpentSeconds: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'time_spent_seconds',
      },

      // === РЕЗУЛТАТИ ===

      // answers: JSON с отговорите на студента
      // Формат: { questionId: selectedAnswerId или [selectedAnswerIds] или "text" }
      answers: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },

      // score: Резултат в проценти (0-100)
      score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },

      // correctAnswers: Брой верни отговори
      correctAnswers: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'correct_answers',
      },

      // totalQuestions: Общо въпроси
      totalQuestions: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'total_questions',
      },

      // pointsEarned: Спечелени точки
      pointsEarned: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'points_earned',
      },

      // maxPoints: Максимални точки
      maxPoints: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'max_points',
      },

      // === СТАТУС ===

      // status: Статус на опита
      // - 'in_progress': Студентът решава теста
      // - 'completed': Завършен
      // - 'timeout': Времето е изтекло
      // - 'abandoned': Напуснат без да се завърши
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'in_progress',
      },

      // isPassed: Дали е преминал теста
      isPassed: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'is_passed',
      },

      // === КРЕДИТИ ===
      earnedCredits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'earned_credits',
      },
    },
    {
      sequelize,
      modelName: 'student_test_attempt',
      tableName: 'student_test_attempts',
      timestamps: true,
      underscored: true,
    }
  );

  return student_test_attempt;
};