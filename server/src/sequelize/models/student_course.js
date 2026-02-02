// server/src/sequelize/models/student_course.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class student_course extends Model {
    static associate(models) {
      // Belongs to student
      student_course.belongsTo(models.student, {
        foreignKey: 'studentId',
        targetKey: 'id',
        as: 'student',
      });

      // Belongs to course
      student_course.belongsTo(models.course, {
        foreignKey: 'courseId',
        targetKey: 'id',
        as: 'course',
      });

      // Belongs to mentor_course (optional)
      student_course.belongsTo(models.mentor_course, {
        foreignKey: 'mentorCourseId',
        targetKey: 'id',
        as: 'mentorCourse',
      });

      // Current lesson being studied
      student_course.belongsTo(models.lesson, {
        foreignKey: 'currentLessonId',
        targetKey: 'id',
        as: 'currentLesson',
      });
    }
  }

  student_course.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'student_id',
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'course_id',
      },
      mentorCourseId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'mentor_course_id',
      },
      currentLessonId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'current_lesson_id',
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
        // active, completed, dropped, paused
      },
      progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      progressPercentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'progress_percentage',
      },
      completedLessons: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'completed_lessons',
      },
      totalLessons: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_lessons',
      },
      earnedCredits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'earned_credits',
      },
      totalCreditsEarned: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_credits_earned',
      },
      maxCredits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'max_credits',
      },
      enrolledAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        field: 'enrolled_at',
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'start_date',
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'end_date',
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'completed_at',
      },
      lastAccessedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'last_accessed_at',
      },
    },
    {
      sequelize,
      modelName: 'student_course',
      tableName: 'student_courses',
      underscored: true,
    }
  );

  return student_course;
};