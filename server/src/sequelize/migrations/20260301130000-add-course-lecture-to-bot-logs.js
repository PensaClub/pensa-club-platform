'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Добавяне на нови колони
    await queryInterface.addColumn('bot_logs', 'course_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('bot_logs', 'course_slug', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('bot_logs', 'lecture_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('bot_logs', 'lecture_slug', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 2. Обновяване на ENUM content_type (PostgreSQL)
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_bot_logs_content_type" ADD VALUE IF NOT EXISTS 'course';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_bot_logs_content_type" ADD VALUE IF NOT EXISTS 'lecture';
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('bot_logs', 'course_id');
    await queryInterface.removeColumn('bot_logs', 'course_slug');
    await queryInterface.removeColumn('bot_logs', 'lecture_id');
    await queryInterface.removeColumn('bot_logs', 'lecture_slug');

    // Забележка: PostgreSQL не поддържа премахване на стойности от ENUM
    // course и lecture ще останат в ENUM-а при rollback
  }
};
