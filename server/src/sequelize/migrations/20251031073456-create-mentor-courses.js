'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('mentor_courses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      mentor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'mentors',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      course_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Course name is required.',
          },
        },
      },
      course_category: {
        type: DataTypes.STRING,
        allowNull: false,
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
      duration_weeks: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        validate: {
          min: {
            args: [1],
            msg: 'Duration must be at least 1 week.',
          },
        },
      },
      enrolled_students: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: {
            args: [0],
            msg: 'Enrolled students cannot be negative.',
          },
        },
      },
      completed_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },
  
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('mentor_courses');
  },
};