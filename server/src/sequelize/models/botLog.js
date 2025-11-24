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

            // Връзка с projects
            BotLog.belongsTo(models.project, {
                foreignKey: 'projectId',
                as: 'project',
            });

            // Връзка с initiatives
            BotLog.belongsTo(models.initiative, {
                foreignKey: 'initiativeId',
                as: 'initiative',
            });

            // ✅ Връзка с Club (ГЛАВНА БУКВА!)
            if (models.Club) {
                BotLog.belongsTo(models.Club, {
                    foreignKey: 'clubId',
                    as: 'club',
                });
            }
        }
    }

    BotLog.init(
        {
            bot: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            contentType: {
                type: DataTypes.ENUM('article', 'project', 'initiative', 'club'),
                allowNull: false,
                defaultValue: 'article',
                field: 'content_type',
                comment: 'Тип на съдържанието: article, project, initiative, club'
            },
            // ========== ARTICLE FIELDS ==========
            articleId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            articleSlug: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            // ========== PROJECT FIELDS ==========
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
            // ========== INITIATIVE FIELDS ==========
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
            // ========== CLUB FIELDS ==========
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
            // ========== COMMON FIELDS ==========
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
            timestamps: false,
            underscored: false,
        }
    );

    return BotLog;
};