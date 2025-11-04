// server/src/sequelize/models/review.js

'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      // User който е написал review-то
      Review.belongsTo(models.user_account, {
        foreignKey: 'userId',
        as: 'user',
        include: [
          {
            model: models.user_details,
            as: 'details'
          }
        ]
      });

      Review.belongsTo(models.user_account, {
        foreignKey: 'approvedBy',
        as: 'approver'
      });

      Review.belongsTo(models.user_account, {
        foreignKey: 'rejectedBy',
        as: 'rejecter'
      });

      Review.belongsTo(models.mentor, {
        foreignKey: 'targetId',
        as: 'mentor',
        constraints: false,
        scope: {
          reviewType: 'mentor'
        }
      });
    }
  }

  Review.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    reviewType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'review_type'
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'target_id'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'pending'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'rejection_reason'
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'approved_at'
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'approved_by'
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'rejected_at'
    },
    rejectedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'rejected_by'
    }
  }, {
    sequelize,
    modelName: 'review',
    tableName: 'reviews',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Review;
};