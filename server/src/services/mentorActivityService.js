// server/src/services/mentorActivityService.js

const { getMentorFirebaseStats } = require('../firebase/firebaseChatReader');
const { mentor, user_account, user_details, mentor_course, sequelize } = require('../sequelize/models/index');

// ✅ IN-MEMORY CACHE за getAllMentorsCombinedStats
let allMentorsCache = null;
let allMentorsCacheTimestamp = null;
const ALL_MENTORS_CACHE_TTL = 5 * 60 * 1000; // 5 минути

/**
 * Обнови кеширани статистики за ментор в PostgreSQL
 */
const updateMentorCachedStats = async (mentorId, firebaseMentorId) => {
  try {
    // ✅ Pass postgresId за по-бързи queries
    const firebaseStats = await getMentorFirebaseStats(firebaseMentorId, mentorId);
    const mentorData = await mentor.findByPk(mentorId);

    if (!mentorData) {
      throw new Error('Mentor not found');
    }

    await mentorData.update({
      sessionsCount: firebaseStats.totalSessions,
      updatedAt: new Date()
    });

    return {
      success: true,
      stats: firebaseStats
    };
  } catch (error) {
    console.error('Error updating mentor cached stats:', error);
    throw error;
  }
};

/**
 * Вземи комбинирани статистики (PostgreSQL + Firebase)
 */
const getMentorCombinedStats = async (mentorId) => {
  try {
    const mentorData = await mentor.findByPk(mentorId, {
      include: [
        {
          model: user_account,
          as: 'user',
          attributes: ['id', 'email', 'role'],
          include: [
            {
              model: user_details,
              as: 'details',
              attributes: ['firstName', 'lastName', 'username']
            }
          ]
        },
        {
          model: mentor_course,
          as: 'courses',
          attributes: ['id', 'courseName', 'courseCategory']
        }
      ]
    });

    if (!mentorData) {
      throw new Error('Mentor not found');
    }

    const user = mentorData.user;
    const userDetails = user.details || {};

    const displayName = mentorData.name ||
      userDetails.username ||
      `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() ||
      user.email.split('@')[0];

    const firebaseMentorId = user.email
      .replace(/\./g, '_dot_')
      .replace(/@/g, '_at_');

    // ✅ Pass postgresId за оптимизация
    const firebaseStats = await getMentorFirebaseStats(firebaseMentorId, mentorData.id);

    const totalSessions = (firebaseStats.totalSessions || 0) + (mentorData.sessionsCount || 0);

    return {
      id: mentorData.id,
      name: displayName,
      email: user.email,
      photoUrl: mentorData.photoUrl,
      specialization: mentorData.specialization,
      studentsCount: mentorData.studentsCount || firebaseStats.totalSessions || 0,
      sessionsCount: totalSessions,
      rating: parseFloat(mentorData.rating) || 0,
      reviewsCount: mentorData.reviewsCount || 0,        
      reviewsAvgRating: parseFloat(mentorData.reviewsAvgRating) || 0,  
      isOnline: mentorData.isOnline || false,
      courses: mentorData.courses || [],

      firebaseStats: {
        totalSessions: firebaseStats.totalSessions,
        activeSessions: firebaseStats.activeSessions,
        completedSessions: firebaseStats.completedSessions,
        totalOnlineMinutes: firebaseStats.totalOnlineMinutes,
        totalOnlineHours: firebaseStats.totalOnlineHours,
        averageResponseTime: firebaseStats.averageResponseTime,
        totalMessages: firebaseStats.totalMessages
      }
    };
  } catch (error) {
    console.error('Error getting mentor combined stats:', error);
    throw error;
  }
};

/**
 * Вземи статистики за всички ментори
 */
const getAllMentorsCombinedStats = async () => {
  // ✅ CHECK CACHE FIRST
  if (allMentorsCache && allMentorsCacheTimestamp && (Date.now() - allMentorsCacheTimestamp < ALL_MENTORS_CACHE_TTL)) {
    return allMentorsCache;
  }

  try {
    const mentors = await mentor.findAll({
      where: { status: 'active' },
      include: [
        {
          model: user_account,
          as: 'user',
          attributes: ['id', 'email', 'role'],
          include: [
            {
              model: user_details,
              as: 'details',
              attributes: ['firstName', 'lastName', 'username']
            }
          ]
        },
        {
          model: mentor_course,
          as: 'courses',
          attributes: ['id', 'courseName', 'courseCategory']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const mentorsWithStats = [];

    for (const mentorData of mentors) {
      try {
        const user = mentorData.user;
        const userDetails = user.details || {};

        const displayName = mentorData.name ||
          userDetails.username ||
          `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() ||
          user.email.split('@')[0];

        const firebaseMentorId = user.email
          .replace(/\./g, '_dot_')
          .replace(/@/g, '_at_');

        // ✅ Pass postgresId за оптимизация
        const firebaseStats = await getMentorFirebaseStats(firebaseMentorId, mentorData.id);

        const totalSessions = (firebaseStats.totalSessions || 0) + (mentorData.sessionsCount || 0);
        const totalStudentsCount = (mentorData.studentsCount || 0) + (firebaseStats.totalSessions || 0);
        const totalOnlineHours = Math.round((firebaseStats.totalOnlineMinutes || 0) / 60 * 100) / 100;

        mentorsWithStats.push({
          id: mentorData.id,
          name: displayName,
          email: user.email,
          photoUrl: mentorData.photoUrl,
          specialization: mentorData.specialization,
          studentsCount: totalStudentsCount,
          sessionsCount: totalSessions,
          rating: parseFloat(mentorData.rating) || 0,
          isOnline: mentorData.isOnline || false,
          courses: mentorData.courses || [],
          role: user.role,

          firebaseStats: {
            totalSessions: firebaseStats.totalSessions,
            activeSessions: firebaseStats.activeSessions,
            completedSessions: firebaseStats.completedSessions,
            totalOnlineMinutes: firebaseStats.totalOnlineMinutes,
            totalOnlineHours: totalOnlineHours,
            averageResponseTime: firebaseStats.averageResponseTime,
            totalMessages: firebaseStats.totalMessages
          }
        });
      } catch (error) {
        console.error(`Error getting stats for mentor ${mentorData.id}:`, error);
      }
    }

    // ✅ STORE IN CACHE
    allMentorsCache = mentorsWithStats;
    allMentorsCacheTimestamp = Date.now();

    return mentorsWithStats;
  } catch (error) {
    console.error('Error getting all mentors combined stats:', error);
    throw error;
  }
};

module.exports = {
  updateMentorCachedStats,
  getMentorCombinedStats,
  getAllMentorsCombinedStats
};