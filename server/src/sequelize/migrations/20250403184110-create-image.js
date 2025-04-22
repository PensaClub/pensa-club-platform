'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('images', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            sectionId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'sections',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                allowNull: true,
            },
            mainImageId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'mainImages',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                allowNull: true,
            },
            src: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            alt: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            caption: {
                type: Sequelize.STRING,
                allowNull: true,
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

        await queryInterface.addIndex('images', ['sectionId']);
        await queryInterface.addIndex('images', ['mainImageId']);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('images');
    },
};
