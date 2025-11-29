// server/sequelize/migrations/XXXXXX-add-category-to-notes.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add category to admin_student_notes
    await queryInterface.addColumn('admin_student_notes', 'category', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'general'
    });

    // Add category to mentor_notes
    await queryInterface.addColumn('mentor_notes', 'category', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'general'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('admin_student_notes', 'category');
    await queryInterface.removeColumn('mentor_notes', 'category');
  }
};