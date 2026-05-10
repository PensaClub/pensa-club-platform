'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('crawler_sources', 'maxPages', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
            // 1 = single page (default). > 1 = follow pagination by appending
            // ?page=N or &page=N until maxPages OR all items already seen
            // OR all items older than the bot's lookBackDays cutoff.
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('crawler_sources', 'maxPages');
    },
};
