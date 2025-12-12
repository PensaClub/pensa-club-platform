'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Добави lecture_test_id към test_questions
    await queryInterface.addColumn('test_questions', 'lecture_test_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'lecture_tests',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Добави lecture_test_id към student_test_attempts
    await queryInterface.addColumn('student_test_attempts', 'lecture_test_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'lecture_tests',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Индекси
    await queryInterface.addIndex('test_questions', ['lecture_test_id']);
    await queryInterface.addIndex('student_test_attempts', ['lecture_test_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('test_questions', 'lecture_test_id');
    await queryInterface.removeColumn('student_test_attempts', 'lecture_test_id');
  },
};