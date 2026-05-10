'use strict';

// Adds:
//   cleanupHour          — 0..23, default 3 (so existing rows keep 03:00)
//   notificationEmails   — JSONB array of recipient emails (per-bot)
//                          When empty/null the engine falls back to env var
//                          CRAWLER_DEFAULT_NOTIFICATION_EMAILS.

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('crawler_bots', 'cleanupHour', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 3,
        });
        await queryInterface.addColumn('crawler_bots', 'notificationEmails', {
            type: Sequelize.JSONB,
            allowNull: true,
            defaultValue: null,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('crawler_bots', 'notificationEmails');
        await queryInterface.removeColumn('crawler_bots', 'cleanupHour');
    },
};
