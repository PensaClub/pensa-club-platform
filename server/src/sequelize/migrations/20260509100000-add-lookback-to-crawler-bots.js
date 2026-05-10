'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('crawler_bots', 'lookBackDays', {
            type: Sequelize.INTEGER,
            allowNull: true,
            // null = no limit, otherwise drop items older than now - N days
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('crawler_bots', 'lookBackDays');
    },
};
