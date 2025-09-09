'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('club_activities', {
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
            type: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Activity type: regular, event, trip, course',
            },
            name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            data: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Flexible data per activity type (schedule, details, etc.)',
            },
            schedule: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Schedule info: day, time, frequency, etc.',
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
                defaultValue: true,
                field: 'is_active',
            },
            featured: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
                defaultValue: false,
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

        await queryInterface.addConstraint('club_activities', {
            fields: ['club_id'],
            type: 'foreign key',
            name: 'club_activities_club_id_fkey',
            references: {
                table: 'clubs',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });

        await queryInterface.addIndex('club_activities', ['type']);
        await queryInterface.addIndex('club_activities', ['is_active']);
        await queryInterface.addIndex('club_activities', ['featured']);
        await queryInterface.addIndex('club_activities', ['created_at']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('club_activities');
    },
};
