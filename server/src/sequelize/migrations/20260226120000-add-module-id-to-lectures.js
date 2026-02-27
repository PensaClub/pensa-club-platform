'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('lectures', 'module_id', { // НОВО
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: {
        model: 'course_modules',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('lectures', ['module_id'], { // НОВО
      name: 'idx_lectures_module_id',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('lectures', 'idx_lectures_module_id');
    await queryInterface.removeColumn('lectures', 'module_id');
  },
};