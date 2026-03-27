'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class forum_punishment_log extends Model {
    static associate(models) {
      forum_punishment_log.belongsTo(models.user_account, { foreignKey: 'userId', as: 'user' });
      forum_punishment_log.belongsTo(models.user_account, { foreignKey: 'adminId', as: 'admin' });
      forum_punishment_log.belongsTo(models.forum_post, { foreignKey: 'relatedPostId', as: 'relatedPost' });
      forum_punishment_log.belongsTo(models.forum_comment, { foreignKey: 'relatedCommentId', as: 'relatedComment' });
    }
  }

  forum_punishment_log.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
      adminId: { type: DataTypes.INTEGER, allowNull: false, field: 'admin_id' },
      action: {
        type: DataTypes.ENUM('warning', 'mute', 'restrict', 'temp_ban', 'perm_ban', 'unban', 'vip_grant', 'vip_revoke'),
        allowNull: false,
      },
      reason: { type: DataTypes.TEXT, allowNull: false },
      duration: { type: DataTypes.INTEGER, allowNull: true },
      expiresAt: { type: DataTypes.DATE, allowNull: true, field: 'expires_at' },
      relatedPostId: { type: DataTypes.INTEGER, allowNull: true, field: 'related_post_id' },
      relatedCommentId: { type: DataTypes.INTEGER, allowNull: true, field: 'related_comment_id' },
    },
    {
      sequelize,
      modelName: 'forum_punishment_log',
      tableName: 'forum_punishment_logs',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      underscored: true,
    }
  );

  return forum_punishment_log;
};
