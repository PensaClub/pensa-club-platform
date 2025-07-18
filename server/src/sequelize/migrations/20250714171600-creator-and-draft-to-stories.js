'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('stories', 'creator_id', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'user_accounts',
                key: 'id',
            },
            onDelete: 'CASCADE',
        });

        await queryInterface.addColumn('stories', 'is_draft', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        });

        await queryInterface.addIndex('stories', ['is_draft']);
        await queryInterface.addIndex('stories', ['creator_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('stories', 'creator_id');
        await queryInterface.removeColumn('stories', 'is_draft');
    },
};
