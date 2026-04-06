'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class seminar_monthly_report extends Model {
    static associate(models) {
      seminar_monthly_report.belongsTo(models.user_account, {
        foreignKey: 'generatedBy',
        targetKey: 'id',
        as: 'generator',
      });
    }
  }

  seminar_monthly_report.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      month: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fileUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'file_url',
      },
      generatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'generated_by',
      },
      seminarsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'seminars_count',
      },
      attendeesCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'attendees_count',
      },
      creditsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'credits_count',
      },
    },
    {
      sequelize,
      modelName: 'seminar_monthly_report',
      tableName: 'seminar_monthly_reports',
      underscored: true,
      timestamps: true,
    }
  );

  return seminar_monthly_report;
};
