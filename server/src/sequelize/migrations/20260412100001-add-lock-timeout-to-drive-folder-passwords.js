'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('drive_folder_passwords', 'lock_timeout', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'Auto-lock timeout in minutes (null = no auto-lock, 5/10/15/30)',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('drive_folder_passwords', 'lock_timeout');
  },
};
