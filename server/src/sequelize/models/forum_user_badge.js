'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class forum_user_badge extends Model {
    static associate(models) {
      forum_user_badge.belongsTo(models.user_account, { foreignKey: 'userId', as: 'user' });
    }
  }

  forum_user_badge.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
      badge: { type: DataTypes.STRING(50), allowNull: false },
      awardedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'awarded_at' },
    },
    {
      sequelize,
      modelName: 'forum_user_badge',
      tableName: 'forum_user_badges',
      timestamps: false,
      underscored: true,
    }
  );

  return forum_user_badge;
};
