// server/src/sequelize/models/user_notification.js

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class user_notification extends Model {
    static associate(models) {
      // ✅ Асоциация с user_account
      user_notification.belongsTo(models.user_account, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }

  user_notification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        // ❌ МАХНИ references от тук - миграцията ще го създаде!
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      data: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'read_at',
      },
    },
    {
      sequelize,
      modelName: 'user_notification',
      tableName: 'user_notifications',
      timestamps: true,
      underscored: true,
    }
  );

  return user_notification;
};