// server/src/sequelize/migrations/20260208130000-add-require-completion-to-lesson-tests.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('lesson_tests', 'require_course_completion', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('lesson_tests', 'require_course_completion');
  },
};