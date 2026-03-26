'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class forum_reaction extends Model {
    static associate(models) {
      forum_reaction.belongsTo(models.user_account, { foreignKey: 'userId', as: 'user' });
    }
  }

  forum_reaction.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
      targetType: { type: DataTypes.ENUM('post', 'comment'), allowNull: false, field: 'target_type' },
      targetId: { type: DataTypes.INTEGER, allowNull: false, field: 'target_id' },
      emoji: { type: DataTypes.STRING(10), allowNull: false },
    },
    {
      sequelize,
      modelName: 'forum_reaction',
      tableName: 'forum_reactions',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      underscored: true,
    }
  );

  return forum_reaction;
};
