'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableExists = await queryInterface.showAllTables().then((tables) => tables.includes('sectionImages'));

        if (tableExists) {
            await queryInterface.removeConstraint('sectionImages', 'sectionImages_sectionId_key');
        }
    },

    async down(queryInterface, Sequelize) {
        const tableExists = await queryInterface.showAllTables().then((tables) => tables.includes('sectionImages'));

        if (tableExists) {
            await queryInterface.addConstraint('sectionImages', {
                fields: ['sectionId'],
                type: 'unique',
                name: 'sectionImages_sectionId_key',
            });
        }
    },
};
