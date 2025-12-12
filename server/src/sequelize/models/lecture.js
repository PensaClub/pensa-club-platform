// server/src/sequelize/models/lecture.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class lecture extends Model {
    static associate(models) {
      // Belongs to course (optional - може да е самостоятелна)
      lecture.belongsTo(models.course, {
        foreignKey: 'courseId',
        targetKey: 'id',
        as: 'course',
      });

      // Belongs to mentor/lecturer
      lecture.belongsTo(models.mentor, {
        foreignKey: 'mentorId',
        targetKey: 'id',
        as: 'lecturer',
      });

      // Has many student_lectures
      lecture.hasMany(models.student_lecture, {
        foreignKey: 'lectureId',
        sourceKey: 'id',
        as: 'attendances',
      });

      // Has many materials
      lecture.hasMany(models.lecture_material, {
        foreignKey: 'lectureId',
        sourceKey: 'id',
        as: 'materials',
      });

      // Belongs to creator
      lecture.belongsTo(models.user_account, {
        foreignKey: 'createdBy',
        targetKey: 'id',
        as: 'creator',
      });
      lecture.hasOne(models.lecture_test, {
        foreignKey: 'lectureId',
        sourceKey: 'id',
        as: 'test',
      });
    }
  }

  lecture.init(
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
      lectureType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'live',
        field: 'lecture_type',
        // live, recorded, hybrid
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

      // === ВИДЕО (за записани лекции) ===
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
        defaultValue: 60,
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
      requiresRegistration: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'requires_registration',
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
    },
    {
      sequelize,
      modelName: 'lecture',
      tableName: 'lectures',
      timestamps: true,
      underscored: true,
    }
  );

  return lecture;
};