'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('fact_check_signals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },

      // ===============================
      // SIGNAL CONTENT
      // ===============================
      claim_text: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'The claim the citizen heard',
      },
      source_type: {
        type: DataTypes.ENUM(
          'website', 'internet', 'newspapers', 'news_tv',
          'friends', 'email', 'phone', 'anonymous_call', 'other'
        ),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
      },

      // ===============================
      // REPORTER INFO
      // ===============================
      reporter_email: {
        type: DataTypes.STRING(200),
        allowNull: true,
        defaultValue: null,
        comment: 'Optional email for feedback',
      },
      is_confidential: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      // ===============================
      // ADMIN MANAGEMENT
      // ===============================
      status: {
        type: DataTypes.ENUM('new', 'in_review', 'resolved', 'dismissed'),
        allowNull: false,
        defaultValue: 'new',
      },
      admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        comment: 'Internal notes by admin/moderator',
      },
      related_module_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'fact_check_modules',
          key: 'id',
        },
        onDelete: 'SET NULL',
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
    await queryInterface.addIndex('fact_check_signals', ['status'], {
      name: 'idx_fact_check_signals_status',
    });

    await queryInterface.addIndex('fact_check_signals', ['source_type'], {
      name: 'idx_fact_check_signals_source_type',
    });

    await queryInterface.addIndex('fact_check_signals', ['related_module_id'], {
      name: 'idx_fact_check_signals_related_module',
    });
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('fact_check_signals');
  },
};
