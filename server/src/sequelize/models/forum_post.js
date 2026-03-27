'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class forum_post extends Model {
    static associate(models) {
      forum_post.belongsTo(models.user_account, { foreignKey: 'authorId', as: 'author' });
      forum_post.belongsTo(models.forum_space, { foreignKey: 'spaceId', as: 'space' });
      forum_post.hasMany(models.forum_comment, { foreignKey: 'postId', as: 'comments' });
      forum_post.hasMany(models.forum_reaction, {
        foreignKey: 'targetId',
        constraints: false,
        scope: { target_type: 'post' },
        as: 'reactions',
      });
      forum_post.hasOne(models.forum_poll, { foreignKey: 'postId', as: 'poll' });
      forum_post.hasMany(models.forum_bookmark, { foreignKey: 'postId', as: 'bookmarks' });
      forum_post.belongsToMany(models.forum_tag, {
        through: models.forum_post_tag,
        foreignKey: 'postId',
        otherKey: 'tagId',
        as: 'tags',
      });
    }
  }

  forum_post.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      title: { type: DataTypes.STRING(300), allowNull: false },
      slug: { type: DataTypes.STRING(350), allowNull: false, unique: true },
      content: { type: DataTypes.TEXT, allowNull: false },
      excerpt: { type: DataTypes.STRING(500), allowNull: true },
      authorId: { type: DataTypes.INTEGER, allowNull: false, field: 'author_id' },
      spaceId: { type: DataTypes.INTEGER, allowNull: true, field: 'space_id' },
      type: { type: DataTypes.ENUM('discussion', 'article', 'poll', 'question'), allowNull: false, defaultValue: 'discussion' },
      status: { type: DataTypes.ENUM('published', 'pending', 'rejected', 'hidden'), allowNull: false, defaultValue: 'pending' },
      isPinned: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_pinned' },
      isLocked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_locked' },
      viewCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'view_count' },
      commentCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'comment_count' },
      reactionCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'reaction_count' },
      shareCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'share_count' },
      bookmarkCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'bookmark_count' },
      images: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false, defaultValue: [] },
      videos: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false, defaultValue: [] },
      coverImage: { type: DataTypes.STRING(500), allowNull: true, field: 'cover_image' },
      lastActivityAt: { type: DataTypes.DATE, allowNull: true, field: 'last_activity_at' },
      publishedAt: { type: DataTypes.DATE, allowNull: true, field: 'published_at' },
      editedAt: { type: DataTypes.DATE, allowNull: true, field: 'edited_at' },
    },
    {
      sequelize,
      modelName: 'forum_post',
      tableName: 'forum_posts',
      timestamps: true,
      underscored: true,
    }
  );

  return forum_post;
};
