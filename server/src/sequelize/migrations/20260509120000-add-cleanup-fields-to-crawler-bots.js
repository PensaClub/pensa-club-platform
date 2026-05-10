'use strict';

// Per-bot auto-cleanup settings. The default values mirror the original
// global behaviour (daily, 100 oldest) so existing rows continue working
// without a UI change. Admin can toggle/tune per bot from BotEditModal.

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('crawler_bots', 'cleanupEnabled', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        });
        await queryInterface.addColumn('crawler_bots', 'cleanupDay', {
            type: Sequelize.STRING(10),
            allowNull: false,
            defaultValue: 'daily',
            // Allowed: 'daily' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
        });
        await queryInterface.addColumn('crawler_bots', 'cleanupBatchSize', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 100,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('crawler_bots', 'cleanupBatchSize');
        await queryInterface.removeColumn('crawler_bots', 'cleanupDay');
        await queryInterface.removeColumn('crawler_bots', 'cleanupEnabled');
    },
};
