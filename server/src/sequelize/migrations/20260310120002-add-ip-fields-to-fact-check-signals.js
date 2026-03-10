'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('fact_check_signals', 'ip_address', {
      type: Sequelize.STRING(45),
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn('fact_check_signals', 'user_agent', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('fact_check_signals', 'user_agent');
    await queryInterface.removeColumn('fact_check_signals', 'ip_address');
  },
};
