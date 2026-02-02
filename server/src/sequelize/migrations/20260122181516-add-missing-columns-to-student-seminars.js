'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('student_seminars');
    
    if (!table.status) {
      await queryInterface.addColumn('student_seminars', 'status', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'registered',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('student_seminars', 'status');
  }
};