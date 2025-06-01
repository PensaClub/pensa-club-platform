'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('contacts', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
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
            initiativeId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'initiatives',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
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
        await queryInterface.dropTable('contacts');
    },
};
