'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('lesson_tests');

    if (!table.course_id) {
      await queryInterface.addColumn('lesson_tests', 'course_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'courses',
          key: 'id',
        },
        onDelete: 'SET NULL',
      });
      await queryInterface.addIndex('lesson_tests', ['course_id']);
    }

    if (!table.seminar_id) {
      await queryInterface.addColumn('lesson_tests', 'seminar_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'seminars',
          key: 'id',
        },
        onDelete: 'SET NULL',
      });
      await queryInterface.addIndex('lesson_tests', ['seminar_id']);
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('lesson_tests', 'course_id');
    await queryInterface.removeColumn('lesson_tests', 'seminar_id');
  },
};