'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('newsletter_logs', 'target_url', {
      type: Sequelize.STRING(2048),
      allowNull: true,
    });
    await queryInterface.addIndex('newsletter_logs', ['newsletter_id', 'status'], {
      name: 'idx_newsletter_logs_newsletter_status',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('newsletter_logs', 'idx_newsletter_logs_newsletter_status');
    await queryInterface.removeColumn('newsletter_logs', 'target_url');
  },
};
