'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('club_memberships', {
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
            totalMembers: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 0,
                field: 'total_members',
                comment: 'Detailed member count (different from clubs.total_members)',
            },
            ageGroups: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {},
                field: 'age_groups',
                comment: 'Age distribution: {"60-70": 5, "70-80": 10, "80+": 3}',
            },
            membershipFee: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {},
                field: 'membership_fee',
                comment: 'Fee structure: {monthly: 10, yearly: 100, currency: "BGN"}',
            },
            requirements: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: [],
                comment: 'Membership requirements: ["age 60+", "medical certificate"]',
            },
            benefits: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: [],
                comment: 'Membership benefits: ["gym access", "discounts"]',
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

        await queryInterface.addConstraint('club_memberships', {
            fields: ['club_id'],
            type: 'foreign key',
            name: 'club_memberships_club_id_fkey',
            references: {
                table: 'clubs',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });

        await queryInterface.addIndex('club_memberships', ['total_members']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('club_memberships');
    },
};
