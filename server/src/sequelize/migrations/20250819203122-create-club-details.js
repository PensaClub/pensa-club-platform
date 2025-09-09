'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('club_details', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            clubId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                field: 'club_id',
            },
            fullDescription: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'full_description',
            },
            gallery: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: [],
                comment: 'Array of image URLs',
            },
            media: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'videos, virtualTour, audioFiles',
            },
            stats: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'All club statistics',
            },
            management: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Board members and management',
            },
            contacts: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Phone, email, social media, working hours',
            },
            finances: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Budget, funding sources, sponsors',
            },
            regionalInfo: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {},
                field: 'regional_info',
                comment: 'Central club, affiliated clubs, coverage area',
            },
            achievements: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Awards, certificates, recognitions',
            },
            socialImpact: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {},
                field: 'social_impact',
                comment: 'Volunteering, community projects, partnerships',
            },
            pensionersSpecific: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {},
                field: 'pensioners_specific',
                comment: 'Health services, support services, accessibility, special programs',
            },
            template: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Club template type',
            },
            preferences: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Admin settings and preferences',
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                field: 'created_at',
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                field: 'updated_at',
            },
        });

        await queryInterface.addConstraint('club_details', {
            fields: ['club_id'],
            type: 'foreign key',
            name: 'club_details_club_id_fkey',
            references: {
                table: 'clubs',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });

        await queryInterface.addIndex('club_details', ['template']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('club_details');
    },
};
