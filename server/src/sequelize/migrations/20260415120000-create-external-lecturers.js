'use strict';

/**
 * Create external_lecturers table.
 *
 * External lecturers are free-form people (not in the mentors table and not
 * admins) who may lead or co-lead a seminar. They are stored here so that
 * once an admin adds them, they become reusable (autocomplete when picking
 * lecturers for future seminars) and can be notified by SMS / email for
 * reminders if they supply contact data.
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('external_lecturers', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            phone: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            organization: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            bio: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            photo_url: {
                type: Sequelize.STRING(2048),
                allowNull: true,
            },
            created_by: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'user_accounts', key: 'id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            times_used: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        await queryInterface.addIndex('external_lecturers', ['name'], {
            name: 'idx_external_lecturers_name',
        });
        await queryInterface.addIndex('external_lecturers', ['times_used'], {
            name: 'idx_external_lecturers_times_used',
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('external_lecturers');
    },
};
