'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('downloadMaterials', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            title_slug: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            title: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            file_type: {
                type: Sequelize.ENUM('pdf', 'docx'),
                allowNull: true,
            },
            file_size: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            download_url: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            downloadable_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            download_link_connection: {
                type: Sequelize.STRING,
                allowNull: false,
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

        await queryInterface.addIndex('downloadMaterials', ['downloadable_id']);
        await queryInterface.addIndex('downloadMaterials', ['download_link_connection']);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('downloadMaterials');
    },
};
