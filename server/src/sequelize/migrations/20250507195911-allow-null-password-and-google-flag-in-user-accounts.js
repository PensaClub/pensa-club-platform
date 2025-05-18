'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('user_accounts', 'is_google_user', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });

        await queryInterface.changeColumn('user_accounts', 'password', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('user_accounts', 'password', {
            type: Sequelize.STRING,
            allowNull: false,
        });

        await queryInterface.removeColumn('user_accounts', 'is_google_user');
    },
};
