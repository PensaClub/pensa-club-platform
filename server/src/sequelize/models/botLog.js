// server/src/sequelize/models/botLog.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class BotLog extends Model {
        static associate(models) {
            BotLog.belongsTo(models.article, {
                foreignKey: 'articleId',
                as: 'article',
            });

            BotLog.belongsTo(models.project, {
                foreignKey: 'projectId',
                as: 'project',
            });

            BotLog.belongsTo(models.initiative, {
                foreignKey: 'initiativeId',
                as: 'initiative',
            });

            if (models.Club) {
                BotLog.belongsTo(models.Club, {
                    foreignKey: 'clubId',
                    as: 'club',
                });
            }

            BotLog.belongsTo(models.mentor, {
                foreignKey: 'mentorId',
                as: 'mentor',
            });
        }
    }

    BotLog.init(
        {
            bot: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            contentType: {
                type: DataTypes.ENUM('article', 'project', 'initiative', 'club', 'page', 'mentor'),
                allowNull: false,
                defaultValue: 'article',
                field: 'content_type',
            },
            // ARTICLE
            articleId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            articleSlug: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            // PROJECT
            projectId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'project_id',
            },
            projectSlug: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'project_slug',
            },
            // INITIATIVE
            initiativeId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'initiative_id',
            },
            initiativeSlug: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'initiative_slug',
            },
            // CLUB
            clubId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'club_id',
            },
            clubSlug: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'club_slug',
            },
            // PAGE
            pageSlug: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'page_slug',
            },
            // MENTOR
            mentorId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'mentor_id',
            },
            // GEOGRAPHY
            country: {
                type: DataTypes.STRING(2),
                allowNull: true,
                comment: 'ISO Country code'
            },
            city: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            region: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            // COMMON
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
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                field: 'createdAt'
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                field: 'updatedAt'
            }
        },
        {
            sequelize,
            modelName: 'bot_log',
            tableName: 'bot_logs',
            timestamps: true,
            underscored: false,
        }
    );

    return BotLog;
};