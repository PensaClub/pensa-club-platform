'use strict';

module.exports = (sequelize, DataTypes) => {
  const MentorActivitySnapshot = sequelize.define('mentor_activity_snapshot', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    mentorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'mentor_id'
    },
    snapshotDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'snapshot_date'
    },
    
    // Firebase stats
    firebaseSessionsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'firebase_sessions_count'
    },
    firebaseActiveSessions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'firebase_active_sessions'
    },
    firebaseCompletedSessions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'firebase_completed_sessions'
    },
    firebaseOnlineMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'firebase_online_minutes'
    },
    firebaseMessagesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'firebase_messages_count'
    },
    firebaseAvgResponseTime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'firebase_avg_response_time'
    },
    
    // PostgreSQL stats
    postgresSessionsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'postgres_sessions_count'
    },
    postgresStudentsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'postgres_students_count'
    },
    postgresRating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0,
      field: 'postgres_rating'
    },
    
    // Aggregated
    totalSessions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_sessions'
    },
    
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at'
    }
  }, {
    tableName: 'mentor_activity_snapshots',
    timestamps: false
  });

  MentorActivitySnapshot.associate = (models) => {
    MentorActivitySnapshot.belongsTo(models.mentor, {
      foreignKey: 'mentorId',
      as: 'mentor'
    });
  };

  return MentorActivitySnapshot;
};