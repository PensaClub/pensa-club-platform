'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ip_visit extends Model {}

  ip_visit.init(
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
        field: 'ip_address',
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'user_agent',
      },
      path: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      visitCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: 'visit_count',
      },
      lastVisitedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'last_visited_at',
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
      },
    },
    {
      sequelize,
      modelName: 'ip_visit',
      tableName: 'ip_visits',
      updatedAt: false,
    }
  );

  return ip_visit;
};
