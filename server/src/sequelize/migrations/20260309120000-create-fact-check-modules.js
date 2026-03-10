'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('fact_check_modules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },

      // ===============================
      // IDENTIFICATION
      // ===============================
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },

      // ===============================
      // VERDICT & CATEGORY
      // ===============================
      verdict: {
        type: DataTypes.ENUM('false', 'misleading', 'partially_true'),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      // ===============================
      // CONTENT — 4 SECTIONS
      // ===============================
      claim_text: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'The exact claim as it circulates',
      },
      verification: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Factual answer with official source',
      },
      source_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: null,
        comment: 'Link to official source',
      },
      source_name: {
        type: DataTypes.STRING(200),
        allowNull: true,
        defaultValue: null,
        comment: 'Name of the official source',
      },
      why_spreads: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Why this claim spreads, what fears it exploits',
      },
      how_to_react: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '2-3 simple sentences for club conversation',
      },

      // ===============================
      // PDF & STATUS
      // ===============================
      pdf_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: null,
        comment: 'URL to uploaded PDF for print',
      },
      status: {
        type: DataTypes.ENUM('draft', 'published', 'hidden'),
        allowNull: false,
        defaultValue: 'draft',
      },
      views_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      // ===============================
      // TIMESTAMPS
      // ===============================
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });

    // ===============================
    // INDEXES
    // ===============================
    await queryInterface.addIndex('fact_check_modules', ['slug'], {
      name: 'idx_fact_check_modules_slug',
      unique: true,
    });

    await queryInterface.addIndex('fact_check_modules', ['status'], {
      name: 'idx_fact_check_modules_status',
    });

    await queryInterface.addIndex('fact_check_modules', ['category'], {
      name: 'idx_fact_check_modules_category',
    });

    await queryInterface.addIndex('fact_check_modules', ['verdict'], {
      name: 'idx_fact_check_modules_verdict',
    });
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('fact_check_modules');
  },
};
