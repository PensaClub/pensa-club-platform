'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('notification_queue', 'category', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
    await queryInterface.addColumn('notification_queue', 'thumbnail', {
      type: Sequelize.STRING(2048),
      allowNull: true,
    });
    await queryInterface.addIndex('notification_queue', ['category']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('notification_queue', ['category']);
    await queryInterface.removeColumn('notification_queue', 'thumbnail');
    await queryInterface.removeColumn('notification_queue', 'category');
  },
};
