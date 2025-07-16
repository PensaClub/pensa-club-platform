'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('stories', 'title_slug', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.changeColumn('stories', 'published_at', {
            type: Sequelize.DATE,
            allowNull: true,
        });

        await queryInterface.changeColumn('stories', 'author', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.changeColumn('stories', 'author_email', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.changeColumn('stories', 'category', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {},
};
