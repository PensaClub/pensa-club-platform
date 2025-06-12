'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('initiatives', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
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
            category: {
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
            status: {
                type: Sequelize.ENUM('in-progress', 'active', 'planned', 'completed'),
                allowNull: false,
                defaultValue: 'in-progress',
            },
            campaign_status: {
                type: Sequelize.ENUM('open', 'closed'),
                allowNull: false,
                defaultValue: 'open',
            },
            comments_enabled: {
                type: Sequelize.BOOLEAN,
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

        await queryInterface.addIndex('initiatives', ['slug']);
        await queryInterface.addIndex('initiatives', ['status']);
        await queryInterface.addIndex('initiatives', ['category']);
        await queryInterface.addIndex('initiatives', ['creator_id']);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('initiatives');
    },
};
