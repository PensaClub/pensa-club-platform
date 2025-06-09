'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('initiativeBookmarks', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'user_accounts', key: 'id' },
                onDelete: 'CASCADE',
            },
            initiativeId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'initiatives', key: 'id' },
                onDelete: 'CASCADE',
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        });

        await queryInterface.addConstraint('initiativeBookmarks', {
            fields: ['userId', 'initiativeId'],
            type: 'unique',
            name: 'unique_user_initiative_bookmark',
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('initiativeBookmarks');
    },
};
