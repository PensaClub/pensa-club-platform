'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('club_memberships', 'max_members', {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0,
        });

        await queryInterface.addColumn('club_memberships', 'type', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.addColumn('club_memberships', 'minimum_age', {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0,
        });

        await queryInterface.addColumn('club_memberships', 'trial_period', {
            type: Sequelize.JSONB,
            allowNull: true,
            defaultValue: {},
        });

        await queryInterface.addColumn('club_memberships', 'fees', {
            type: Sequelize.JSONB,
            allowNull: true,
            defaultValue: {},
        });

        await queryInterface.addColumn('club_memberships', 'management', {
            type: Sequelize.JSONB,
            allowNull: true,
            defaultValue: {},
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('club_memberships', 'max_members');
        await queryInterface.removeColumn('club_memberships', 'type');
        await queryInterface.removeColumn('club_memberships', 'minimum_age');
        await queryInterface.removeColumn('club_memberships', 'trial_period');
        await queryInterface.removeColumn('club_memberships', 'fees');
        await queryInterface.removeColumn('club_memberships', 'management');
    },
};
