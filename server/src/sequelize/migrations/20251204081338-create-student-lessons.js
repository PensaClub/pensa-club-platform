// server/src/sequelize/migrations/XXXXXX-create-student-lessons.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student_lessons', {
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
      lesson_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'lessons',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      // === ПРОГРЕС ===
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'not_started',
      },
      progress: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      watched_seconds: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      last_watched_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      // === ЗАВЪРШВАНЕ ===
      is_completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      // === ТЕСТ ===
      test_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      test_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      test_passed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      test_completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      // === КРЕДИТИ ===
      earned_credits: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      // === БЕЛЕЖКИ ===
      notes: {
        type: Sequelize.TEXT,
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

    // Unique: един студент - един урок
    await queryInterface.addIndex('student_lessons', ['student_id', 'lesson_id'], {
      unique: true,
    });

    // Indexes за бързо търсене
    await queryInterface.addIndex('student_lessons', ['student_id']);
    await queryInterface.addIndex('student_lessons', ['lesson_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('student_lessons');
  },
};