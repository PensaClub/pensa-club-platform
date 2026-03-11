'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('projects', 'useful_links', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('projects', 'useful_links');
  },
};
