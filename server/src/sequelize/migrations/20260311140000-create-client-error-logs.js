'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('client_error_logs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            error_message: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            error_stack: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            component_stack: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            url: {
                type: Sequelize.STRING(500),
                allowNull: true,
            },
            user_agent: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            ip_address: {
                type: Sequelize.STRING(45),
                allowNull: true,
            },
            extra_info: {
                type: Sequelize.TEXT,
                allowNull: true,
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('client_error_logs');
    },
};
