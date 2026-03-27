'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class forum_user_status extends Model {
    static associate(models) {
      forum_user_status.belongsTo(models.user_account, { foreignKey: 'userId', as: 'user' });
      forum_user_status.belongsTo(models.user_account, { foreignKey: 'bannedBy', as: 'bannedByUser' });
    }
  }

  forum_user_status.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: 'user_id' },
      role: { type: DataTypes.ENUM('user', 'vip'), allowNull: false, defaultValue: 'user' },
      isBanned: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_banned' },
      banType: { type: DataTypes.ENUM('mute', 'restricted', 'temp_ban', 'perm_ban'), allowNull: true, field: 'ban_type' },
      banReason: { type: DataTypes.TEXT, allowNull: true, field: 'ban_reason' },
      banExpiresAt: { type: DataTypes.DATE, allowNull: true, field: 'ban_expires_at' },
      bannedBy: { type: DataTypes.INTEGER, allowNull: true, field: 'banned_by' },
      warningCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'warning_count' },
      rulesAcceptedAt: { type: DataTypes.DATE, allowNull: true, field: 'rules_accepted_at' },
      vipGrantedAt: { type: DataTypes.DATE, allowNull: true, field: 'vip_granted_at' },
      vipGrantedBy: { type: DataTypes.ENUM('auto', 'admin'), allowNull: true, field: 'vip_granted_by' },
    },
    {
      sequelize,
      modelName: 'forum_user_status',
      tableName: 'forum_user_statuses',
      timestamps: true,
      underscored: true,
    }
  );

  return forum_user_status;
};
