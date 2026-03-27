'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class forum_bookmark extends Model {
    static associate(models) {
      forum_bookmark.belongsTo(models.user_account, { foreignKey: 'userId', as: 'user' });
      forum_bookmark.belongsTo(models.forum_post, { foreignKey: 'postId', as: 'post' });
    }
  }

  forum_bookmark.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
      postId: { type: DataTypes.INTEGER, allowNull: false, field: 'post_id' },
    },
    {
      sequelize,
      modelName: 'forum_bookmark',
      tableName: 'forum_bookmarks',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      underscored: true,
    }
  );

  return forum_bookmark;
};
