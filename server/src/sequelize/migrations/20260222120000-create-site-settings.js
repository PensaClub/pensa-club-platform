'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('site_settings', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            key: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            value: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'false',
            },
            type: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: 'boolean',
            },
            category: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: 'general',
            },
            description: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });

        await queryInterface.addIndex('site_settings', ['key'], { unique: true });
        await queryInterface.addIndex('site_settings', ['category']);

        // Seed initial settings
        await queryInterface.bulkInsert('site_settings', [
            {
                key: 'snowfall_enabled',
                value: 'false',
                type: 'boolean',
                category: 'seasonal',
                description: 'Enable/disable snowfall animation across the site',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                key: 'christmas_greeting_enabled',
                value: 'false',
                type: 'boolean',
                category: 'seasonal',
                description: 'Enable/disable Christmas greeting modal on first visit',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('site_settings');
    },
};
