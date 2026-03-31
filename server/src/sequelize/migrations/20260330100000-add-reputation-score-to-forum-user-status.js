'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('forum_user_statuses', 'reputation_score', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addIndex('forum_user_statuses', ['reputation_score'], {
      name: 'forum_user_statuses_reputation_score_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('forum_user_statuses', 'forum_user_statuses_reputation_score_idx');
    await queryInterface.removeColumn('forum_user_statuses', 'reputation_score');
  },
};
