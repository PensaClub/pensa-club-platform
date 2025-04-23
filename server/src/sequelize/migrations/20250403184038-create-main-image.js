'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('mainImages', {
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
                unique: true,
            },
            type: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            alt: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            thumbnail: {
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

        await queryInterface.addIndex('mainImages', ['articleId']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('mainImages');
    },
};
