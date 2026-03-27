'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class forum_comment extends Model {
    static associate(models) {
      forum_comment.belongsTo(models.forum_post, { foreignKey: 'postId', as: 'post' });
      forum_comment.belongsTo(models.user_account, { foreignKey: 'authorId', as: 'author' });
      forum_comment.belongsTo(models.forum_comment, { foreignKey: 'parentId', as: 'parent', onDelete: 'CASCADE' });
      forum_comment.hasMany(models.forum_comment, { foreignKey: 'parentId', as: 'replies', onDelete: 'CASCADE' });
      forum_comment.belongsTo(models.forum_comment, { foreignKey: 'quotedCommentId', as: 'quotedComment' });
      forum_comment.hasMany(models.forum_reaction, {
        foreignKey: 'targetId',
        constraints: false,
        scope: { target_type: 'comment' },
        as: 'reactions',
      });
    }
  }

  forum_comment.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      postId: { type: DataTypes.INTEGER, allowNull: false, field: 'post_id' },
      authorId: { type: DataTypes.INTEGER, allowNull: false, field: 'author_id' },
      parentId: { type: DataTypes.INTEGER, allowNull: true, field: 'parent_id' },
      content: { type: DataTypes.TEXT, allowNull: false },
      images: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false, defaultValue: [] },
      status: { type: DataTypes.ENUM('visible', 'hidden', 'deleted'), allowNull: false, defaultValue: 'visible' },
      reactionCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'reaction_count' },
      isEdited: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_edited' },
      mentionedUsers: { type: DataTypes.ARRAY(DataTypes.INTEGER), allowNull: false, defaultValue: [], field: 'mentioned_users' },
      quotedCommentId: { type: DataTypes.INTEGER, allowNull: true, field: 'quoted_comment_id' },
    },
    {
      sequelize,
      modelName: 'forum_comment',
      tableName: 'forum_comments',
      timestamps: true,
      underscored: true,
    }
  );

  return forum_comment;
};
