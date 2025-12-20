// server/src/sequelize/migrations/20251215200000-make-test-id-nullable-in-questions.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Направи test_id nullable за да поддържа lecture_test_id
    await queryInterface.changeColumn('test_questions', 'test_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('test_questions', 'test_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};