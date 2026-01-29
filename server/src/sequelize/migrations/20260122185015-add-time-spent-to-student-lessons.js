'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('student_lessons');
    
    if (!table.time_spent_minutes) {
      await queryInterface.addColumn('student_lessons', 'time_spent_minutes', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('student_lessons', 'time_spent_minutes');
  }
};