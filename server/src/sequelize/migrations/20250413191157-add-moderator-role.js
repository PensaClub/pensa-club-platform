'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('user_accounts', 'role', {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'user',
            validate: {
                isIn: {
                    args: [['admin', 'moderator', 'user', 'guest']],
                    msg: 'Role must be one of the following: admin, moderator, user or guest.',
                },
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('user_accounts', 'role', {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'user',
            validate: {
                isIn: {
                    args: [['admin', 'user', 'guest']],
                    msg: 'Role must be one of the following: admin, user or guest.',
                },
            },
        });
    },
};
