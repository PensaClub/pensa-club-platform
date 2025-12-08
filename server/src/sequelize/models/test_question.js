// server/src/sequelize/models/test_question.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class test_question extends Model {
    static associate(models) {
      // Belongs to test
      test_question.belongsTo(models.lesson_test, {
        foreignKey: 'testId',
        targetKey: 'id',
        as: 'test',
      });
      
      // Has many answers (от test_answers таблицата)
      test_question.hasMany(models.test_answer, {
        foreignKey: 'questionId',
        sourceKey: 'id',
        as: 'answerOptions',  // <-- ПРЕИМЕНУВАНО от 'answers'
      });

      // Has many attempt answers
      test_question.hasMany(models.test_attempt_answer, {
        foreignKey: 'questionId',
        sourceKey: 'id',
        as: 'attemptAnswers',
      });
    }
  }

  test_question.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
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

      // === ВЪПРОС ===
      questionText: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'question_text',
      },

      questionType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'single',
        field: 'question_type',
      },

      // === DEPRECATED - ще се използва test_answers таблицата ===
      // Оставяме го за backwards compatibility
      answers: {
        type: DataTypes.JSONB,
        allowNull: true,  // <-- Сменено на true
        defaultValue: [],
      },

      correctAnswer: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'correct_answer',
      },

      explanation: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      imageUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        field: 'image_url',
      },

      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'sort_order',
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
      },
    },
    {
      sequelize,
      modelName: 'test_question',
      tableName: 'test_questions',
      timestamps: true,
      underscored: true,
    }
  );

  return test_question;
};