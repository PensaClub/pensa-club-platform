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
                type: Sequelize.STRING,
                allowNull: false,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            file_type: {
                type: Sequelize.ENUM('pdf', 'docx'),
                allowNull: false,
            },
            file_size: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            download_url: {
                type: Sequelize.STRING,
                allowNull: false,
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
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });

        await queryInterface.addIndex('downloadMaterials', ['downloadable_id']);
        await queryInterface.addIndex('downloadMaterials', ['download_link_connection']);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('downloadMaterials');
    },
};
