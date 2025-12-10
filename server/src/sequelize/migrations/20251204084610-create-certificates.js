// server/src/sequelize/migrations/XXXXXX-create-certificates.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('certificates', {
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
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      issued_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user_accounts',
          key: 'id',
        },
      },

      // === УНИКАЛЕН НОМЕР ===
      certificate_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      // === ИНФОРМАЦИЯ ЗА СТУДЕНТА ===
      student_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      // === ИНФОРМАЦИЯ ЗА КУРСА ===
      course_title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      course_category: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // === РЕЗУЛТАТИ ===
      completion_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      final_score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      total_credits_earned: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_hours_completed: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      // === ФАЙЛ ===
      pdf_url: {
        type: Sequelize.STRING(2048),
        allowNull: true,
      },

      // === ВАЛИДАЦИЯ ===
      validation_code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      valid_until: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      // === СТАТУС ===
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'active',
      },
      revoked_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      revoked_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      // === МЕТА ===
      additional_info: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      issued_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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

    await queryInterface.addIndex('certificates', ['student_id']);
    await queryInterface.addIndex('certificates', ['course_id']);
    await queryInterface.addIndex('certificates', ['certificate_number']);
    await queryInterface.addIndex('certificates', ['validation_code']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('certificates');
  },
};