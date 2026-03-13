'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('club_visit_requests', 'reported_problem', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn('club_visit_requests', 'reported_problem_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('club_visit_requests', 'reported_problem');
    await queryInterface.removeColumn('club_visit_requests', 'reported_problem_at');
  },
};
