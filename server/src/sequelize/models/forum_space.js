'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class forum_space extends Model {
    static associate(models) {
      forum_space.belongsTo(models.user_account, {
        foreignKey: 'createdBy',
        as: 'creator',
      });
      forum_space.hasMany(models.forum_space_member, {
        foreignKey: 'spaceId',
        as: 'members',
      });
      forum_space.hasMany(models.forum_post, {
        foreignKey: 'spaceId',
        as: 'posts',
      });
    }
  }

  forum_space.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: DataTypes.STRING(100), allowNull: false },
      slug: { type: DataTypes.STRING(120), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      icon: { type: DataTypes.STRING(10), allowNull: true },
      color: { type: DataTypes.STRING(7), allowNull: true, defaultValue: '#14b8a6' },
      coverImage: { type: DataTypes.STRING(500), allowNull: true, field: 'cover_image' },
      createdBy: { type: DataTypes.INTEGER, allowNull: false, field: 'created_by' },
      status: { type: DataTypes.ENUM('active', 'pending', 'archived'), allowNull: false, defaultValue: 'pending' },
      sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'sort_order' },
      memberCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'member_count' },
      postCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'post_count' },
      isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_default' },
    },
    {
      sequelize,
      modelName: 'forum_space',
      tableName: 'forum_spaces',
      timestamps: true,
      underscored: true,
    }
  );

  return forum_space;
};
