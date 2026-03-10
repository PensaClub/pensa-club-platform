'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class whitelisted_ip extends Model {}

  whitelisted_ip.init(
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
      label: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      isSystem: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_system',
      },
      addedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'added_by',
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
      },
    },
    {
      sequelize,
      modelName: 'whitelisted_ip',
      tableName: 'whitelisted_ips',
      updatedAt: false,
    }
  );

  return whitelisted_ip;
};
