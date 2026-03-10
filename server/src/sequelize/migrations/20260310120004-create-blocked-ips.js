'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blocked_ips', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: false,
        unique: true,
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      blocked_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'user_accounts',
          key: 'id',
        },
      },
      blocked_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('blocked_ips', ['ip_address'], { name: 'idx_blocked_ips_ip', unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('blocked_ips');
  },
};
