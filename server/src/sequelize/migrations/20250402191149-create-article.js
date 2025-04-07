'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('articles', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            slug: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            summary: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            author: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            tags: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                defaultValue: [],
            },
            updatedBy: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            publishDate: {
                type: Sequelize.DATEONLY,
                allowNull: true,
                defaultValue: Sequelize.NOW,
            },
            relatedArticleId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'articles',
                    key: 'id',
                },
                onDelete: 'SET NULL',
            },
            nextArticleId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'articles',
                    key: 'id',
                },
                onDelete: 'SET NULL',
            },
            previousArticleId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'articles',
                    key: 'id',
                },
                onDelete: 'SET NULL',
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATEONLY,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATEONLY,
            },
        });
        await queryInterface.addIndex('articles', {
            fields: ['tags'],
            using: 'gin',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('articles');
    },
};
