'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Добави lecture_id колона
    await queryInterface.addColumn('lesson_tests', 'lecture_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'lectures',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Направи lesson_id nullable
    await queryInterface.changeColumn('lesson_tests', 'lesson_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'lessons',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });

    // Индекс
    await queryInterface.addIndex('lesson_tests', ['lecture_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('lesson_tests', 'lecture_id');
    
    await queryInterface.changeColumn('lesson_tests', 'lesson_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'lessons',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
  },
};