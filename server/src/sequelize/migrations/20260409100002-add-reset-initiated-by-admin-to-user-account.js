'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_accounts', 'reset_initiated_by_admin_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'user_accounts', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('user_accounts', 'reset_initiated_by_admin_id');
  },
};
