'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class visit_feedback extends Model {
    static associate(models) {
      visit_feedback.belongsTo(models.club_visit_request, {
        foreignKey: 'visitRequestId',
        targetKey: 'id',
        as: 'visitRequest',
      });
      visit_feedback.belongsTo(models.mentor, {
        foreignKey: 'mentorId',
        targetKey: 'id',
        as: 'mentor',
      });
    }
  }

  visit_feedback.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      visitRequestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'visit_request_id',
        references: {
          model: 'club_visit_requests',
          key: 'id',
        },
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
      participantsActual: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'participants_actual',
      },
      topicsCovered: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        field: 'topics_covered',
      },
      challenges: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      highlights: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      recommendations: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        validate: {
          min: 1,
          max: 5,
        },
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
      modelName: 'visit_feedback',
      tableName: 'visit_feedbacks',
    }
  );

  return visit_feedback;
};
