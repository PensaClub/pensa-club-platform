// server/src/sequelize/models/mentor_course.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class mentor_course extends Model {
    static associate(models) {
      mentor_course.belongsTo(models.mentor, {
        foreignKey: 'mentorId',
        targetKey: 'id',
        as: 'mentor',
      });

      mentor_course.belongsTo(models.course, {
        foreignKey: 'courseId',
        targetKey: 'id',
        as: 'course',
      });

      mentor_course.hasMany(models.student_course, {
        foreignKey: 'mentorCourseId',
        sourceKey: 'id',
        as: 'enrollments',
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
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'course_id',
      },

      // === РОЛЯ НА МЕНТОРА В КУРСА ===
      
      // role: Определя типа на ментора в курса
      // - 'mentor' (default): Стандартен ментор, помага на студенти
      // - 'lecturer': Лектор, води уроците
      // - 'assistant': Асистент, помага на главния ментор
      // - 'guest': Гост-лектор за отделни уроци
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'mentor',
      },

      // isLead: Дали е водещ/главен ментор на курса
      // - true: Главен ментор, отговаря за курса, може да управлява другите ментори
      // - false: Обикновен ментор/асистент
      isLead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_lead',
      },

      // === ИНФОРМАЦИЯ ЗА КУРСА ===
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

      // === ВРЕМЕВИ НАСТРОЙКИ ===
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

      // === СТАТИСТИКИ ===
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

      // === СТАТУС ===
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
        validate: {
          isIn: {
            args: [['active', 'completed', 'paused']],
            msg: 'Status must be one of: active, completed, paused',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'mentor_course',
      tableName: 'mentor_courses',
      timestamps: true,
      underscored: true,
    }
  );

  return mentor_course;
};