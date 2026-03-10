'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class fact_check_module extends Model {
    static associate(models) {
      fact_check_module.hasMany(models.fact_check_signal, {
        foreignKey: 'relatedModuleId',
        sourceKey: 'id',
        as: 'signals',
      });
    }
  }

  fact_check_module.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: 'Slug is required.' },
        },
      },
      verdict: {
        type: DataTypes.ENUM('false', 'misleading', 'partially_true', 'true'),
        allowNull: false,
        validate: {
          isIn: {
            args: [['false', 'misleading', 'partially_true', 'true']],
            msg: 'Verdict must be one of: false, misleading, partially_true, true',
          },
        },
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Category is required.' },
        },
      },
      claimText: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'claim_text',
        validate: {
          notEmpty: { msg: 'Claim text is required.' },
        },
      },
      verification: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Verification text is required.' },
        },
      },
      sourceUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: null,
        field: 'source_url',
      },
      sourceName: {
        type: DataTypes.STRING(200),
        allowNull: true,
        defaultValue: null,
        field: 'source_name',
      },
      whySpreads: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'why_spreads',
        validate: {
          notEmpty: { msg: 'Why spreads text is required.' },
        },
      },
      howToReact: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'how_to_react',
        validate: {
          notEmpty: { msg: 'How to react text is required.' },
        },
      },
      pdfUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: null,
        field: 'pdf_url',
      },
      status: {
        type: DataTypes.ENUM('draft', 'published', 'hidden'),
        allowNull: false,
        defaultValue: 'draft',
        validate: {
          isIn: {
            args: [['draft', 'published', 'hidden']],
            msg: 'Status must be one of: draft, published, hidden',
          },
        },
      },
      viewsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'views_count',
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
      modelName: 'fact_check_module',
      tableName: 'fact_check_modules',
    }
  );

  return fact_check_module;
};
