// server/src/sequelize/migrations/XXXXXX-create-test-questions.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('test_questions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      test_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'lesson_tests',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      // === ВЪПРОС ===
      question_text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      question_type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'single',
      },

      // === ОТГОВОРИ ===
      answers: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      correct_answer: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      // === ДОПЪЛНИТЕЛНИ НАСТРОЙКИ ===
      explanation: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      image_url: {
        type: Sequelize.STRING(2048),
        allowNull: true,
      },
      points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      // === СТАТУС ===
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('test_questions', ['test_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('test_questions');
  },
};