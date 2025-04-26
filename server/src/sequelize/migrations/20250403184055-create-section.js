'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('sections', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            articleId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'articles',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                allowNull: false,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            order: {
                type: Sequelize.INTEGER,
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
        await queryInterface.addIndex('sections', ['articleId', 'order']);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('sections');
    },
};
