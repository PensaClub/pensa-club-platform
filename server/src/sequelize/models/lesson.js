// server/src/sequelize/models/lesson.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class lesson extends Model {
    static associate(models) {
      // Belongs to course (задължително)
      lesson.belongsTo(models.course, {
        foreignKey: 'courseId',
        targetKey: 'id',
        as: 'course',
      });

      // Belongs to mentor (optional)
      lesson.belongsTo(models.mentor, {
        foreignKey: 'mentorId',
        targetKey: 'id',
        as: 'mentor',
      });

      // Belongs to module (optional)
      lesson.belongsTo(models.course_module, {
        foreignKey: 'moduleId',
        targetKey: 'id',
        as: 'module',
      });

      // Belongs to creator
      lesson.belongsTo(models.user_account, {
        foreignKey: 'createdBy',
        targetKey: 'id',
        as: 'creator',
      });

      // Has many materials
      lesson.hasMany(models.lesson_material, {
        foreignKey: 'lessonId',
        sourceKey: 'id',
        as: 'materials',
      });

      // Has many tests
      lesson.hasMany(models.lesson_test, {
        foreignKey: 'lessonId',
        sourceKey: 'id',
        as: 'tests',
      });

      // Has many student progress
      lesson.hasMany(models.student_lesson, {
        foreignKey: 'lessonId',
        sourceKey: 'id',
        as: 'studentProgress',
      });
    }
  }

  lesson.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'course_id',
        references: {
          model: 'courses',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      moduleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'module_id',
        references: {
          model: 'course_modules',
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
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // === ПОДРЕДБА ===
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'sort_order',
      },

      // === ТИП И ФОРМАТ ===
      lessonType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'video',
        field: 'lesson_type',
      },

      // === ВИДЕО НАСТРОЙКИ ===
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
      liveStreamUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        field: 'live_stream_url',
      },
      thumbnailUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        field: 'thumbnail_url',
      },

      // === ВРЕМЕВИ НАСТРОЙКИ ===
      durationMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'duration_minutes',
      },
      scheduledDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'scheduled_date',
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'end_date',
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
      creditsForTest: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'credits_for_test',
      },

      // === ТЕСТ НАСТРОЙКИ ===
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

      // === ИЗИСКВАНИЯ ===
      requiresCompletion: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'requires_completion',
      },
      prerequisiteLessonId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'prerequisite_lesson_id',
      },

      // === СТАТУС ===
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'draft',
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

      // === ДОСТЪП ===
      isFree: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_free',
      },

      // === СТАТИСТИКИ ===
      viewsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'views_count',
      },
      completedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'completed_count',
      },
    },
    {
      sequelize,
      modelName: 'lesson',
      tableName: 'lessons',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['course_id', 'slug'],
        },
      ],
    }
  );

  return lesson;
};