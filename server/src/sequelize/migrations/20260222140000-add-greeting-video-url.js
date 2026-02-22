'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('site_settings', [
            {
                key: 'greeting_video_url',
                value: '/videos/christmas.mp4',
                type: 'string',
                category: 'seasonal',
                description: 'Video URL for greeting modal',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('site_settings', {
            key: ['greeting_video_url'],
        });
    },
};
