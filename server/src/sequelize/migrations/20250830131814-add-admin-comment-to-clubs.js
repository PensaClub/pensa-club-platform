'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('clubs', 'admin_comment', {
            type: Sequelize.STRING(1000),
            allowNull: true,
            defaultValue: null,
            comment: 'Admin comment for club status changes - appears in user profile messages',
        });

        // Add index for performance
        await queryInterface.addIndex('clubs', ['admin_comment']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('clubs', ['admin_comment']);
        await queryInterface.removeColumn('clubs', 'admin_comment');
    },
};
