'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('beneficiaries', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
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
            total_count: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 0,
            },
            total_amount_distributed: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: true,
                defaultValue: 0.0,
            },
            currency: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: 'BGN',
            },
            list: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {},
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });

        await queryInterface.addConstraint('beneficiaries', {
            fields: ['project_id'],
            type: 'unique',
            name: 'beneficiaries_project_id_unique',
        });

        await queryInterface.addIndex('beneficiaries', ['project_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('beneficiaries');
    },
};
