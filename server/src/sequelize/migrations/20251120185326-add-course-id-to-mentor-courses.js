'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('mentor_courses', 'course_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: {
        model: 'courses',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('mentor_courses', ['course_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('mentor_courses', ['course_id']);
    await queryInterface.removeColumn('mentor_courses', 'course_id');
  },
};