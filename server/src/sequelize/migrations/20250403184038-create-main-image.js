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
                type: Sequelize.ENUM('image', 'slider', 'video'),
                allowNull: false,
            },
            sources: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: false,
                defaultValue: [],
            },
            alt: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            thumbnail: {
                type: Sequelize.STRING,
                allowNull: true,
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
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_mainImages_type";');
        await queryInterface.dropTable('mainImages');
    },
};
