'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class push_subscription extends Model {
    static associate(models) {
      push_subscription.belongsTo(models.user_account, { foreignKey: 'userId', as: 'user' });
    }
  }

  push_subscription.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
      endpoint: { type: DataTypes.TEXT, allowNull: false, unique: true },
      keysP256dh: { type: DataTypes.TEXT, allowNull: false, field: 'keys_p256dh' },
      keysAuth: { type: DataTypes.TEXT, allowNull: false, field: 'keys_auth' },
    },
    {
      sequelize,
      modelName: 'push_subscription',
      tableName: 'push_subscriptions',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      underscored: true,
    }
  );

  return push_subscription;
};
