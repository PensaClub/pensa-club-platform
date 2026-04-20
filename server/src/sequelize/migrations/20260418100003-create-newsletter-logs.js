'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('newsletter_logs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      newsletter_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'newsletters', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      subscriber_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'subscribers', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      channel: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'email',
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      sent_at: {
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

    await queryInterface.addIndex('newsletter_logs', ['newsletter_id']);
    await queryInterface.addIndex('newsletter_logs', ['subscriber_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('newsletter_logs');
  },
};
