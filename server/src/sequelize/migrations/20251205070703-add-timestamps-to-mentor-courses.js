'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('mentor_courses');
    
    if (!tableInfo.created_at) {
      await queryInterface.addColumn('mentor_courses', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
    }
    
    if (!tableInfo.updated_at) {
      await queryInterface.addColumn('mentor_courses', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('mentor_courses', 'created_at');
    await queryInterface.removeColumn('mentor_courses', 'updated_at');
  },
};