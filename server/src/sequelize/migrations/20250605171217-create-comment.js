'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('comments', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'user_accounts',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            commentable_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                onDelete: 'CASCADE',
            },
            comment_link_connection: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            parent_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'comments',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            likes: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                defaultValue: [],
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

        await queryInterface.addIndex('comments', ['commentable_id', 'comment_link_connection']);
        await queryInterface.addIndex('comments', ['parent_id']);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('comments');
    },
};
