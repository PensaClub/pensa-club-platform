// server/src/sequelize/migrations/XXXXXX-create-student-test-attempts.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student_test_attempts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id',
        },
        onDelete: 'CASCADE',
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

      // === ОПИТ ===
      attempt_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      // === ВРЕМЕ ===
      started_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      time_spent_seconds: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      // === РЕЗУЛТАТИ ===
      answers: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      correct_answers: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      total_questions: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      points_earned: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      max_points: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      // === СТАТУС ===
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'in_progress',
      },
      is_passed: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },

      // === КРЕДИТИ ===
      earned_credits: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addIndex('student_test_attempts', ['student_id']);
    await queryInterface.addIndex('student_test_attempts', ['test_id']);
    await queryInterface.addIndex('student_test_attempts', ['student_id', 'test_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('student_test_attempts');
  },
};