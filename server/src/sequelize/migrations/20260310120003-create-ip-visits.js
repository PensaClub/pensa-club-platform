'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ip_visits', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: false,
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      path: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      visit_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      last_visited_at: {
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

    await queryInterface.addIndex('ip_visits', ['ip_address'], { name: 'idx_ip_visits_ip' });
    await queryInterface.addIndex('ip_visits', ['last_visited_at'], { name: 'idx_ip_visits_last_visited' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ip_visits');
  },
};
