'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('bot_logs', 'country', {
            type: Sequelize.STRING(2),
            allowNull: true,
            comment: 'ISO Country code (BG, DE, US, etc.)'
        });

        await queryInterface.addColumn('bot_logs', 'city', {
            type: Sequelize.STRING(100),
            allowNull: true,
            comment: 'City name'
        });

        await queryInterface.addColumn('bot_logs', 'region', {
            type: Sequelize.STRING(100),
            allowNull: true,
            comment: 'Region/State'
        });

        await queryInterface.addIndex('bot_logs', ['country'], {
            name: 'idx_bot_logs_country'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex('bot_logs', 'idx_bot_logs_country');
        await queryInterface.removeColumn('bot_logs', 'region');
        await queryInterface.removeColumn('bot_logs', 'city');
        await queryInterface.removeColumn('bot_logs', 'country');
    }
};