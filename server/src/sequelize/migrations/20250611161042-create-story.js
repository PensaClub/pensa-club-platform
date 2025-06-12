'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('stories', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            slug: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            title_slug: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            initiative_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'initiatives',
                    key: 'id',
                },
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            short_description: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            published_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            author: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            author_email: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            author_image: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            read_time: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            category: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            tags: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: true,
                defaultValue: [],
            },
            views: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            likes: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            comments_enabled: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
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

        await queryInterface.createTable('related_stories', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            story_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'stories',
                    key: 'id',
                },
            },
            related_story_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'stories',
                    key: 'id',
                },
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

        await queryInterface.addIndex('stories', ['slug']);
        await queryInterface.addIndex('stories', ['initiative_id']);
        await queryInterface.addIndex('stories', ['category']);
        await queryInterface.addIndex('stories', ['published_at']);

        await queryInterface.addIndex('related_stories', ['story_id']);
        await queryInterface.addIndex('related_stories', ['related_story_id']);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('related_stories');
        await queryInterface.dropTable('stories');
    },
};
