'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class crawler_bot extends Model {
        static associate(models) {
            crawler_bot.hasMany(models.crawler_source, {
                foreignKey: 'botId',
                as: 'sources',
            });
            crawler_bot.hasMany(models.crawler_run, {
                foreignKey: 'botId',
                as: 'runs',
            });
            crawler_bot.hasMany(models.crawler_finding, {
                foreignKey: 'botId',
                as: 'findings',
            });
            crawler_bot.belongsTo(models.user_account, {
                foreignKey: 'createdById',
                as: 'creator',
            });
        }
    }

    crawler_bot.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(120),
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            status: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: 'active',
                validate: {
                    isIn: {
                        args: [['active', 'paused', 'archived']],
                        msg: 'Status must be one of: active, paused, archived',
                    },
                },
            },
            scheduleCron: {
                type: DataTypes.STRING(60),
                allowNull: false,
                defaultValue: '0 * * * *',
            },
            criteria: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: { keywords: [], match: 'any', caseSensitive: false },
            },
            useLlm: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            lookBackDays: {
                type: DataTypes.INTEGER,
                allowNull: true,
                // null = no time limit; otherwise findings older than now -
                // lookBackDays are skipped at engine level.
            },
            cleanupEnabled: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            cleanupDay: {
                type: DataTypes.STRING(10),
                allowNull: false,
                defaultValue: 'daily',
                validate: {
                    isIn: {
                        args: [['daily', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']],
                        msg: 'cleanupDay must be one of: daily, mon, tue, wed, thu, fri, sat, sun',
                    },
                },
            },
            cleanupBatchSize: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 100,
                validate: { min: 10, max: 10000 },
            },
            cleanupHour: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 3,
                validate: { min: 0, max: 23 },
            },
            notificationEmails: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,
                // Array of strings; falsy/empty -> fall back to env default.
            },
            // ── Phase 4: LLM scoring ─────────────────────────────────────
            llmModel: {
                type: DataTypes.STRING(40),
                allowNull: false,
                defaultValue: 'claude-haiku-4-5',
            },
            llmMinScore: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 40,
                validate: { min: 0, max: 100 },
            },
            llmAutoDismiss: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            llmTemperature: {
                type: DataTypes.DECIMAL(3, 2),
                allowNull: false,
                defaultValue: 0.0,
                validate: { min: 0, max: 1 },
            },
            llmMaxTokens: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 300,
                validate: { min: 50, max: 2000 },
            },
            llmSystemPrompt: {
                type: DataTypes.TEXT,
                allowNull: true,
                defaultValue: null,
            },
            llmExtraInstructions: {
                type: DataTypes.TEXT,
                allowNull: true,
                defaultValue: null,
            },
            llmDailyCostCap: {
                type: DataTypes.DECIMAL(8, 4),
                allowNull: false,
                defaultValue: 1.0,
                validate: { min: 0 },
            },
            llmTokensInToday: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            llmTokensOutToday: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            llmCostToday: {
                type: DataTypes.DECIMAL(8, 4),
                allowNull: false,
                defaultValue: 0,
            },
            llmCostResetDate: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                defaultValue: null,
            },
            lastRunAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            lastRunStatus: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            createdById: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: 'user_accounts', key: 'id' },
            },
        },
        {
            sequelize,
            modelName: 'crawler_bot',
            tableName: 'crawler_bots',
        }
    );

    return crawler_bot;
};
