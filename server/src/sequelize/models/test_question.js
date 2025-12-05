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

      // questionType: Тип на въпроса
      // - 'single': Един верен отговор (radio buttons)
      // - 'multiple': Няколко верни отговора (checkboxes)
      // - 'true_false': Вярно/Невярно
      // - 'text': Свободен текст (ръчна проверка)
      questionType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'single',
        field: 'question_type',
      },

      // === ОТГОВОРИ ===
      // JSON масив с отговори
      // Формат: [{ id: 1, text: "Отговор 1", isCorrect: true }, ...]
      answers: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },

      // correctAnswer: За text въпроси - очакван отговор
      correctAnswer: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'correct_answer',
      },

      // === ДОПЪЛНИТЕЛНИ НАСТРОЙКИ ===
      
      // explanation: Обяснение след отговор
      explanation: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // imageUrl: Снимка към въпроса
      imageUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        field: 'image_url',
      },

      // points: Точки за този въпрос
      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      // sortOrder: Подредба
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'sort_order',
      },

      // === СТАТУС ===
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