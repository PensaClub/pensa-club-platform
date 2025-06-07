'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tables = await queryInterface.showAllTables();
        const tableExists = tables.map((t) => t.toLowerCase()).includes('sectionimages');

        if (!tableExists) {
            console.log('Table sectionImages does not exist, skipping constraint removal.');
            return;
        }

        // Get all constraints for the table
        const constraints = await queryInterface.showConstraint('sectionImages');

        // Find the specific constraint we want to remove
        const targetConstraint = constraints.find(
            (c) => c.constraintName === 'sectionImages_sectionId_key' || c.constraintName === 'sectionimages_sectionid_key' // Handle case sensitivity
        );

        if (targetConstraint) {
            try {
                await queryInterface.removeConstraint('sectionImages', targetConstraint.constraintName);
                console.log(`Successfully removed constraint: ${targetConstraint.constraintName}`);
            } catch (e) {
                console.warn('Error removing constraint:', e.message);
            }
        } else {
            console.log('Target constraint not found, skipping removal.');
        }
    },

    async down(queryInterface, Sequelize) {
        const tables = await queryInterface.showAllTables();
        const tableExists = tables.map((t) => t.toLowerCase()).includes('sectionimages');

        if (!tableExists) {
            console.log('Table sectionImages does not exist, skipping constraint addition.');
            return;
        }

        try {
            await queryInterface.addConstraint('sectionImages', {
                fields: ['sectionId'],
                type: 'unique',
                name: 'sectionImages_sectionId_key',
            });
            console.log('Successfully added constraint: sectionImages_sectionId_key');
        } catch (e) {
            console.warn('Error adding constraint:', e.message);
        }
    },
};
