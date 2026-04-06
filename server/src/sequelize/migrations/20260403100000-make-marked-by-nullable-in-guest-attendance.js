'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('seminar_guest_attendances', 'marked_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('seminar_guest_attendances', 'marked_by', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
