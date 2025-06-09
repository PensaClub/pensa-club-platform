'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Comment extends Model {
        static associate(models) {
            Comment.belongsTo(models.comment, {
                foreignKey: 'parentId',
                as: 'parent',
                onDelete: 'CASCADE',
            });

            Comment.hasMany(models.comment, {
                foreignKey: 'parentId',
                as: 'replies',
                onDelete: 'CASCADE',
            });

            Comment.belongsTo(models.user_account, {
                foreignKey: 'userId',
                as: 'user',
            });

            Comment.belongsTo(models.initiative, {
                foreignKey: 'commentableId',
                constraints: false,
                scope: {
                    comment_link_connection: 'initiative',
                },
            });
        }
    }
    Comment.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'user_accounts',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                field: 'user_id',
            },
            commentableId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'commentable_id',
            },
            commentsLinkConnection: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'comment_link_connection',
            },
            parentId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'comments',
                    key: 'id',
                },
                field: 'parent_id',
                onDelete: 'CASCADE',
            },
            likes: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                defaultValue: [],
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: 'comment',
            hooks: {
                beforeUpdate: (instance) => {
                    if (instance.changed('content')) {
                        instance.updatedAt = new Date();
                    }
                },
            },
        }
    );
    return Comment;
};
