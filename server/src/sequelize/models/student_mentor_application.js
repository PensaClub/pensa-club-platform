'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class student_mentor_application extends Model {
    static associate(models) {
      // Belongs to user
      student_mentor_application.belongsTo(models.user_account, {
        foreignKey: 'userId',
        targetKey: 'id',
        as: 'user',
      });

      // Belongs to mentor
      student_mentor_application.belongsTo(models.mentor, {
        foreignKey: 'mentorId',
        targetKey: 'id',
        as: 'mentor',
      });
    }
  }

  student_mentor_application.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'user_accounts',
          key: 'id',
        },
      },
      mentorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'mentor_id',
        references: {
          model: 'mentors',
          key: 'id',
        },
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        field: 'rejection_reason',
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'approved_at',
      },
      rejectedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'rejected_at',
      },
    },
    {
      sequelize,
      modelName: 'student_mentor_application',
      tableName: 'student_mentor_applications',
      underscored: true,
    }
  );

  return student_mentor_application;
};