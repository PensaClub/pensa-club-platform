'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class fact_check_signal extends Model {
    static associate(models) {
      fact_check_signal.belongsTo(models.fact_check_module, {
        foreignKey: 'relatedModuleId',
        targetKey: 'id',
        as: 'module',
      });
    }
  }

  fact_check_signal.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      claimText: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'claim_text',
        validate: {
          notEmpty: { msg: 'Claim text is required.' },
        },
      },
      sourceType: {
        type: DataTypes.ENUM(
          'website', 'internet', 'newspapers', 'news_tv',
          'friends', 'email', 'phone', 'anonymous_call', 'other'
        ),
        allowNull: false,
        field: 'source_type',
        validate: {
          isIn: {
            args: [['website', 'internet', 'newspapers', 'news_tv', 'friends', 'email', 'phone', 'anonymous_call', 'other']],
            msg: 'Source type must be a valid option',
          },
        },
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      reporterEmail: {
        type: DataTypes.STRING(200),
        allowNull: true,
        defaultValue: null,
        field: 'reporter_email',
        validate: {
          isEmail: {
            msg: 'Email format is incorrect.',
          },
        },
      },
      isConfidential: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_confidential',
      },
      status: {
        type: DataTypes.ENUM('new', 'in_review', 'resolved', 'dismissed'),
        allowNull: false,
        defaultValue: 'new',
        validate: {
          isIn: {
            args: [['new', 'in_review', 'resolved', 'dismissed']],
            msg: 'Status must be one of: new, in_review, resolved, dismissed',
          },
        },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        field: 'admin_notes',
      },
      relatedModuleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'related_module_id',
        references: {
          model: 'fact_check_modules',
          key: 'id',
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      modelName: 'fact_check_signal',
      tableName: 'fact_check_signals',
    }
  );

  return fact_check_signal;
};
