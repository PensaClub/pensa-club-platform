'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class forum_poll extends Model {
    static associate(models) {
      forum_poll.belongsTo(models.forum_post, { foreignKey: 'postId', as: 'post' });
      forum_poll.hasMany(models.forum_poll_vote, { foreignKey: 'pollId', as: 'votes' });
    }
  }

  forum_poll.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      postId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: 'post_id' },
      question: { type: DataTypes.STRING(500), allowNull: false },
      options: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      isMultipleChoice: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_multiple_choice' },
      expiresAt: { type: DataTypes.DATE, allowNull: true, field: 'expires_at' },
      totalVotes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'total_votes' },
    },
    {
      sequelize,
      modelName: 'forum_poll',
      tableName: 'forum_polls',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      underscored: true,
    }
  );

  return forum_poll;
};
