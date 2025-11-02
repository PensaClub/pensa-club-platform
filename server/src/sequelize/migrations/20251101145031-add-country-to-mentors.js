'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('mentors', 'country', {
      type: Sequelize.STRING(2),
      allowNull: true,
      defaultValue: 'BG',
      comment: 'ISO 3166-1 alpha-2 country code'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('mentors', 'country');
  },
};