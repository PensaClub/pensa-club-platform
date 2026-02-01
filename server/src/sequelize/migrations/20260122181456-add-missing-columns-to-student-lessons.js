'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('student_lessons');
    
    if (!table.last_accessed_at) {
      await queryInterface.addColumn('student_lessons', 'last_accessed_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('student_lessons', 'last_accessed_at');
  }
};