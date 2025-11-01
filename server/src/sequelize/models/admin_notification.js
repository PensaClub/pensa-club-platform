// server/models/admin_notification.js

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class admin_notification extends Model {
    static associate(models) {
      // No associations
    }
  }

  admin_notification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      modelName: 'admin_notification',
      tableName: 'admin_notifications',
      timestamps: true,
      underscored: true,  
    }
  );

  return admin_notification;
};