'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('user_accounts');
        if (!table.is_google_user) {
            await queryInterface.addColumn('user_accounts', 'is_google_user', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            });
        } else {
            console.log('Column "is_google_user" already exists in "user_accounts". Skipping addColumn.');
        }

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

        const table = await queryInterface.describeTable('user_accounts');
        if (table.is_google_user) {
            await queryInterface.removeColumn('user_accounts', 'is_google_user');
        }
    },
};
