'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('initiative_bookmarks', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
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
            initiative_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'initiatives',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        await queryInterface.addConstraint('initiative_bookmarks', {
            fields: ['user_id', 'initiative_id'],
            type: 'unique',
            name: 'unique_user_initiative_bookmark',
        });

        await queryInterface.addIndex('initiative_bookmarks', ['user_id']);
        await queryInterface.addIndex('initiative_bookmarks', ['initiative_id']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('initiative_bookmarks');
    },
};
