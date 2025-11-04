// server/src/services/mentorActivitySnapshotService.js

const { Op } = require('sequelize');
const { getAllMentorsCombinedStats } = require('./mentorActivityService');
const { mentor_activity_snapshot, sequelize } = require('../sequelize/models/index');

/**
 * Създава daily snapshot за всички ментори
 * Извиква се от cron job всяка нощ в 00:00
 */
const createDailySnapshots = async () => {
  try {
    
    const mentors = await getAllMentorsCombinedStats();
    const today = new Date().toISOString().split('T')[0]; 
    
    const snapshots = [];
    
    for (const mentor of mentors) {
      const snapshot = {
        mentorId: mentor.id,
        snapshotDate: today,
        
        // Firebase stats
        firebaseSessionsCount: mentor.firebaseStats.totalSessions || 0,
        firebaseActiveSessions: mentor.firebaseStats.activeSessions || 0,
        firebaseCompletedSessions: mentor.firebaseStats.completedSessions || 0,
        firebaseOnlineMinutes: mentor.firebaseStats.totalOnlineMinutes || 0,
        firebaseMessagesCount: mentor.firebaseStats.totalMessages || 0,
        firebaseAvgResponseTime: mentor.firebaseStats.averageResponseTime || 0,
        
        // PostgreSQL stats
        postgresSessionsCount: mentor.sessionsCount || 0,
        postgresStudentsCount: mentor.studentsCount || 0,
        postgresRating: mentor.rating || 0,
        
        // Aggregated
        totalSessions: mentor.sessionsCount || 0
      };
      
      snapshots.push(snapshot);
    }
    
    // Bulk insert (upsert)
    await mentor_activity_snapshot.bulkCreate(snapshots, {
      updateOnDuplicate: [
        'firebaseSessionsCount',
        'firebaseActiveSessions',
        'firebaseCompletedSessions',
        'firebaseOnlineMinutes',
        'firebaseMessagesCount',
        'firebaseAvgResponseTime',
        'postgresSessionsCount',
        'postgresStudentsCount',
        'postgresRating',
        'totalSessions'
      ]
    });
    
    return { success: true, count: snapshots.length };
    
  } catch (error) {
    console.error('❌ Error creating daily snapshots:', error);
    throw error;
  }
};

/**
 * Вземи исторически данни за activity trend
 * @param {number} months - Брой месеци назад
 */
const getActivityTrendData = async (months = 6) => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const snapshots = await mentor_activity_snapshot.findAll({
      where: {
        snapshotDate: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('snapshot_date')), 'month'],
        [sequelize.fn('SUM', sequelize.col('total_sessions')), 'totalSessions'],
        [sequelize.fn('SUM', sequelize.col('firebase_online_minutes')), 'totalOnlineMinutes'],
        [sequelize.fn('SUM', sequelize.col('firebase_messages_count')), 'totalMessages'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('mentor_id'))), 'activeMentors']
      ],
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('snapshot_date'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('snapshot_date')), 'ASC']],
      raw: true
    });
    
    const trend = snapshots.map(snap => ({
      month: snap.month.toISOString().slice(0, 7),
      sessions: parseInt(snap.totalSessions) || 0,
      onlineHours: Math.round((parseInt(snap.totalOnlineMinutes) || 0) / 60),
      messages: parseInt(snap.totalMessages) || 0,
      activeMentors: parseInt(snap.activeMentors) || 0
    }));
    
    return trend;
    
  } catch (error) {
    console.error('❌ Error getting activity trend data:', error);
    throw error;
  }
};
//  filtered stats по период
const getFilteredMentorStats = async (startDate, endDate) => {
  try {
    const { mentor_activity_snapshot, mentor, user_account, user_details } = require('../sequelize/models/index');

    // Query snapshots за периода
    const snapshots = await mentor_activity_snapshot.findAll({
      where: {
        snapshotDate: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      include: [
        {
          model: mentor,
          as: 'mentor',
          include: [
            {
              model: user_account,
              as: 'user',
              include: [
                {
                  model: user_details,
                  as: 'details'
                }
              ]
            }
          ]
        }
      ]
    });

    // Group by mentor
    const mentorStatsMap = new Map();

    snapshots.forEach(snapshot => {
      const mentorId = snapshot.mentorId;
      
      if (!mentorStatsMap.has(mentorId)) {
        const m = snapshot.mentor;
        const user = m.user;
        const details = user.details || {};

        mentorStatsMap.set(mentorId, {
          id: m.id,
          name: m.name || details.username || user.email.split('@')[0],
          email: user.email,
          photoUrl: m.photoUrl,
          specialization: m.specialization,
          studentsCount: m.studentsCount,
          rating: parseFloat(m.rating) || 0,
          isOnline: m.isOnline,
          courses: [],
          firebaseStats: {
            totalSessions: 0,
            activeSessions: 0,
            completedSessions: 0,
            totalOnlineMinutes: 0,
            totalOnlineHours: 0,
            averageResponseTime: 0,
            totalMessages: 0
          }
        });
      }

      const stats = mentorStatsMap.get(mentorId);
      
      // Sum snapshots
      stats.firebaseStats.totalSessions += snapshot.totalSessions || 0;
      stats.firebaseStats.completedSessions += (snapshot.firebaseCompletedSessions || 0) + (snapshot.postgresSessionsCount || 0);
      stats.firebaseStats.totalOnlineMinutes += snapshot.firebaseOnlineMinutes || 0;
      stats.firebaseStats.totalMessages += snapshot.firebaseMessagesCount || 0;
    });

    // Calculate averages
    const result = Array.from(mentorStatsMap.values()).map(mentor => {
      mentor.firebaseStats.totalOnlineHours = Math.round((mentor.firebaseStats.totalOnlineMinutes / 60) * 100) / 100;
      
      // Average response time от snapshots
      const relatedSnapshots = snapshots.filter(s => s.mentorId === mentor.id);
      const totalResponseTimeSum = relatedSnapshots.reduce((sum, s) => sum + (s.firebaseAvgResponseTime || 0), 0);
      mentor.firebaseStats.averageResponseTime = relatedSnapshots.length > 0
        ? Math.round(totalResponseTimeSum / relatedSnapshots.length)
        : 0;

      return mentor;
    });

    return result;

  } catch (error) {
    console.error('Error getting filtered mentor stats:', error);
    throw error;
  }
};

module.exports = {
  createDailySnapshots,
  getActivityTrendData,
  getFilteredMentorStats
};