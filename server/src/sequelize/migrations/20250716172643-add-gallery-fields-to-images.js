'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('images', 'name', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.addColumn('images', 'size', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });

        await queryInterface.addColumn('images', 'type', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('images', 'name');
        await queryInterface.removeColumn('images', 'size');
        await queryInterface.removeColumn('images', 'type');
    },
};
