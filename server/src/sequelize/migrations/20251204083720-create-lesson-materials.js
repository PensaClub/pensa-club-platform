// server/src/sequelize/migrations/XXXXXX-create-lesson-materials.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lesson_materials', {
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
      uploaded_by: {
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

      // === ТИП НА МАТЕРИАЛА ===
      material_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      // === ФАЙЛ ===
      file_url: {
        type: Sequelize.STRING(2048),
        allowNull: true,
      },
      original_file_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      mime_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // === ВЪНШЕН ЛИНК ===
      external_url: {
        type: Sequelize.STRING(2048),
        allowNull: true,
      },

      // === ПОДРЕДБА И ДОСТЪП ===
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_downloadable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      // === СТАТУС ===
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'active',
      },

      // === СТАТИСТИКИ ===
      views_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      downloads_count: {
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

    await queryInterface.addIndex('lesson_materials', ['lesson_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('lesson_materials');
  },
};