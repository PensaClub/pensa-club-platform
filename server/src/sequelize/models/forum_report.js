'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class forum_report extends Model {
    static associate(models) {
      forum_report.belongsTo(models.user_account, { foreignKey: 'reporterId', as: 'reporter' });
      forum_report.belongsTo(models.user_account, { foreignKey: 'reviewedBy', as: 'reviewer' });
    }
  }

  forum_report.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      reporterId: { type: DataTypes.INTEGER, allowNull: false, field: 'reporter_id' },
      targetType: { type: DataTypes.ENUM('post', 'comment'), allowNull: false, field: 'target_type' },
      targetId: { type: DataTypes.INTEGER, allowNull: false, field: 'target_id' },
      reason: { type: DataTypes.ENUM('spam', 'inappropriate', 'harassment', 'misinformation', 'other'), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      status: { type: DataTypes.ENUM('pending', 'reviewed', 'dismissed'), allowNull: false, defaultValue: 'pending' },
      reviewedBy: { type: DataTypes.INTEGER, allowNull: true, field: 'reviewed_by' },
    },
    {
      sequelize,
      modelName: 'forum_report',
      tableName: 'forum_reports',
      timestamps: true,
      underscored: true,
    }
  );

  return forum_report;
};
