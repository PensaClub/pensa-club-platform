'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('seminar_sessions', 'cancelled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('seminar_sessions', 'cancel_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('seminar_sessions', 'cancelled_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'user_accounts', key: 'id' },
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('seminar_sessions', 'cancelled_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('seminar_sessions', 'cancelled');
    await queryInterface.removeColumn('seminar_sessions', 'cancel_reason');
    await queryInterface.removeColumn('seminar_sessions', 'cancelled_by');
    await queryInterface.removeColumn('seminar_sessions', 'cancelled_at');
  },
};
