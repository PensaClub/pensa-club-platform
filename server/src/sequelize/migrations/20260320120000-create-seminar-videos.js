'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('seminar_videos', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            seminar_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'seminars', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            title: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            video_url: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            video_provider: {
                type: Sequelize.STRING(50),
                allowNull: false,
                defaultValue: 'youtube'
            },
            thumbnail_url: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            duration_minutes: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            sort_order: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('NOW()')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('NOW()')
            }
        });

        await queryInterface.addIndex('seminar_videos', ['seminar_id']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('seminar_videos');
    }
};
