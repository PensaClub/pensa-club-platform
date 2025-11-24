'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class BotLog extends Model {
        static associate(models) {
            // Връзка с articles
            BotLog.belongsTo(models.article, {
                foreignKey: 'articleId',
                as: 'article',
            });
        }
    }

    BotLog.init(
        {
            bot: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            articleId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            articleSlug: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            userAgent: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            ip: {
                type: DataTypes.STRING(45),
                allowNull: true,
            },
            timestamp: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: 'bot_log',
            tableName: 'bot_logs',
        }
    );

    return BotLog;
};