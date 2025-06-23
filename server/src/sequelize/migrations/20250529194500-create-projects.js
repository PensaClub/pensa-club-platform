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
            creator_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'user_accounts',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            slug: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            short_description: {
                type: Sequelize.STRING,
                allowNull: false,
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
            budget: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: null,
                comment: 'JSONB structure: { total: number, currency: string, funded: number, goal: number }',
            },
            timeline: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: null,
                comment: 'JSONB structure: { startDate: string, endDate: string, estimatedDuration: string }',
            },
            location: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: [],
                comment: 'JSONB structure: [{ address: string, coordinates: { lat: number, lng: number } }]',
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
            logo: {
                type: Sequelize.TEXT,
                allowNull: true,
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
        await queryInterface.addIndex('projects', ['creator_id']);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('projects');
    },
};
