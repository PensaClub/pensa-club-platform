'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('student_seminars', 'participation_level', {
      type: Sequelize.STRING(20),
      allowNull: true,
      defaultValue: null,
      comment: 'active, moderate, passive',
    });
    await queryInterface.addColumn('student_seminars', 'approved_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: { model: 'user_accounts', key: 'id' },
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('student_seminars', 'approved_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('student_seminars', 'participation_level');
    await queryInterface.removeColumn('student_seminars', 'approved_by');
    await queryInterface.removeColumn('student_seminars', 'approved_at');
  }
};