'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class crawler_run extends Model {
        static associate(models) {
            crawler_run.belongsTo(models.crawler_bot, {
                foreignKey: 'botId',
                as: 'bot',
            });
            crawler_run.hasMany(models.crawler_finding, {
                foreignKey: 'runId',
                as: 'findings',
            });
        }
    }

    crawler_run.init(
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
            trigger: {
                type: DataTypes.STRING(10),
                allowNull: false,
                validate: {
                    isIn: {
                        args: [['cron', 'manual']],
                        msg: 'trigger must be one of: cron, manual',
                    },
                },
            },
            startedAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            finishedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            status: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: 'running',
                validate: {
                    isIn: {
                        args: [['running', 'success', 'partial_failure', 'failed']],
                        msg: 'status must be one of: running, success, partial_failure, failed',
                    },
                },
            },
            sourcesScanned: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            itemsSeen: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            itemsNew: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            errorLog: {
                type: DataTypes.JSONB,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'crawler_run',
            tableName: 'crawler_runs',
            timestamps: false,
        }
    );

    return crawler_run;
};
