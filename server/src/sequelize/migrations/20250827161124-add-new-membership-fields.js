'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('club_memberships', 'maxMembers', {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0,
            field: 'max_members',
            comment: 'Maximum number of members allowed',
        });

        await queryInterface.addColumn('club_memberships', 'type', {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Membership type: open, closed, etc.',
        });

        await queryInterface.addColumn('club_memberships', 'minimumAge', {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0,
            field: 'minimum_age',
            comment: 'Minimum age requirement for membership',
        });

        await queryInterface.addColumn('club_memberships', 'trialPeriod', {
            type: Sequelize.JSONB,
            allowNull: true,
            defaultValue: {},
            field: 'trial_period',
            comment: 'Trial period settings: {enabled: true, days: 30}',
        });

        await queryInterface.addColumn('club_memberships', 'fees', {
            type: Sequelize.JSONB,
            allowNull: true,
            defaultValue: {},
            field: 'fees',
            comment: 'Detailed fee structure with multiple fee types',
        });

        await queryInterface.addColumn('club_memberships', 'management', {
            type: Sequelize.JSONB,
            allowNull: true,
            defaultValue: {},
            field: 'management',
            comment: 'Management roles and contact information',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('club_memberships', 'maxMembers');
        await queryInterface.removeColumn('club_memberships', 'type');
        await queryInterface.removeColumn('club_memberships', 'minimumAge');
        await queryInterface.removeColumn('club_memberships', 'trialPeriod');
        await queryInterface.removeColumn('club_memberships', 'fees');
        await queryInterface.removeColumn('club_memberships', 'management');
    },
};
