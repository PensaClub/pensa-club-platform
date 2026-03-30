'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('push_subscriptions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'user_accounts', key: 'id' },
        onDelete: 'CASCADE',
      },
      endpoint: { type: Sequelize.TEXT, allowNull: false },
      keys_p256dh: { type: Sequelize.TEXT, allowNull: false },
      keys_auth: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.addIndex('push_subscriptions', ['user_id']);
    await queryInterface.addIndex('push_subscriptions', ['endpoint'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('push_subscriptions');
  },
};
