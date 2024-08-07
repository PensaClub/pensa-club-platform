'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_suggests', 'comments', {
      type: Sequelize.DataTypes.JSONB,
      defaultValue: [],
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user_suggests', 'comments');
  },
};
