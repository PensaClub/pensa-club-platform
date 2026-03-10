'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class blocked_ip extends Model {}

  blocked_ip.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: false,
        unique: true,
        field: 'ip_address',
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      blockedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'blocked_by',
      },
      blockedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'blocked_at',
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
      },
    },
    {
      sequelize,
      modelName: 'blocked_ip',
      tableName: 'blocked_ips',
      updatedAt: false,
    }
  );

  return blocked_ip;
};
