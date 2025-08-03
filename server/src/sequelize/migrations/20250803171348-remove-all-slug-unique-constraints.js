'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeConstraint('initiatives', 'initiatives_slug_key');

        await queryInterface.removeConstraint('projects', 'projects_slug_key');

        await queryInterface.removeConstraint('publications', 'publications_slug_key');

        await queryInterface.removeConstraint('stories', 'stories_slug_key');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addConstraint('initiatives', {
            fields: ['slug'],
            type: 'unique',
            name: 'initiatives_slug_key',
        });

        await queryInterface.addConstraint('projects', {
            fields: ['slug'],
            type: 'unique',
            name: 'projects_slug_key',
        });

        await queryInterface.addConstraint('publications', {
            fields: ['slug'],
            type: 'unique',
            name: 'publications_slug_key',
        });

        await queryInterface.addConstraint('stories', {
            fields: ['slug'],
            type: 'unique',
            name: 'stories_slug_key',
        });
    },
};
