'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('bot_logs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            bot: {
                type: Sequelize.STRING(50),
                allowNull: false,
                comment: 'Bot name: Facebook, Twitter, LinkedIn, etc.',
            },
            articleId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'articles',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                comment: 'Foreign key to articles table',
            },
            articleSlug: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: 'Article slug for easy reference',
            },
            userAgent: {
                type: Sequelize.TEXT,
                allowNull: false,
                comment: 'Full user agent string',
            },
            ip: {
                type: Sequelize.STRING(45),
                allowNull: true,
                comment: 'IP address (supports IPv6)',
            },
            timestamp: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
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

        // Index за бързо търсене
        await queryInterface.addIndex('bot_logs', ['articleId']);
        await queryInterface.addIndex('bot_logs', ['bot']);
        await queryInterface.addIndex('bot_logs', ['timestamp']);
        await queryInterface.addIndex('bot_logs', ['articleSlug']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('bot_logs');
    },
};