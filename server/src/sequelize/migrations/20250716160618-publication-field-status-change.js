'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('publications', 'title_slug', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.changeColumn('publications', 'published_at', {
            type: Sequelize.DATE,
            allowNull: true,
        });

        await queryInterface.changeColumn('publications', 'category', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.changeColumn('publications', 'file_type', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.changeColumn('publications', 'file_size', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.changeColumn('publications', 'download_url', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {},
};
