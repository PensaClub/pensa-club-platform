// server/src/sequelize/migrations/20260204120001-add-end-date-to-lessons.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('lessons');

    if (!table.end_date) {
      await queryInterface.addColumn('lessons', 'end_date', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('lessons', 'end_date');
  },
};