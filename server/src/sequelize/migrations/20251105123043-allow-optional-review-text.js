'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('reviews', 'text', {
      type: Sequelize.TEXT,
      allowNull: true,  
      defaultValue: ''
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('reviews', 'text', {
      type: Sequelize.TEXT,
      allowNull: false
    });
  }
};