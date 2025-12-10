// server/src/sequelize/models/course.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class course extends Model {
    static associate(models) {
      // Has many mentor_courses (instances)
      course.hasMany(models.mentor_course, {
        foreignKey: 'courseId',
        sourceKey: 'id',
        as: 'instances',
      });

      // Has many student_courses
      course.hasMany(models.student_course, {
        foreignKey: 'courseId',
        sourceKey: 'id',
        as: 'enrollments',
      });

      // Has many modules
      course.hasMany(models.course_module, {
        foreignKey: 'courseId',
        sourceKey: 'id',
        as: 'modules',
      });

      // Has many lessons (директно към курса)
      course.hasMany(models.lesson, {
        foreignKey: 'courseId',
        sourceKey: 'id',
        as: 'lessons',
      });

      // Has many materials (директно към курса)
      course.hasMany(models.course_material, {
        foreignKey: 'courseId',
        sourceKey: 'id',
        as: 'materials',
      });

      // Has many certificates
      course.hasMany(models.certificate, {
        foreignKey: 'courseId',
        sourceKey: 'id',
        as: 'certificates',
      });

      // Has many lectures
      course.hasMany(models.lecture, {
        foreignKey: 'courseId',
        sourceKey: 'id',
        as: 'lectures',
      });

      // Has many seminars
      course.hasMany(models.seminar, {
        foreignKey: 'courseId',
        sourceKey: 'id',
        as: 'seminars',
      });

      // Has many presentations
      course.hasMany(models.presentation, {
        foreignKey: 'courseId',
        sourceKey: 'id',
        as: 'presentations',
      });

      // Belongs to creator
      course.belongsTo(models.user_account, {
        foreignKey: 'createdBy',
        targetKey: 'id',
        as: 'creator',
      });
    }
  }

  course.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
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
      name: {
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
        allowNull: false,
      },

      // === ТИП И ФОРМАТ ===
      courseType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'recorded',
        field: 'course_type',
      },
      difficultyLevel: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'beginner',
        field: 'difficulty_level',
      },

      // === ВИДЕО НАСТРОЙКИ ===
      videoProvider: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'video_provider',
      },
      trailerUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        field: 'trailer_url',
      },
      thumbnailUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        field: 'thumbnail_url',
      },

      // === ВРЕМЕВИ НАСТРОЙКИ ===
      durationWeeks: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'duration_weeks',
      },
      estimatedHours: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'estimated_hours',
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'start_date',
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'end_date',
      },

      // === ЗАПИСВАНЕ ===
      maxParticipants: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'max_participants',
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
      creditsForCompletion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'credits_for_completion',
      },
      hasCertificate: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'has_certificate',
      },

      // === СТАТУС ===
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'draft',
      },
      isDraft: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_draft',
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'published_at',
      },

      // === СТАТИСТИКИ ===
      totalLessons: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_lessons',
      },
      enrolledCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'enrolled_count',
      },
      completedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'completed_count',
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
      targetAudience: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
        field: 'target_audience',
      },
    },
    {
      sequelize,
      modelName: 'course',
      tableName: 'courses',
      timestamps: true,
      underscored: true,
    }
  );

  return course;
};