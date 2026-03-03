'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('useful_links', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
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
            titleEn: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            titleDe: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            descriptionEn: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            descriptionDe: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            url: {
                type: Sequelize.STRING(2048),
                allowNull: false,
            },
            imageUrl: {
                type: Sequelize.STRING(2048),
                allowNull: true,
            },
            category: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'general',
            },
            viewCount: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            displayOrder: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            createdBy: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'user_accounts',
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

        await queryInterface.addIndex('useful_links', ['category']);
        await queryInterface.addIndex('useful_links', ['isActive']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('useful_links');
    },
};
