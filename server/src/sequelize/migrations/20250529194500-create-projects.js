'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('projects', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            title_slug: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM('in-progress', 'active', 'planned'),
                allowNull: false,
                defaultValue: 'in-progress',
            },
            image: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            link: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            initiativeId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'initiatives',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
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
        await queryInterface.dropTable('projects');
    },
};
