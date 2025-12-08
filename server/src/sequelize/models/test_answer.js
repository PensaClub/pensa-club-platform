// server/src/sequelize/models/test_answer.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class test_answer extends Model {
    static associate(models) {
      // Belongs to question
      test_answer.belongsTo(models.test_question, {
        foreignKey: 'questionId',
        targetKey: 'id',
        as: 'question',
      });
    }
  }

  test_answer.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      questionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'question_id',
        references: {
          model: 'test_questions',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      // === ОТГОВОР ===
      answerText: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'answer_text',
      },

      // isCorrect: Дали е верен отговор
      isCorrect: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_correct',
      },

      // explanation: Обяснение защо е верен/грешен
      explanation: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // sortOrder: Подредба на отговорите
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'sort_order',
      },
    },
    {
      sequelize,
      modelName: 'test_answer',
      tableName: 'test_answers',
      timestamps: true,
      underscored: true,
    }
  );

  return test_answer;
};