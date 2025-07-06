'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(`
      ALTER TYPE "enum_project_applications_status"
      ADD VALUE IF NOT EXISTS 'interview';
    `);
    },

    async down(queryInterface, Sequelize) {},
};
