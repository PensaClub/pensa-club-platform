'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('students', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'user_accounts',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      
      // ===============================
      // BASIC INFO
      // ===============================
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: 'Can be calculated from date_of_birth'
      },
      avatar: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        defaultValue: null,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      country: {
        type: DataTypes.STRING(2),
        allowNull: false,
        defaultValue: 'BG',
        comment: 'ISO country code: BG, DE, AT, etc'
      },
      emergency_contact_name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      emergency_contact_phone: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      
      // ===============================
      // CREDITS SYSTEM
      // ===============================
      total_credits_earned: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total credits earned across all activities'
      },
      total_credits_possible: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Maximum possible credits from enrolled activities'
      },
      credits_from_courses: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      credits_from_lectures: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      credits_from_seminars: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      credits_from_presentations: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      
      // ===============================
      // CURRENT MENTOR
      // ===============================
      current_mentor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'mentors',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      mentor_assigned_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      
      // ===============================
      // ATTENDANCE TRACKING
      // ===============================
      total_scheduled_sessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      attended_sessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      missed_sessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      
      // ===============================
      // MENTOR HELP STATS
      // ===============================
      total_chat_sessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total completed chat sessions with mentors'
      },
      total_chat_hours: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Total hours spent in chat sessions'
      },
      last_chat_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      scheduled_meetings: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Currently scheduled meetings count'
      },
      completed_meetings: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total completed meetings count'
      },
      
      // ===============================
      // PREFERENCES
      // ===============================
      preferred_language: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'bg',
        comment: 'Preferred language: bg, en, de'
      },
      preferred_contact_method: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'email',
        comment: 'email, phone, viber, facebook, etc'
      },
      availability_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        comment: 'Student availability preferences (e.g., "Weekdays after 5pm")'
      },
      
      // ===============================
      // ADMIN & SPECIAL NEEDS
      // ===============================
      admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        comment: 'Private notes visible only to admins and mentors'
      },
      special_needs: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        comment: 'Accessibility requirements, health considerations, etc'
      },
      
      // ===============================
      // STATUS & DATES
      // ===============================
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
        comment: 'active, inactive, graduated, suspended'
      },
      registration_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      graduation_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      last_active_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        comment: 'Last time student was active in the system'
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
    await queryInterface.addIndex('students', ['user_id'], {
      name: 'idx_students_user',
      unique: true
    });

    await queryInterface.addIndex('students', ['current_mentor_id'], {
      name: 'idx_students_current_mentor'
    });

    await queryInterface.addIndex('students', ['status'], {
      name: 'idx_students_status'
    });

    await queryInterface.addIndex('students', ['registration_date'], {
      name: 'idx_students_registration_date'
    });

    await queryInterface.addIndex('students', ['country'], {
      name: 'idx_students_country'
    });
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('students');
  },
};