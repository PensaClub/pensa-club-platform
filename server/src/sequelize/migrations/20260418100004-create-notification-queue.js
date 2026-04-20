'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notification_queue', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      reference_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      reference_title: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      reference_slug: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('notification_queue', ['status']);
    await queryInterface.addIndex('notification_queue', ['type']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notification_queue');
  },
};
