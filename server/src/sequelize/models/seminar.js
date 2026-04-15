// server/src/sequelize/models/seminar.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class seminar extends Model {
    static associate(models) {
      // Belongs to course (optional)
      seminar.belongsTo(models.course, {
        foreignKey: 'courseId',
        targetKey: 'id',
        as: 'course',
      });

      // Belongs to mentor/facilitator (LEGACY — kept for backwards compat.
      // The single-mentor association below still works for any caller that
      // read `seminar.facilitator`, but new code should use `facilitators`
      // (the seminar_facilitators junction) which supports multiple lecturers
      // of 3 types: mentor / admin / external.
      seminar.belongsTo(models.mentor, {
        foreignKey: 'mentorId',
        targetKey: 'id',
        as: 'facilitator',
      });

      // NEW multi-facilitator association. Each row links to exactly one of
      // mentor / admin user / external_lecturer and carries role + isLead.
      seminar.hasMany(models.seminar_facilitator, {
        foreignKey: 'seminarId',
        sourceKey: 'id',
        as: 'facilitators',
      });

      // Has many student_seminars
      seminar.hasMany(models.student_seminar, {
        foreignKey: 'seminarId',
        sourceKey: 'id',
        as: 'attendances',
      });

      // Has many sessions
      seminar.hasMany(models.seminar_session, {
        foreignKey: 'seminarId',
        sourceKey: 'id',
        as: 'sessions',
      });

      // Has many materials
      seminar.hasMany(models.seminar_material, {
        foreignKey: 'seminarId',
        sourceKey: 'id',
        as: 'materials',
      });
      seminar.hasMany(models.seminar_guest_attendance, {
        foreignKey: 'seminarId',
        sourceKey: 'id',
        as: 'guestAttendances',
      });

      // Has many videos
      seminar.hasMany(models.seminar_video, {
        foreignKey: 'seminarId',
        sourceKey: 'id',
        as: 'videos',
      });

      // Has many reviews
      seminar.hasMany(models.seminar_review, {
        foreignKey: 'seminar_id',
        as: 'reviews',
      });
      // Has many attendance lists (physical)
      seminar.hasMany(models.seminar_attendance_list, {
        foreignKey: 'seminarId',
        sourceKey: 'id',
        as: 'attendanceLists',
      });

      // Has many media (photos, videos, documents, presentations)
      seminar.hasMany(models.seminar_media, {
        foreignKey: 'seminarId',
        sourceKey: 'id',
        as: 'media',
      });

      // Belongs to creator
      seminar.belongsTo(models.user_account, {
        foreignKey: 'createdBy',
        targetKey: 'id',
        as: 'creator',
      });
    }
  }

  seminar.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'course_id',
        references: {
          model: 'courses',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      mentorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'mentor_id',
        references: {
          model: 'mentors',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'created_by',
      },

      // === ОСНОВНА ИНФОРМАЦИЯ ===
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      shortDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'short_description',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // === ТИП И ФОРМАТ ===
      seminarType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'workshop',
        field: 'seminar_type',
        // workshop, discussion, hands_on, q_and_a
      },
      isOnline: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_online',
      },

      // === ЛОКАЦИЯ ===
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      meetingLink: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        field: 'meeting_link',
      },
      meetingPassword: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'meeting_password',
      },

      secondaryLink: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        field: 'secondary_link',
      },

      // === ВИДЕО (за записани семинари) ===
      videoProvider: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'video_provider',
      },
      videoUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        field: 'video_url',
      },
      thumbnailUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        field: 'thumbnail_url',
      },

      // === ВРЕМЕВИ НАСТРОЙКИ ===
      scheduledDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'scheduled_date',
      },
      scheduledEndDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'scheduled_end_date',
      },
      durationMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 90,
        field: 'duration_minutes',
      },
      timezone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Europe/Sofia',
      },

      // === ЗАПИСВАНЕ ===
      maxParticipants: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'max_participants',
      },
      minParticipants: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'min_participants',
      },
      requiresRegistration: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'requires_registration',
      },
      requiresApproval: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'requires_approval',
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_public',
      },

      // === КРЕДИТИ ===
      maxCredits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'max_credits',
      },
      creditsForAttendance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'credits_for_attendance',
      },
      creditsForParticipation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'credits_for_participation',
      },
      creditsForTest: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'credits_for_test',
      },

      // === ТЕСТ ===
      hasTest: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'has_test',
      },
      testPassingScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'test_passing_score',
      },

      // === ЗАДАЧА ===
      hasAssignment: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'has_assignment',
      },
      assignmentDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'assignment_description',
      },

      // === СТАТУС ===
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'scheduled',
        // scheduled, live, completed, cancelled
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_published',
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'published_at',
      },
      cancelledAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'cancelled_at',
      },
      cancelReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'cancel_reason',
      },

      // === СТАТИСТИКИ ===
      registeredCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'registered_count',
      },
      attendedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'attended_count',
      },
      viewsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'views_count',
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true,
      },

      // === МЕТА ===
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      prerequisites: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      whatToBring: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'what_to_bring',
      },
      learningPoints: { // НОВО
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        field: 'learning_points',
      },
    },
    {
      sequelize,
      modelName: 'seminar',
      tableName: 'seminars',
      timestamps: true,
      underscored: true,
    }
  );

  return seminar;
};