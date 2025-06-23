'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('contacts', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            position: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            phone: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            image: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            is_main_contact: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            is_team_member: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            role: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            contactable_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            contact_link_connection: {
                type: Sequelize.STRING,
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

        await queryInterface.addIndex('contacts', ['contactable_id']);
        await queryInterface.addIndex('contacts', ['contact_link_connection']);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('contacts');
    },
};
