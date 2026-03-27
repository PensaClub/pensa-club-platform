'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class forum_space_member extends Model {
    static associate(models) {
      forum_space_member.belongsTo(models.forum_space, { foreignKey: 'spaceId', as: 'space' });
      forum_space_member.belongsTo(models.user_account, { foreignKey: 'userId', as: 'user' });
    }
  }

  forum_space_member.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      spaceId: { type: DataTypes.INTEGER, allowNull: false, field: 'space_id' },
      userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
      role: { type: DataTypes.ENUM('member', 'moderator'), allowNull: false, defaultValue: 'member' },
      joinedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'joined_at' },
    },
    {
      sequelize,
      modelName: 'forum_space_member',
      tableName: 'forum_space_members',
      timestamps: false,
      underscored: true,
    }
  );

  return forum_space_member;
};
