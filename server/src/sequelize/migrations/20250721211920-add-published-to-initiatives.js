'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('initiatives', 'published_at', {
            type: Sequelize.DATE,
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('initiatives', 'published_at');
    },
};
