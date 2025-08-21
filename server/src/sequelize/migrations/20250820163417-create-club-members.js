'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('club_members', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            clubId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                field: 'club_id',
            },
            firstName: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'first_name',
            },
            lastName: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'last_name',
            },
            phone: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            address: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            photo: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Member photo: {src: string, alt: string}',
            },
            joinDate: {
                type: Sequelize.DATEONLY,
                allowNull: true,
                field: 'join_date',
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
                defaultValue: true,
                field: 'is_active',
            },
            role: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Member role - validated by schema',
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                field: 'created_at',
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                field: 'updated_at',
            },
        });

        await queryInterface.addIndex('club_members', ['club_id']);
        await queryInterface.addIndex('club_members', ['club_id', 'is_active']);
        await queryInterface.addIndex('club_members', ['club_id', 'role']);
        await queryInterface.addIndex('club_members', ['email']);
        await queryInterface.addIndex('club_members', ['join_date']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('club_members');
    },
};
