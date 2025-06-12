'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('publications', {
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
            read_time: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            category: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            file_type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            file_size: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            download_url: {
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
            downloads: {
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

        await queryInterface.createTable('related_publications', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            publication_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'publications',
                    key: 'id',
                },
            },
            related_publication_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'publications',
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

        await queryInterface.addIndex('publications', ['slug']);
        await queryInterface.addIndex('publications', ['category']);
        await queryInterface.addIndex('publications', ['published_at']);

        await queryInterface.addIndex('related_publications', ['publication_id']);
        await queryInterface.addIndex('related_publications', ['related_publication_id']);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('related_publications');
        await queryInterface.dropTable('publications');
    },
};
