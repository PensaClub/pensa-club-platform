// server/sequelize/models/mentor_course.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class mentor_course extends Model {
    static associate(models) {
      // Belongs to mentor
      mentor_course.belongsTo(models.mentor, {
        foreignKey: 'mentorId',
        targetKey: 'id',
        as: 'mentor',
      });
    }
  }

  mentor_course.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      mentorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'mentor_id',
        references: {
          model: 'mentors',
          key: 'id',
        },
      },
      courseName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'course_name',
        validate: {
          notEmpty: {
            msg: 'Course name is required.',
          },
        },
      },
      courseCategory: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'course_category',
        validate: {
          notEmpty: {
            msg: 'Course category is required.',
          },
        },
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
        validate: {
          min: {
            args: [1],
            msg: 'Duration must be at least 1 week.',
          },
        },
      },
      enrolledStudents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'enrolled_students',
        validate: {
          min: {
            args: [0],
            msg: 'Enrolled students cannot be negative.',
          },
        },
      },
      completedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'completed_count',
        validate: {
          min: {
            args: [0],
            msg: 'Completed count cannot be negative.',
          },
        },
      },
      status: {
        type: DataTypes.ENUM('active', 'completed', 'paused'),
        allowNull: false,
        defaultValue: 'active',
        validate: {
          isIn: {
            args: [['active', 'completed', 'paused']],
            msg: 'Status must be one of: active, completed, paused',
          },
        },
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
    },
    {
      sequelize,
      modelName: 'mentor_course',
      tableName: 'mentor_courses',
    }
  );

  return mentor_course;
};