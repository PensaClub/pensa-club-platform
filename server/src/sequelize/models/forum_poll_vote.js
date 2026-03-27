'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class forum_poll_vote extends Model {
    static associate(models) {
      forum_poll_vote.belongsTo(models.forum_poll, { foreignKey: 'pollId', as: 'poll' });
      forum_poll_vote.belongsTo(models.user_account, { foreignKey: 'userId', as: 'user' });
    }
  }

  forum_poll_vote.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      pollId: { type: DataTypes.INTEGER, allowNull: false, field: 'poll_id' },
      userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
      optionId: { type: DataTypes.STRING(50), allowNull: false, field: 'option_id' },
    },
    {
      sequelize,
      modelName: 'forum_poll_vote',
      tableName: 'forum_poll_votes',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      underscored: true,
    }
  );

  return forum_poll_vote;
};
