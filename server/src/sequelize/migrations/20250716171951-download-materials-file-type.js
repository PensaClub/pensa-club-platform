'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('downloadMaterials', 'file_type', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('downloadMaterials', 'file_type', {
            type: Sequelize.ENUM('pdf', 'docx'),
            allowNull: true,
        });
    },
};
