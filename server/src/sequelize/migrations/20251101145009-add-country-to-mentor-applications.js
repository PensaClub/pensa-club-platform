'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('mentor_applications', 'country', {
      type: Sequelize.STRING(2),
      allowNull: true,
      defaultValue: 'BG',
      comment: 'ISO 3166-1 alpha-2 country code (BG, DE, AT, etc.)'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('mentor_applications', 'country');
  },
};