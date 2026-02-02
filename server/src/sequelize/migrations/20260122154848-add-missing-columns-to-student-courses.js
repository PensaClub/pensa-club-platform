// migrations/XXXXXX-add-missing-columns-to-student-courses.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверяваме и добавяме само липсващите колони
    const table = await queryInterface.describeTable('student_courses');
    
    if (!table.last_accessed_at) {
      await queryInterface.addColumn('student_courses', 'last_accessed_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });
    }
    
    if (!table.enrolled_at) {
      await queryInterface.addColumn('student_courses', 'enrolled_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
    }
    
    if (!table.completed_at) {
      await queryInterface.addColumn('student_courses', 'completed_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });
    }
    
    if (!table.current_lesson_id) {
      await queryInterface.addColumn('student_courses', 'current_lesson_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'lessons',
          key: 'id',
        },
        onDelete: 'SET NULL',
      });
    }
    
    if (!table.progress_percentage) {
      await queryInterface.addColumn('student_courses', 'progress_percentage', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
    
    if (!table.total_credits_earned) {
      await queryInterface.addColumn('student_courses', 'total_credits_earned', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('student_courses', 'last_accessed_at');
    await queryInterface.removeColumn('student_courses', 'enrolled_at');
    await queryInterface.removeColumn('student_courses', 'completed_at');
    await queryInterface.removeColumn('student_courses', 'current_lesson_id');
    await queryInterface.removeColumn('student_courses', 'progress_percentage');
    await queryInterface.removeColumn('student_courses', 'total_credits_earned');
  }
};