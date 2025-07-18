'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('publications', 'creator_id', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'user_accounts',
                key: 'id',
            },
            onDelete: 'CASCADE',
        });

        await queryInterface.addIndex('publications', ['creator_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('publications', 'creator_id');
    },
};
