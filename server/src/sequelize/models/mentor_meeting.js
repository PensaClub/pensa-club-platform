'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class mentor_meeting extends Model {
    static associate(models) {
      // Belongs to mentor
      mentor_meeting.belongsTo(models.mentor, {
        foreignKey: 'mentorId',
        targetKey: 'id',
        as: 'mentor',
      });

      // Belongs to student
      mentor_meeting.belongsTo(models.student, {
        foreignKey: 'studentId',
        targetKey: 'id',
        as: 'student',
      });
    }
  }

  mentor_meeting.init(
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
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: true,  // ✅ NULLABLE!
        defaultValue: null,
        references: {
          model: 'students',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Title is required.',
          },
        },
      },
      meetingDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'meeting_date',
      },
      meetingTime: {
        type: DataTypes.TIME,
        allowNull: false,
        field: 'meeting_time',
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60,
        validate: {
          min: {
            args: [1],
            msg: 'Duration must be at least 1 minute.',
          },
        },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'scheduled',
        validate: {
          isIn: {
            args: [['scheduled', 'completed', 'cancelled']],
            msg: 'Status must be one of: scheduled, completed, cancelled',
          },
        },
      },
      meetingType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'viber',  
        field: 'meeting_type',
        validate: {
          isIn: {
            args: [['viber', 'google_meet', 'phone', 'in_person', 'other']], 
            msg: 'Meeting type must be one of: viber, google_meet, phone, in_person, other',
          },
        },
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'completed_at',
      },
      cancelledAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'cancelled_at',
      },
    },
    {
      sequelize,
      modelName: 'mentor_meeting',
      tableName: 'mentor_meetings',
      underscored: true,
    }
  );

  return mentor_meeting;
};