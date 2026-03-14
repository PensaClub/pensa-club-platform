'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('club_visit_requests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },

      // ===============================
      // TRACKING
      // ===============================
      tracking_code: {
        type: DataTypes.STRING(12),
        allowNull: false,
        unique: true,
      },

      // ===============================
      // CLUB INFO
      // ===============================
      club_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      participants_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // ===============================
      // TOPIC
      // ===============================
      topic: {
        type: DataTypes.ENUM('fake_news', 'voter_rights', 'election_process', 'other'),
        allowNull: false,
      },
      topic_other: {
        type: DataTypes.STRING(200),
        allowNull: true,
        defaultValue: null,
      },

      // ===============================
      // SCHEDULING
      // ===============================
      preferred_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      // ===============================
      // CONTACT INFO
      // ===============================
      contact_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      contact_phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      contact_email: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },

      // ===============================
      // STATUS & ASSIGNMENT
      // ===============================
      status: {
        type: DataTypes.ENUM('new', 'reviewing', 'mentor_assigned', 'confirmed', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'new',
      },
      assigned_mentor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'mentors',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      cancel_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },

      // ===============================
      // STATUS TIMESTAMPS
      // ===============================
      confirmed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },

      // ===============================
      // REMINDERS
      // ===============================
      reminder_sent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      // ===============================
      // ANTI-SPAM
      // ===============================
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
        defaultValue: null,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
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
    await queryInterface.addIndex('club_visit_requests', ['tracking_code'], {
      name: 'idx_club_visit_requests_tracking_code',
    });

    await queryInterface.addIndex('club_visit_requests', ['status'], {
      name: 'idx_club_visit_requests_status',
    });

    await queryInterface.addIndex('club_visit_requests', ['preferred_date'], {
      name: 'idx_club_visit_requests_preferred_date',
    });

    await queryInterface.addIndex('club_visit_requests', ['assigned_mentor_id'], {
      name: 'idx_club_visit_requests_assigned_mentor',
    });
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('club_visit_requests');
  },
};
