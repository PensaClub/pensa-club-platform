'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_accounts', 'reset_sms_code_hash', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('user_accounts', 'reset_sms_attempts', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('user_accounts', 'reset_sms_code_hash');
    await queryInterface.removeColumn('user_accounts', 'reset_sms_attempts');
  },
};
