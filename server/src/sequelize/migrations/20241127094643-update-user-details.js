'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('user_details', 'municipality'),
      queryInterface.removeColumn('user_details', 'location'),
      queryInterface.removeColumn('user_details', 'street'),
      queryInterface.removeColumn('user_details', 'district'),
      queryInterface.removeColumn('user_details', 'block'),
      queryInterface.removeColumn('user_details', 'street_number'),
      queryInterface.removeColumn('user_details', 'settlement')
    ]);
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('user_details', 'municipality'),
      queryInterface.addColumn('user_details', 'location'),
      queryInterface.addColumn('user_details', 'street'),
      queryInterface.addColumn('user_details', 'district'),
      queryInterface.addColumn('user_details', 'block'),
      queryInterface.addColumn('user_details', 'street_number'),
      queryInterface.addColumn('user_details', 'settlement')
    ]);
  }
};
