'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('clubs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            slug: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            shortDescription: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'short_description',
            },
            foundedYear: {
                type: Sequelize.INTEGER,
                allowNull: true,
                field: 'founded_year',
            },
            status: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: 'active',
                comment: 'Club status - validated by app schema',
            },
            category: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Club category - validated by app schema',
            },
            logo: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            mainImage: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'main_image',
            },
            createdBy: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'created_by',
            },
            isVerified: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
                defaultValue: false,
                field: 'is_verified',
            },
            isPublic: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
                defaultValue: true,
                field: 'is_public',
            },
            isDraft: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
                defaultValue: true,
                field: 'is_draft',
            },
            rating: {
                type: Sequelize.DECIMAL(2, 1),
                allowNull: true,
                defaultValue: 0.0,
            },
            views: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 0,
            },
            followers: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 0,
            },
            totalMembers: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 0,
                field: 'total_members',
                comment: 'Denormalized field for performance - actual members in club_members table',
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

        await queryInterface.addIndex('clubs', ['slug']);
        await queryInterface.addIndex('clubs', ['category', 'status']);
        await queryInterface.addIndex('clubs', ['created_by']);
        await queryInterface.addIndex('clubs', ['is_public', 'status']);
        await queryInterface.addIndex('clubs', ['is_draft']);
        await queryInterface.addIndex('clubs', ['slug', 'is_draft'], { unique: true });
        await queryInterface.addIndex('clubs', ['rating']);
        await queryInterface.addIndex('clubs', ['created_at']);
        await queryInterface.addIndex('clubs', ['total_members']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('clubs');
    },
};
