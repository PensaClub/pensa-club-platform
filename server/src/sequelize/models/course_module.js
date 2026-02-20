// server/src/sequelize/models/course_module.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class course_module extends Model {
    static associate(models) {
      // Belongs to course
      course_module.belongsTo(models.course, {
        foreignKey: 'courseId',
        targetKey: 'id',
        as: 'course',
      });

      // Has many lessons
      course_module.hasMany(models.lesson, {
        foreignKey: 'moduleId',
        sourceKey: 'id',
        as: 'lessons',
      });
       // Belongs to mentor (optional)
      course_module.belongsTo(models.mentor, {
        foreignKey: 'mentorId',
        targetKey: 'id',
        as: 'mentor',
      });
    }
  }

  course_module.init(
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

      // === ОСНОВНА ИНФОРМАЦИЯ ===
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
// === ВРЕМЕВИ НАСТРОЙКИ ===
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
      estimatedHours: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'estimated_hours',
      },
      // === СТАТИСТИКИ ===
      lessonsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'lessons_count',
      },
      totalDurationMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_duration_minutes',
      },
      mentorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'mentor_id',
        references: {
          model: 'mentors',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
    },
    {
      sequelize,
      modelName: 'course_module',
      tableName: 'course_modules',
      timestamps: true,
      underscored: true,
      
    },

  );

  return course_module;
};