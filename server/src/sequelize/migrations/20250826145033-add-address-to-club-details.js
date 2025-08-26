'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('club_details', 'address', {
            type: Sequelize.JSONB,
            allowNull: true,
            defaultValue: {},
            comment: 'Club address information: street, city, postalCode, poBox',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('club_details', 'address');
    },
};
