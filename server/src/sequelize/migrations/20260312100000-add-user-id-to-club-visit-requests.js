'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('club_visit_requests', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: {
        model: 'user_accounts',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('club_visit_requests', ['user_id'], {
      name: 'idx_club_visit_requests_user_id',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('club_visit_requests', 'idx_club_visit_requests_user_id');
    await queryInterface.removeColumn('club_visit_requests', 'user_id');
  },
};
