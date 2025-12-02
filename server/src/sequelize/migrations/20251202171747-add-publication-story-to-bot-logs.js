// server/src/sequelize/migrations/XXXXXX-add-publication-story-to-bot-logs.js

'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Добави publication полета
        await queryInterface.addColumn('bot_logs', 'publication_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'publications',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        await queryInterface.addColumn('bot_logs', 'publication_slug', {
            type: Sequelize.STRING,
            allowNull: true
        });

        // Добави story полета
        await queryInterface.addColumn('bot_logs', 'story_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'stories',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        await queryInterface.addColumn('bot_logs', 'story_slug', {
            type: Sequelize.STRING,
            allowNull: true
        });

        // Обнови ENUM за contentType
        await queryInterface.changeColumn('bot_logs', 'content_type', {
            type: Sequelize.ENUM('article', 'project', 'initiative', 'club', 'page', 'mentor', 'game', 'publication', 'story'),
            allowNull: false,
            defaultValue: 'article'
        });

        console.log('✅ Migration completed: Added publication and story columns to bot_logs');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('bot_logs', 'publication_id');
        await queryInterface.removeColumn('bot_logs', 'publication_slug');
        await queryInterface.removeColumn('bot_logs', 'story_id');
        await queryInterface.removeColumn('bot_logs', 'story_slug');

        // Върни ENUM към предишното състояние
        await queryInterface.changeColumn('bot_logs', 'content_type', {
            type: Sequelize.ENUM('article', 'project', 'initiative', 'club', 'page', 'mentor', 'game'),
            allowNull: false,
            defaultValue: 'article'
        });
    }
};