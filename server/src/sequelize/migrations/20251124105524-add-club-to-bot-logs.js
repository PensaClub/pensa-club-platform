'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Обновяване на ENUM за content_type
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_bot_logs_content_type" ADD VALUE IF NOT EXISTS 'club';
    `);

    // Добавяне на club_id
    await queryInterface.addColumn('bot_logs', 'club_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'clubs',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Добавяне на club_slug
    await queryInterface.addColumn('bot_logs', 'club_slug', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Добавяне на индекс
    await queryInterface.addIndex('bot_logs', ['club_id'], {
      name: 'idx_club_id'
    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('bot_logs', 'idx_club_id');
    await queryInterface.removeColumn('bot_logs', 'club_slug');
    await queryInterface.removeColumn('bot_logs', 'club_id');
    
  }
};