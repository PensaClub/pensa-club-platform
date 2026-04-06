'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('seminar_guest_attendances', 'converted_to_user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'user_accounts', key: 'id' },
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('seminar_guest_attendances', 'converted_to_user_id');
  },
};
