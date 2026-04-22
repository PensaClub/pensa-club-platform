'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cron_settings', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      key: {
        type: Sequelize.STRING(80),
        allowNull: false,
        unique: true,
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      schedule: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      timezone: {
        type: Sequelize.STRING(60),
        allowNull: false,
        defaultValue: 'Europe/Sofia',
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      last_run_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_run_status: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      last_run_subscribers: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      last_run_duration_ms: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      last_run_error: {
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

    await queryInterface.addIndex('cron_settings', ['key'], {
      name: 'idx_cron_settings_key',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('cron_settings');
  },
};
