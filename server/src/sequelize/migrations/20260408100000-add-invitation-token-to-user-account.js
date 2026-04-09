'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_accounts', 'invitation_token', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('user_accounts', 'invitation_expiration', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('user_accounts', 'invitation_token');
    await queryInterface.removeColumn('user_accounts', 'invitation_expiration');
  },
};
