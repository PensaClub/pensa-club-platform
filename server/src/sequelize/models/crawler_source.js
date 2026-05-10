'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class crawler_source extends Model {
        static associate(models) {
            crawler_source.belongsTo(models.crawler_bot, {
                foreignKey: 'botId',
                as: 'bot',
            });
            crawler_source.hasMany(models.crawler_finding, {
                foreignKey: 'sourceId',
                as: 'findings',
            });
        }
    }

    crawler_source.init(
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
            name: {
                type: DataTypes.STRING(120),
                allowNull: false,
            },
            url: {
                type: DataTypes.STRING(500),
                allowNull: false,
            },
            sourceType: {
                type: DataTypes.STRING(10),
                allowNull: false,
                defaultValue: 'rss',
                validate: {
                    isIn: {
                        args: [['rss', 'html', 'auto']],
                        msg: 'sourceType must be one of: rss, html, auto',
                    },
                },
            },
            rssUrl: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            htmlSelectors: {
                type: DataTypes.JSONB,
                allowNull: true,
            },
            robotsAllowed: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            robotsCrawlDelay: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 5,
            },
            validationStatus: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: 'unknown',
            },
            validationMessage: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            lastValidatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            etag: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            lastModified: {
                type: DataTypes.STRING(64),
                allowNull: true,
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            maxPages: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
        },
        {
            sequelize,
            modelName: 'crawler_source',
            tableName: 'crawler_sources',
        }
    );

    return crawler_source;
};
