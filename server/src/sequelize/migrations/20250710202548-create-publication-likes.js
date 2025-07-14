'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('publication_likes', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            publication_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'publications',
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

        await queryInterface.addConstraint('publication_likes', {
            fields: ['publication_id', 'user_id'],
            type: 'unique',
            name: 'publication_likes_unique',
        });

        await queryInterface.addIndex('publication_likes', ['publication_id']);
        await queryInterface.addIndex('publication_likes', ['user_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('publication_likes');
    },
};
