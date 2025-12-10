// server/src/sequelize/migrations/XXXXXX-add-mentor-to-lessons.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('lessons', 'mentor_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'mentors',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('lessons', ['mentor_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('lessons', 'mentor_id');
  },
};