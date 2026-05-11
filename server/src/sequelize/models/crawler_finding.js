'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class crawler_finding extends Model {
        static associate(models) {
            crawler_finding.belongsTo(models.crawler_bot, {
                foreignKey: 'botId',
                as: 'bot',
            });
            crawler_finding.belongsTo(models.crawler_source, {
                foreignKey: 'sourceId',
                as: 'source',
            });
            crawler_finding.belongsTo(models.crawler_run, {
                foreignKey: 'runId',
                as: 'run',
            });
            crawler_finding.belongsTo(models.article, {
                foreignKey: 'usedInArticleId',
                as: 'usedInArticle',
            });
        }
    }

    crawler_finding.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            botId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'crawler_bots', key: 'id' },
            },
            sourceId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: 'crawler_sources', key: 'id' },
            },
            runId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: 'crawler_runs', key: 'id' },
            },
            externalUrl: {
                type: DataTypes.STRING(1000),
                allowNull: false,
            },
            urlHash: {
                type: DataTypes.STRING(64),
                allowNull: false,
            },
            title: {
                type: DataTypes.STRING(500),
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            imageUrl: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            topic: {
                type: DataTypes.STRING(120),
                allowNull: true,
            },
            publishedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            relevanceScore: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            llmReasoning: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            foundAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            status: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: 'new',
                validate: {
                    isIn: {
                        args: [['new', 'reviewed', 'dismissed', 'used']],
                        msg: 'status must be one of: new, reviewed, dismissed, used',
                    },
                },
            },
            usedInArticleId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: 'articles', key: 'id' },
            },
        },
        {
            sequelize,
            modelName: 'crawler_finding',
            tableName: 'crawler_findings',
        }
    );

    return crawler_finding;
};
