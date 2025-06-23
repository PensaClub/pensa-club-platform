'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('project_applications', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            project_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'projects',
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

        await queryInterface.addIndex('project_applications', ['project_id']);
        await queryInterface.addIndex('project_applications', ['user_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('project_applications');
    },
};
