'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lecture_tests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      lecture_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'lectures',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user_accounts',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
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
      instructions: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      // === ТИП НА ТЕСТА ===
      test_type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'quiz',
        // quiz, exam, practice, survey
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
        // null = неограничено
      },
      time_limit_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        // null = без ограничение
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
      show_score: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      allow_review: {
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
      credits_for_passing: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      // === СТАТУС ===
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'draft',
        // draft, active, archived
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      // === СТАТИСТИКИ ===
      total_questions: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_points: {
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

      // === TIMESTAMPS ===
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

    // Индекси
    await queryInterface.addIndex('lecture_tests', ['lecture_id']);
    await queryInterface.addIndex('lecture_tests', ['created_by']);
    await queryInterface.addIndex('lecture_tests', ['is_published']);
    await queryInterface.addIndex('lecture_tests', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('lecture_tests');
  },
};