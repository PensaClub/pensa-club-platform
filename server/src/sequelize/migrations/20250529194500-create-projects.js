'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('projects', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            slug: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            short_description: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            full_description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            category: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM('in-progress', 'active', 'planned', 'completed'),
                allowNull: true,
                defaultValue: 'in-progress',
            },
            priority: {
                type: Sequelize.ENUM('low', 'medium', 'high'),
                allowNull: true,
            },
            budget_total: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },
            budget_currency: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            budget_funded: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },
            budget_goal: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },
            start_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            end_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            estimated_duration: {
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
            application_status: {
                type: Sequelize.ENUM('open', 'closed'),
                allowNull: true,
                defaultValue: 'open',
            },
            application_deadline: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            max_participants: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            current_participants: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            participant_requirements: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: true,
            },
            tags: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: true,
            },
            comments_enabled: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
                defaultValue: true,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        await queryInterface.addIndex('projects', ['slug']);
        await queryInterface.addIndex('projects', ['status']);
        await queryInterface.addIndex('projects', ['category']);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('projects');
    },
};
