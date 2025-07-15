'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('projects', 'is_draft', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        });

        await queryInterface.addIndex('projects', ['is_draft']);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('projects', 'is_draft');
    },
};
