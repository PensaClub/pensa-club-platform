// server/src/sequelize/models/user_credits_history.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class user_credits_history extends Model {
    static associate(models) {
      // Belongs to user
      user_credits_history.belongsTo(models.user_account, {
        foreignKey: 'userId',
        targetKey: 'id',
        as: 'user',
      });
    }
  }

  user_credits_history.init(
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
        onDelete: 'CASCADE',
      },

      // === КРЕДИТИ ===
      creditsAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'credits_amount',
        // Може да е положително (+) или отрицателно (-)
      },
      creditsBefore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'credits_before',
      },
      creditsAfter: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'credits_after',
      },

      // === ИЗТОЧНИК ===
      sourceType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'source_type',
        // course, lecture, seminar, presentation, test, bonus, manual, certificate
      },
      sourceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'source_id',
        // ID на курса/лекцията/семинара/etc.
      },
      sourceTitle: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'source_title',
        // Име на курса/лекцията за по-лесно показване
      },

      // === КАТЕГОРИЯ ===
      category: {
        type: DataTypes.STRING,
        allowNull: true,
        // Категорията на съдържанието (за статистики по категории)
      },

      // === ОПИСАНИЕ ===
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        // "Завършен курс: Основи на компютъра"
      },

      // === МЕТА ===
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
        // Допълнителна информация (резултат от тест, и т.н.)
      },
    },
    {
      sequelize,
      modelName: 'user_credits_history',
      tableName: 'user_credits_history',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['user_id'],
        },
        {
          fields: ['source_type'],
        },
        {
          fields: ['created_at'],
        },
      ],
    }
  );

  return user_credits_history;
};