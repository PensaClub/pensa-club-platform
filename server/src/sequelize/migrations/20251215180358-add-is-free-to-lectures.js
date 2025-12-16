// server/src/sequelize/migrations/XXXXXX-add-is-free-to-lectures.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('lectures', 'is_free', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('lectures', 'is_free');
  },
};