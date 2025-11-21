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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      durationWeeks: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'duration_weeks',
      },
      totalLessons: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_lessons',
      },
      maxCredits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'max_credits',
      },
      difficultyLevel: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'beginner',
        field: 'difficulty_level',
      },
      courseType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'online',
        field: 'course_type',
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'draft',
      },
      thumbnailUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        defaultValue: null,
        field: 'thumbnail_url',
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'created_by',
      },
    },
    {
      sequelize,
      modelName: 'course',
      tableName: 'courses',
      underscored: true,
    }
  );

  return course;
};