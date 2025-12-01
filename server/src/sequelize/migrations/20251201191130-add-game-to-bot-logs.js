'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Добави 'game' към ENUM типа
        await queryInterface.sequelize.query(`
            ALTER TYPE "enum_bot_logs_content_type" ADD VALUE IF NOT EXISTS 'game';
        `);

        // 2. Добави game_slug колона
        await queryInterface.addColumn('bot_logs', 'game_slug', {
            type: Sequelize.STRING,
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        // Премахни колоната (ENUM стойности не могат лесно да се махат в PostgreSQL)
        await queryInterface.removeColumn('bot_logs', 'game_slug');
    }
};