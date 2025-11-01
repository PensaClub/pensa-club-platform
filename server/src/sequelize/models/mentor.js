// server/sequelize/models/mentor.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class mentor extends Model {
    static associate(models) {
      // Belongs to user account
      mentor.belongsTo(models.user_account, {
        foreignKey: 'userId',
        targetKey: 'id',
        as: 'user',
      });

      // Belongs to application
      mentor.belongsTo(models.mentor_application, {
        foreignKey: 'applicationId',
        targetKey: 'id',
        as: 'application',
      });

      // Has many courses
      mentor.hasMany(models.mentor_course, {
        foreignKey: 'mentorId',
        sourceKey: 'id',
        as: 'courses',
      });
    }
  }

  mentor.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'user_id',
        references: {
          model: 'user_accounts',
          key: 'id',
        },
      },
      applicationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'application_id',
        references: {
          model: 'mentor_applications',
          key: 'id',
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      photoUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        defaultValue: null,
        field: 'photo_url',
      },
      specialization: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      education: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      experience: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      motivation: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      availability: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      languages: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
        validate: {
          isArray(value) {
            if (value !== null && !Array.isArray(value)) {
              throw new Error('Languages must be an array of strings.');
            }
          },
        },
      },
      viber: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      facebook: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      linkedin: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      otherContact: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        field: 'other_contact',
      },
      priorityContact: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'email',
        field: 'priority_contact',
      },
      cvUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        defaultValue: null,
        field: 'cv_url',
      },
      cvOriginalName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        field: 'cv_original_name',
      },
      isOnline: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_online',
      },
      studentsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'students_count',
        validate: {
          min: {
            args: [0],
            msg: 'Students count cannot be negative.',
          },
        },
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          min: 0.0,
          max: 5.0,
        },
      },
      sessionsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'sessions_count',
        validate: {
          min: {
            args: [0],
            msg: 'Sessions count cannot be negative.',
          },
        },
      },
      adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        field: 'admin_notes',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        allowNull: false,
        defaultValue: 'active',
        validate: {
          isIn: {
            args: [['active', 'inactive', 'suspended']],
            msg: 'Status must be one of: active, inactive, suspended',
          },
        },
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'approved_at',
      },
      lastActiveAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'last_active_at',
      },
    },
    {
      sequelize,
      modelName: 'mentor',
      tableName: 'mentors',
    }
  );

  return mentor;
};