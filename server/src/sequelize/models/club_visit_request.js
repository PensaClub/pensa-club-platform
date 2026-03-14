'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class club_visit_request extends Model {
    static associate(models) {
      club_visit_request.belongsTo(models.user_account, {
        foreignKey: 'userId',
        targetKey: 'id',
        as: 'user',
      });
      club_visit_request.belongsTo(models.mentor, {
        foreignKey: 'assignedMentorId',
        targetKey: 'id',
        as: 'assignedMentor',
      });
      club_visit_request.hasOne(models.visit_feedback, {
        foreignKey: 'visitRequestId',
        sourceKey: 'id',
        as: 'feedback',
      });
      club_visit_request.hasMany(models.visit_testimonial, {
        foreignKey: 'visitRequestId',
        sourceKey: 'id',
        as: 'testimonials',
      });
    }
  }

  club_visit_request.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      trackingCode: {
        type: DataTypes.STRING(12),
        allowNull: false,
        unique: true,
        field: 'tracking_code',
      },
      clubName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'club_name',
        validate: {
          notEmpty: { msg: 'Club name is required.' },
        },
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'City is required.' },
        },
      },
      participantsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'participants_count',
      },
      topic: {
        type: DataTypes.ENUM('fake_news', 'voter_rights', 'election_process', 'other'),
        allowNull: false,
        validate: {
          isIn: {
            args: [['fake_news', 'voter_rights', 'election_process', 'other']],
            msg: 'Topic must be a valid option',
          },
        },
      },
      topicOther: {
        type: DataTypes.STRING(200),
        allowNull: true,
        defaultValue: null,
        field: 'topic_other',
      },
      preferredDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'preferred_date',
      },
      contactName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'contact_name',
        validate: {
          notEmpty: { msg: 'Contact name is required.' },
        },
      },
      contactPhone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'contact_phone',
      },
      contactEmail: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'contact_email',
        validate: {
          isEmail: {
            msg: 'Email format is incorrect.',
          },
        },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: DataTypes.ENUM('new', 'reviewing', 'mentor_assigned', 'confirmed', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'new',
        validate: {
          isIn: {
            args: [['new', 'reviewing', 'mentor_assigned', 'confirmed', 'completed', 'cancelled']],
            msg: 'Status must be a valid option',
          },
        },
      },
      assignedMentorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'assigned_mentor_id',
        references: {
          model: 'mentors',
          key: 'id',
        },
      },
      adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        field: 'admin_notes',
      },
      cancelReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        field: 'cancel_reason',
      },
      confirmedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'confirmed_at',
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
      reportedProblem: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        field: 'reported_problem',
      },
      reportedProblemAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'reported_problem_at',
      },
      reminderSent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'reminder_sent',
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        defaultValue: null,
        field: 'ip_address',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'user_id',
        references: {
          model: 'user_accounts',
          key: 'id',
        },
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        field: 'user_agent',
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      modelName: 'club_visit_request',
      tableName: 'club_visit_requests',
    }
  );

  return club_visit_request;
};
