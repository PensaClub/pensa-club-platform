'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // await queryInterface.removeConstraint('sectionImages', 'sectionImages_sectionId_key');
    },

    async down(queryInterface, Sequelize) {
        // await queryInterface.addConstraint('sectionImages', {
        //     fields: ['sectionId'],
        //     type: 'unique',
        //     name: 'sectionImages_sectionId_key',
        // });
    },
};
