// server/src/sequelize/models/test_attempt_answer.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class test_attempt_answer extends Model {
    static associate(models) {
      // Belongs to attempt
      test_attempt_answer.belongsTo(models.student_test_attempt, {
        foreignKey: 'attemptId',
        targetKey: 'id',
        as: 'attempt',
      });

      // Belongs to question
      test_attempt_answer.belongsTo(models.test_question, {
        foreignKey: 'questionId',
        targetKey: 'id',
        as: 'question',
      });

      // Belongs to selected answer (може да е null за text въпроси)
      test_attempt_answer.belongsTo(models.test_answer, {
        foreignKey: 'answerId',
        targetKey: 'id',
        as: 'selectedAnswer',
      });
    }
  }

  test_attempt_answer.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      attemptId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'attempt_id',
        references: {
          model: 'student_test_attempts',
          key: 'id',
        },
        onDelete: 'CASCADE',
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
      answerId: {
        type: DataTypes.INTEGER,
        allowNull: true, // null за text въпроси
        field: 'answer_id',
        references: {
          model: 'test_answers',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },

      // === ОТГОВОР ===
      
      // textAnswer: За text въпроси - свободен текст отговор
      textAnswer: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'text_answer',
      },

      // isCorrect: Дали отговорът е верен (изчислява се при submit)
      isCorrect: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'is_correct',
      },

      // pointsEarned: Точки за този отговор
      pointsEarned: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: 'points_earned',
      },

      // answeredAt: Кога е отговорено
      answeredAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'answered_at',
      },
    },
    {
      sequelize,
      modelName: 'test_attempt_answer',
      tableName: 'test_attempt_answers',
      timestamps: true,
      underscored: true,
    }
  );

  return test_attempt_answer;
};