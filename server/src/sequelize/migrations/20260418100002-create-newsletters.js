'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('newsletters', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'manual',
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'draft',
      },
      target_categories: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      sent_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      failed_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'user_accounts', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      platform_updates: {
        type: Sequelize.TEXT,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('newsletters');
  },
};
