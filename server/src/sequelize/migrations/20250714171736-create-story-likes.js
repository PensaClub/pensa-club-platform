'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('story_likes', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            story_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'stories',
                    key: 'id',
                },
                onDelete: 'CASCADE',
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
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        });

        await queryInterface.addConstraint('story_likes', {
            fields: ['story_id', 'user_id'],
            type: 'unique',
            name: 'story_likes_unique',
        });

        await queryInterface.addIndex('story_likes', ['story_id']);
        await queryInterface.addIndex('story_likes', ['user_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('story_likes');
    },
};
