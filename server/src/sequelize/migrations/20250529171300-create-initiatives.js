'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('initiatives', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            slug: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            shortDescription: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            category: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            address: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            lat: {
                type: Sequelize.FLOAT,
                allowNull: true,
            },
            lng: {
                type: Sequelize.FLOAT,
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM('in-progress', 'active', 'planned'),
                allowNull: false,
                defaultValue: 'in-progress',
            },
            campaignStatus: {
                type: Sequelize.ENUM('open', 'closed'),
                allowNull: false,
                defaultValue: 'open',
            },
            commentsEnabled: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('initiatives');
    },
};
