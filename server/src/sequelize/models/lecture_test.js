// server/src/sequelize/models/lecture_test.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class lecture_test extends Model {
    static associate(models) {
      // Belongs to lecture
      lecture_test.belongsTo(models.lecture, {
        foreignKey: 'lectureId',
        targetKey: 'id',
        as: 'lecture',
      });

      // Has many questions (използва същата test_question таблица)
      lecture_test.hasMany(models.test_question, {
        foreignKey: 'lectureTestId',
        sourceKey: 'id',
        as: 'questions',
      });

      // Has many attempts (използва същата student_test_attempt таблица)
      lecture_test.hasMany(models.student_test_attempt, {
        foreignKey: 'lectureTestId',
        sourceKey: 'id',
        as: 'attempts',
      });

      // Belongs to creator
      lecture_test.belongsTo(models.user_account, {
        foreignKey: 'createdBy',
        targetKey: 'id',
        as: 'creator',
      });
    }
  }

  lecture_test.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      lectureId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'lecture_id',
        references: {
          model: 'lectures',
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
      instructions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // === ТИП НА ТЕСТА ===
      testType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'quiz',
        field: 'test_type',
        // quiz, exam, practice, survey
      },

      // === НАСТРОЙКИ НА ТЕСТА ===
      passingScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 70,
        field: 'passing_score',
      },
      maxAttempts: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'max_attempts',
      },
      timeLimitMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'time_limit_minutes',
      },
      shuffleQuestions: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'shuffle_questions',
      },
      shuffleAnswers: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'shuffle_answers',
      },
      showCorrectAnswers: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'show_correct_answers',
      },
      showScore: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'show_score',
      },
      allowReview: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'allow_review',
      },

      // === КРЕДИТИ ===
      maxCredits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'max_credits',
      },
      creditsForPassing: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'credits_for_passing',
      },

      // === СТАТУС ===
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'draft',
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_published',
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'published_at',
      },

      // === СТАТИСТИКИ ===
      totalQuestions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_questions',
      },
      totalPoints: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_points',
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
      modelName: 'lecture_test',
      tableName: 'lecture_tests',
      timestamps: true,
      underscored: true,
    }
  );

  return lecture_test;
};