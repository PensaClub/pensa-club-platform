'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('user_details', 'username', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.changeColumn('user_details', 'region', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('user_details', 'username', {
            type: Sequelize.STRING,
            allowNull: false,
        });

        await queryInterface.changeColumn('user_details', 'region', {
            type: Sequelize.STRING,
            allowNull: false,
        });
    },
};
