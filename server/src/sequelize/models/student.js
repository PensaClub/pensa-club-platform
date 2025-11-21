'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class student extends Model {
    static associate(models) {
      // Belongs to user account
      student.belongsTo(models.user_account, {
        foreignKey: 'userId',
        targetKey: 'id',
        as: 'user',
      });

      // Belongs to current mentor
      student.belongsTo(models.mentor, {
        foreignKey: 'currentMentorId',
        targetKey: 'id',
        as: 'currentMentor',
      });

      // Has many meetings
      student.hasMany(models.mentor_meeting, {
        foreignKey: 'studentId',
        sourceKey: 'id',
        as: 'meetings',
      });
    }
  }

  student.init(
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
      },
      
      // ===============================
      // BASIC INFO
      // ===============================
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null,
        field: 'date_of_birth',
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
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
      },
      emergencyContactName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        field: 'emergency_contact_name',
      },
      emergencyContactPhone: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        field: 'emergency_contact_phone',
      },
      
      // ===============================
      // CREDITS SYSTEM
      // ===============================
      totalCreditsEarned: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_credits_earned',
      },
      totalCreditsPossible: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_credits_possible',
      },
      creditsFromCourses: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'credits_from_courses',
      },
      creditsFromLectures: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'credits_from_lectures',
      },
      creditsFromSeminars: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'credits_from_seminars',
      },
      creditsFromPresentations: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'credits_from_presentations',
      },
      
      // ===============================
      // CURRENT MENTOR
      // ===============================
      currentMentorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'current_mentor_id',
        references: {
          model: 'mentors',
          key: 'id',
        },
      },
      mentorAssignedDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'mentor_assigned_date',
      },
      
      // ===============================
      // ATTENDANCE TRACKING
      // ===============================
      totalScheduledSessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_scheduled_sessions',
      },
      attendedSessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'attended_sessions',
      },
      missedSessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'missed_sessions',
      },
      
      // ===============================
      // MENTOR HELP STATS
      // ===============================
      totalChatSessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_chat_sessions',
      },
      totalChatHours: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false,
        defaultValue: 0.00,
        field: 'total_chat_hours',
      },
      lastChatDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'last_chat_date',
      },
      scheduledMeetings: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'scheduled_meetings',
      },
      completedMeetings: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'completed_meetings',
      },
      
      // ===============================
      // PREFERENCES
      // ===============================
      preferredLanguage: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'bg',
        field: 'preferred_language',
      },
      preferredContactMethod: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'email',
        field: 'preferred_contact_method',
      },
      availabilityNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        field: 'availability_notes',
      },
      
      // ===============================
      // ADMIN & SPECIAL NEEDS
      // ===============================
      adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        field: 'admin_notes',
      },
      specialNeeds: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        field: 'special_needs',
      },
      
      // ===============================
      // STATUS & DATES
      // ===============================
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
        validate: {
          isIn: {
            args: [['active', 'inactive', 'graduated', 'suspended']],
            msg: 'Status must be one of: active, inactive, graduated, suspended',
          },
        },
      },
      registrationDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'registration_date',
      },
      graduationDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'graduation_date',
      },
      lastActiveAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'last_active_at',
      },
    },
    {
      sequelize,
      modelName: 'student',
      tableName: 'students',
       underscored: true,
    }
  );

  return student;
};