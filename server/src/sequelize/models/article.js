'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Article extends Model {
        static associate(models) {
            Article.hasOne(models.mainImage, {
                foreignKey: 'articleId',
                as: 'mainImage',
            });

            Article.hasMany(models.section, {
                foreignKey: 'sectionableId',
                as: 'sections',
                constraints: false,
                scope: {
                    section_link_connection: 'article',
                },
            });

            Article.belongsTo(models.article, {
                foreignKey: 'relatedArticleId',
                as: 'relatedArticle',
            });

            Article.belongsTo(models.article, {
                foreignKey: 'nextArticleId',
                as: 'nextArticle',
            });

            Article.belongsTo(models.article, {
                foreignKey: 'previousArticleId',
                as: 'previousArticle',
            });

            Article.belongsTo(models.user_account, {
                foreignKey: 'updatedById',
                as: 'lastEditor',
            });
        }
    }

    Article.init(
        {
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            summary: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            author: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            tags: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                defaultValue: [],
            },
            updatedBy: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            publishDate: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                set(value) {
                    if (value) {
                        const dateOnly = new Date(value).toISOString().split('T')[0];
                        this.setDataValue('publishDate', dateOnly);
                    }

                },
            },
            relatedArticleId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'articles',
                    key: 'id',
                },
            },
            nextArticleId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'articles',
                    key: 'id',
                },
            },
            previousArticleId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'articles',
                    key: 'id',
                },
            },
            usefulLinks: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
            },
            status: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: 'published',
                validate: {
                    isIn: {
                        args: [['draft', 'published', 'archived']],
                        msg: 'Status must be one of: draft, published, archived',
                    },
                },
            },
            updatedById: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'user_accounts',
                    key: 'id',
                },
            },
        },
        {
            sequelize,
            modelName: 'article',
        }
    );

    return Article;
};
