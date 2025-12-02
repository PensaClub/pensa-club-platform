// server/src/sequelize/migrations/XXXXXX-add-video-fields-to-images.js
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('images', 'video_url', {
            type: Sequelize.TEXT,
            allowNull: true
        });
        
        await queryInterface.addColumn('images', 'thumbnail_url', {
            type: Sequelize.TEXT,
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('images', 'video_url');
        await queryInterface.removeColumn('images', 'thumbnail_url');
    }
};