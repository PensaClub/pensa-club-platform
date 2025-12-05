// server/src/sequelize/models/student_lesson.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class student_lesson extends Model {
    static associate(models) {
      // Belongs to student
      student_lesson.belongsTo(models.student, {
        foreignKey: 'studentId',
        targetKey: 'id',
        as: 'student',
      });

      // Belongs to lesson
      student_lesson.belongsTo(models.lesson, {
        foreignKey: 'lessonId',
        targetKey: 'id',
        as: 'lesson',
      });
    }
  }

  student_lesson.init(
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
      lessonId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'lesson_id',
        references: {
          model: 'lessons',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      // === ПРОГРЕС ===
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'not_started',
        // not_started, in_progress, completed
      },
      progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        // 0-100%
      },
      watchedSeconds: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'watched_seconds',
      },
      lastWatchedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_watched_at',
      },

      // === ЗАВЪРШВАНЕ ===
      isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_completed',
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'completed_at',
      },

      // === ТЕСТ ===
      testAttempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'test_attempts',
      },
      testScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'test_score',
      },
      testPassed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'test_passed',
      },
      testCompletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'test_completed_at',
      },

      // === КРЕДИТИ ===
      earnedCredits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'earned_credits',
      },

      // === БЕЛЕЖКИ ===
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'student_lesson',
      tableName: 'student_lessons',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['student_id', 'lesson_id'],
        },
      ],
    }
  );

  return student_lesson;
};