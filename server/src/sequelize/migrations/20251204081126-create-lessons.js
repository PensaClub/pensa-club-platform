// server/src/sequelize/migrations/XXXXXX-create-lessons.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lessons', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      module_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'course_modules',
          key: 'id',
        },
        onDelete: 'SET NULL',
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
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      // === ПОДРЕДБА ===
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      // === ТИП И ФОРМАТ ===
      lesson_type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'video',
      },

      // === ВИДЕО НАСТРОЙКИ ===
      video_provider: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      video_url: {
        type: Sequelize.STRING(2048),
        allowNull: true,
      },
      live_stream_url: {
        type: Sequelize.STRING(2048),
        allowNull: true,
      },
      thumbnail_url: {
        type: Sequelize.STRING(2048),
        allowNull: true,
      },

      // === ВРЕМЕВИ НАСТРОЙКИ ===
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      scheduled_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      // === КРЕДИТИ ===
      max_credits: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      credits_for_completion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      credits_for_test: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      // === ТЕСТ НАСТРОЙКИ ===
      has_test: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      test_passing_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      // === ИЗИСКВАНИЯ ===
      requires_completion: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      prerequisite_lesson_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
      published_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      // === ДОСТЪП ===
      is_free: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      // === СТАТИСТИКИ ===
      views_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      completed_count: {
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

    // Unique slug per course
    await queryInterface.addIndex('lessons', ['course_id', 'slug'], {
      unique: true,
    });

    // Index за бързо търсене
    await queryInterface.addIndex('lessons', ['course_id']);
    await queryInterface.addIndex('lessons', ['module_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('lessons');
  },
};