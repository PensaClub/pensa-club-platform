'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('club_bookmarks', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
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
            club_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'clubs',
                    key: 'id',
                },
                onDelete: 'CASCADE',
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

        await queryInterface.addIndex('club_bookmarks', ['user_id']);
        await queryInterface.addIndex('club_bookmarks', ['club_id']);

        await queryInterface.addConstraint('club_bookmarks', {
            fields: ['user_id', 'club_id'],
            type: 'unique',
            name: 'club_bookmarks_user_club_unique',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('club_bookmarks');
    },
};
