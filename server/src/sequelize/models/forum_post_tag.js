'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class forum_post_tag extends Model {
    static associate() {}
  }

  forum_post_tag.init(
    {
      postId: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, field: 'post_id' },
      tagId: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, field: 'tag_id' },
    },
    {
      sequelize,
      modelName: 'forum_post_tag',
      tableName: 'forum_post_tags',
      timestamps: false,
      underscored: true,
    }
  );

  return forum_post_tag;
};
