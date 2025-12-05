// server/src/sequelize/models/lesson_test.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class lesson_test extends Model {
    static associate(models) {
      // Belongs to lesson
      lesson_test.belongsTo(models.lesson, {
        foreignKey: 'lessonId',
        targetKey: 'id',
        as: 'lesson',
      });

      // Has many questions
      lesson_test.hasMany(models.test_question, {
        foreignKey: 'testId',
        sourceKey: 'id',
        as: 'questions',
      });

      // Has many attempts
      lesson_test.hasMany(models.student_test_attempt, {
        foreignKey: 'testId',
        sourceKey: 'id',
        as: 'attempts',
      });

      // Belongs to creator
      lesson_test.belongsTo(models.user_account, {
        foreignKey: 'createdBy',
        targetKey: 'id',
        as: 'creator',
      });
    }
  }

  lesson_test.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
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
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'created_by',
        references: {
          model: 'user_accounts',
          key: 'id',
        },
      },

      // === ОСНОВНА ИНФОРМАЦИЯ ===
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // === НАСТРОЙКИ НА ТЕСТА ===
      
      // passingScore: Минимален % за преминаване (0-100)
      passingScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 70,
        field: 'passing_score',
      },

      // maxAttempts: Максимален брой опити (null = неограничено)
      maxAttempts: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'max_attempts',
      },

      // timeLimitMinutes: Време за решаване в минути (null = без ограничение)
      timeLimitMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'time_limit_minutes',
      },

      // shuffleQuestions: Дали въпросите да се разбъркват
      shuffleQuestions: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'shuffle_questions',
      },

      // shuffleAnswers: Дали отговорите да се разбъркват
      shuffleAnswers: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'shuffle_answers',
      },

      // showCorrectAnswers: Дали да показва верните отговори след теста
      showCorrectAnswers: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'show_correct_answers',
      },

      // === КРЕДИТИ ===
      maxCredits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'max_credits',
      },

      // === СТАТУС ===
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'draft',
        // draft, active, archived
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_published',
      },

      // === СТАТИСТИКИ ===
      questionsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'questions_count',
      },
      attemptsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'attempts_count',
      },
      averageScore: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'average_score',
      },
      passRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'pass_rate',
      },
    },
    {
      sequelize,
      modelName: 'lesson_test',
      tableName: 'lesson_tests',
      timestamps: true,
      underscored: true,
    }
  );

  return lesson_test;
};