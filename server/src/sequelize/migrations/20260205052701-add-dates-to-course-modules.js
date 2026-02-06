// server/src/sequelize/migrations/20260204120000-add-dates-to-course-modules.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('course_modules');

    if (!table.start_date) {
      await queryInterface.addColumn('course_modules', 'start_date', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!table.end_date) {
      await queryInterface.addColumn('course_modules', 'end_date', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!table.estimated_hours) {
      await queryInterface.addColumn('course_modules', 'estimated_hours', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('course_modules', 'start_date');
    await queryInterface.removeColumn('course_modules', 'end_date');
    await queryInterface.removeColumn('course_modules', 'estimated_hours');
  },
};