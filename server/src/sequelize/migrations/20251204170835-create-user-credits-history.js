'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_credits_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user_accounts',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      credits_amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      credits_before: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      credits_after: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      source_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      source_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      source_title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
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

    // Indexes
    await queryInterface.addIndex('user_credits_history', ['user_id']);
    await queryInterface.addIndex('user_credits_history', ['source_type']);
    await queryInterface.addIndex('user_credits_history', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_credits_history');
  },
};