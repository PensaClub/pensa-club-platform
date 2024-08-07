'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.addConstraint('user_details', {
      fields: ['username'],
      type: 'unique',
      name: 'unique_username_constraint'
    });
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.removeConstraint('user_details', 'unique_username_constraint');
  },
};