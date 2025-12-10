// server/src/sequelize/models/user_credits.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class user_credits extends Model {
    static associate(models) {
      // Belongs to user
      user_credits.belongsTo(models.user_account, {
        foreignKey: 'userId',
        targetKey: 'id',
        as: 'user',
      });

      // Has many history records
      user_credits.hasMany(models.user_credits_history, {
        foreignKey: 'userId',
        sourceKey: 'userId',
        as: 'history',
      });
    }
  }

  user_credits.init(
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
        unique: true,
        field: 'user_id',
        references: {
          model: 'user_accounts',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      // === ОБЩО КРЕДИТИ ===
      totalCredits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_credits',
      },

      // === КРЕДИТИ ПО КАТЕГОРИИ ===
      creditsByCategory: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
        field: 'credits_by_category',
        // Формат: { "Дигитална грамотност": 65, "Интернет сигурност": 35, ... }
      },

      // === НИВО ===
      level: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'beginner',
        // beginner (0-50), intermediate (51-150), advanced (151-300), master (301+)
      },

      // === СТАТИСТИКИ ===
      coursesCompleted: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'courses_completed',
      },
      lecturesAttended: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'lectures_attended',
      },
      seminarsAttended: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'seminars_attended',
      },
      presentationsViewed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'presentations_viewed',
      },
      testsPassed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'tests_passed',
      },
      certificatesEarned: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'certificates_earned',
      },
    },
    {
      sequelize,
      modelName: 'user_credits',
      tableName: 'user_credits',
      timestamps: true,
      underscored: true,
    }
  );

  return user_credits;
};