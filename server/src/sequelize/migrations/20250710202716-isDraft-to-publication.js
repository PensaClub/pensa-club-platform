'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('publications', 'is_draft', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        });

        await queryInterface.addIndex('publications', ['is_draft']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('publications', 'is_draft');
    },
};
