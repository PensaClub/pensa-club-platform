'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('clubs', 'owner', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.addIndex('clubs', ['owner']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('clubs', ['owner']);
        await queryInterface.removeColumn('clubs', 'owner');
    },
};
