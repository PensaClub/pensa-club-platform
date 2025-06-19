'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('sponsors', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            amount: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: true,
            },
            currency: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            type: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            visible: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            },
            logo: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            website: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            sponsorable_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            sponsor_link_connection: {
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
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('sponsors');
    },
};
