// server/src/sequelize/models/test_question.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class test_question extends Model {
    static associate(models) {
      // Belongs to lesson test
      test_question.belongsTo(models.lesson_test, {
        foreignKey: 'testId',
        targetKey: 'id',
        as: 'test',
      });

      // Belongs to lecture test (НОВО)
      test_question.belongsTo(models.lecture_test, {
        foreignKey: 'lectureTestId',
        targetKey: 'id',
        as: 'lectureTest',
      });
      
      // Has many answers
      test_question.hasMany(models.test_answer, {
        foreignKey: 'questionId',
        sourceKey: 'id',
        as: 'answerOptions',
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
        allowNull: true, // ✅ Сега е nullable
        field: 'test_id',
        references: {
          model: 'lesson_tests',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      lectureTestId: {
        type: DataTypes.INTEGER,
        allowNull: true, // ✅ НОВО поле
        field: 'lecture_test_id',
        references: {
          model: 'lecture_tests',
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

      // === DEPRECATED - използва се test_answers таблицата ===
      answers: {
        type: DataTypes.JSONB,
        allowNull: true,
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