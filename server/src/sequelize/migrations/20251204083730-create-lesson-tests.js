// server/src/sequelize/migrations/XXXXXX-create-lesson-tests.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lesson_tests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      lesson_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'lessons',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user_accounts',
          key: 'id',
        },
      },

      // === ОСНОВНА ИНФОРМАЦИЯ ===
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      // === НАСТРОЙКИ НА ТЕСТА ===
      passing_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 70,
      },
      max_attempts: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      time_limit_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      shuffle_questions: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      shuffle_answers: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      show_correct_answers: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      // === КРЕДИТИ ===
      max_credits: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      // === СТАТУС ===
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'draft',
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      // === СТАТИСТИКИ ===
      questions_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      attempts_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      average_score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      pass_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
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

    await queryInterface.addIndex('lesson_tests', ['lesson_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('lesson_tests');
  },
};