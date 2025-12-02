'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('sections', 'video_url', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
        await queryInterface.addColumn('sections', 'thumbnail_url', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('sections', 'video_url');
        await queryInterface.removeColumn('sections', 'thumbnail_url');
    }
};