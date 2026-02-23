'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('site_settings', [
            {
                key: 'article_limit_enabled',
                value: 'true',
                type: 'boolean',
                category: 'content',
                description: 'Enable/disable article read limit for guests',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                key: 'article_limit_max_reads',
                value: '1',
                type: 'number',
                category: 'content',
                description: 'Max articles a guest can read per time window',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                key: 'article_limit_window_hours',
                value: '24',
                type: 'number',
                category: 'content',
                description: 'Time window in hours for article read limit',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('site_settings', {
            key: [
                'article_limit_enabled',
                'article_limit_max_reads',
                'article_limit_window_hours',
            ],
        });
    },
};
