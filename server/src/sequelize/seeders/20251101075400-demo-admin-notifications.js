'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admin_notifications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'mentor_application, mentor_approved, chat_request, etc.',
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      data: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'Additional data specific to notification type',
      },
      read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      read_at: {  // ✅ snake_case
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {  // ✅ ПРОМЕНЕНО: createdAt → created_at
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {  // ✅ ПРОМЕНЕНО: updatedAt → updated_at
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Indexes
    await queryInterface.addIndex('admin_notifications', ['type']);
    await queryInterface.addIndex('admin_notifications', ['read']);
    await queryInterface.addIndex('admin_notifications', ['created_at']);  // ✅ snake_case
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('admin_notifications');
  },
};