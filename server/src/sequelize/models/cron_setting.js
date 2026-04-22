'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class cron_setting extends Model {}

  cron_setting.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      key: {
        type: DataTypes.STRING(80),
        allowNull: false,
        unique: true,
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      schedule: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      timezone: {
        type: DataTypes.STRING(60),
        allowNull: false,
        defaultValue: 'Europe/Sofia',
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      lastRunAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_run_at',
      },
      lastRunStatus: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'last_run_status',
      },
      lastRunSubscribers: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'last_run_subscribers',
      },
      lastRunDurationMs: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'last_run_duration_ms',
      },
      lastRunError: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'last_run_error',
      },
    },
    {
      sequelize,
      modelName: 'cron_setting',
      tableName: 'cron_settings',
      timestamps: true,
      underscored: true,
    },
  );

  return cron_setting;
};
