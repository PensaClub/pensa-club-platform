// server/src/sequelize/migrations/XXXXXXXX-add-lecture-test-id-to-questions.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Добави lecture_test_id колона
    await queryInterface.addColumn('test_questions', 'lecture_test_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'lecture_tests',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });

    // Направи test_id nullable (защото въпросът може да е към lecture_test вместо lesson_test)
    await queryInterface.changeColumn('test_questions', 'test_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'lesson_tests',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });

    // Добави индекс
    await queryInterface.addIndex('test_questions', ['lecture_test_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('test_questions', 'lecture_test_id');
    
    await queryInterface.changeColumn('test_questions', 'test_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'lesson_tests',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
  },
};