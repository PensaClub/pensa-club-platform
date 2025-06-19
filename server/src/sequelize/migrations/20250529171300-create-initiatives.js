'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('initiatives', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            creator_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'user_accounts',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            slug: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            short_description: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            detailed_description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            category: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            custom_category: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            priority: {
                type: Sequelize.ENUM('Low', 'Medium', 'High'),
                allowNull: true,
                defaultValue: 'Low',
            },
            location: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: [],
            },
            status: {
                type: Sequelize.ENUM('in-progress', 'active', 'planned', 'completed'),
                allowNull: true,
                defaultValue: 'in-progress',
            },
            campaign_status: {
                type: Sequelize.ENUM('open', 'closed'),
                allowNull: true,
                defaultValue: 'open',
            },
            start_date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            end_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            timestamp: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            duration: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            milestones: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: [],
            },
            target_age: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: true,
                defaultValue: [],
            },
            target_audience: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: true,
                defaultValue: [],
            },
            custom_audience: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            expected_budget: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            currency: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            funding_sources: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: true,
                defaultValue: [],
            },
            organization: {
                type: Sequelize.JSONB,
                allowNull: true,
            },
            logo: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            contact_email: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            contact_phone: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            social_media: {
                type: Sequelize.JSONB,
                allowNull: true,
            },
            kpis: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: [],
            },
            expected_results: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            progress_report: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            impact_metrics: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: [],
            },
            testimonials: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: [],
            },
            faq: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: [],
            },
            tags: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: true,
                defaultValue: [],
            },
            comments_enabled: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
                defaultValue: true,
            },
            is_draft: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        await queryInterface.addIndex('initiatives', ['slug']);
        await queryInterface.addIndex('initiatives', ['status']);
        await queryInterface.addIndex('initiatives', ['category']);
        await queryInterface.addIndex('initiatives', ['creator_id']);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('initiatives');
    },
};
