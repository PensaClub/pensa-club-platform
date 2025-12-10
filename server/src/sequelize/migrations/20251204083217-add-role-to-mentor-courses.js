// server/src/sequelize/migrations/XXXXXX-add-role-to-mentor-courses.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('mentor_courses', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'mentor',
    });

    await queryInterface.addColumn('mentor_courses', 'is_lead', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('mentor_courses', 'role');
    await queryInterface.removeColumn('mentor_courses', 'is_lead');
  },
};