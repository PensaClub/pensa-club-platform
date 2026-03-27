'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class forum_tag extends Model {
    static associate(models) {
      forum_tag.belongsToMany(models.forum_post, {
        through: models.forum_post_tag,
        foreignKey: 'tagId',
        otherKey: 'postId',
        as: 'posts',
      });
    }
  }

  forum_tag.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      slug: { type: DataTypes.STRING(60), allowNull: false, unique: true },
      usageCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'usage_count' },
    },
    {
      sequelize,
      modelName: 'forum_tag',
      tableName: 'forum_tags',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      underscored: true,
    }
  );

  return forum_tag;
};
