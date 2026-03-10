'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('whitelisted_ips', {
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
      label: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      is_system: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      added_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'user_accounts', key: 'id' },
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // Seed the system IPs
    await queryInterface.bulkInsert('whitelisted_ips', [
      { ip_address: '78.154.13.95', label: 'Admin IP', is_system: true, created_at: new Date() },
      { ip_address: '127.0.0.1', label: 'Localhost IPv4', is_system: true, created_at: new Date() },
      { ip_address: '::1', label: 'Localhost IPv6', is_system: true, created_at: new Date() },
      { ip_address: '185.123.188.236', label: 'VPS public IP', is_system: true, created_at: new Date() },
      { ip_address: '172.17.0.1', label: 'Docker bridge gateway', is_system: true, created_at: new Date() },
      { ip_address: '172.18.0.1', label: 'dlwb_default gateway', is_system: true, created_at: new Date() },
      { ip_address: '172.19.0.1', label: 'nginx-proxy gateway', is_system: true, created_at: new Date() },
      { ip_address: '172.19.0.4', label: 'NPM container', is_system: true, created_at: new Date() },
      { ip_address: '172.19.0.3', label: 'Client container', is_system: true, created_at: new Date() },
      { ip_address: '172.19.0.2', label: 'Server container', is_system: true, created_at: new Date() },
      { ip_address: '172.18.0.2', label: 'DB container', is_system: true, created_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('whitelisted_ips');
  },
};
