'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // crawler_bots — one row per "theme" (e.g. AI in education) that the
        // admin wants to monitor across multiple feeds.
        await queryInterface.createTable('crawler_bots', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING(120),
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            status: {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'active',
            },
            scheduleCron: {
                type: Sequelize.STRING(60),
                allowNull: false,
                defaultValue: '0 * * * *',
            },
            criteria: {
                type: Sequelize.JSONB,
                allowNull: false,
                defaultValue: { keywords: [], match: 'any', caseSensitive: false },
            },
            useLlm: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            lastRunAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            lastRunStatus: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            createdById: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'user_accounts', key: 'id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('NOW()'),
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('NOW()'),
            },
        });
        await queryInterface.addIndex('crawler_bots', ['status'], {
            name: 'idx_crawler_bots_status',
        });

        await queryInterface.createTable('crawler_sources', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            botId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'crawler_bots', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            name: {
                type: Sequelize.STRING(120),
                allowNull: false,
            },
            url: {
                type: Sequelize.STRING(500),
                allowNull: false,
            },
            sourceType: {
                type: Sequelize.STRING(10),
                allowNull: false,
                defaultValue: 'rss',
            },
            rssUrl: {
                type: Sequelize.STRING(500),
                allowNull: true,
            },
            htmlSelectors: {
                type: Sequelize.JSONB,
                allowNull: true,
            },
            robotsAllowed: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            robotsCrawlDelay: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            validationStatus: {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'unknown',
            },
            validationMessage: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            lastValidatedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            etag: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            lastModified: {
                type: Sequelize.STRING(64),
                allowNull: true,
            },
            active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('NOW()'),
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('NOW()'),
            },
        });
        await queryInterface.addIndex('crawler_sources', ['botId', 'active'], {
            name: 'idx_crawler_sources_bot_active',
        });

        await queryInterface.createTable('crawler_runs', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            botId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'crawler_bots', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            trigger: {
                type: Sequelize.STRING(10),
                allowNull: false,
            },
            startedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            finishedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            status: {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'running',
            },
            sourcesScanned: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            itemsSeen: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            itemsNew: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            errorLog: {
                type: Sequelize.JSONB,
                allowNull: true,
            },
        });
        await queryInterface.addIndex('crawler_runs', ['botId', 'startedAt'], {
            name: 'idx_crawler_runs_bot_started',
        });

        await queryInterface.createTable('crawler_findings', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            botId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'crawler_bots', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            sourceId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'crawler_sources', key: 'id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            runId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'crawler_runs', key: 'id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            externalUrl: {
                type: Sequelize.STRING(1000),
                allowNull: false,
            },
            urlHash: {
                type: Sequelize.STRING(64),
                allowNull: false,
            },
            title: {
                type: Sequelize.STRING(500),
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            imageUrl: {
                type: Sequelize.STRING(1000),
                allowNull: true,
            },
            topic: {
                type: Sequelize.STRING(120),
                allowNull: true,
            },
            publishedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            relevanceScore: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            foundAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('NOW()'),
            },
            status: {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'new',
            },
            usedInArticleId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'articles', key: 'id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('NOW()'),
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('NOW()'),
            },
        });
        await queryInterface.addIndex('crawler_findings', ['botId', 'urlHash'], {
            name: 'uniq_crawler_findings_bot_url',
            unique: true,
        });
        await queryInterface.addIndex('crawler_findings', ['botId', 'status', 'foundAt'], {
            name: 'idx_crawler_findings_bot_status_found',
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('crawler_findings');
        await queryInterface.dropTable('crawler_runs');
        await queryInterface.dropTable('crawler_sources');
        await queryInterface.dropTable('crawler_bots');
    },
};
