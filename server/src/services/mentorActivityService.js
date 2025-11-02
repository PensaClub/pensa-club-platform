// server/src/services/mentorActivityService.js

const { getMentorFirebaseStats } = require('../firebase/firebaseChatReader');
const { mentor, user_account, user_details, mentor_course, sequelize } = require('../sequelize/models/index');

/**
 * Обнови кеширани статистики за ментор в PostgreSQL
 */
const updateMentorCachedStats = async (mentorId, firebaseMentorId) => {
  try {
    const firebaseStats = await getMentorFirebaseStats(firebaseMentorId);
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

    const firebaseStats = await getMentorFirebaseStats(firebaseMentorId);

    // ✅ СБОР на сесиите от двете бази
    const totalSessions = (firebaseStats.totalSessions || 0) + (mentorData.sessionsCount || 0);

    return {
      id: mentorData.id,
      name: displayName,
      email: user.email,
      photoUrl: mentorData.photoUrl,
      specialization: mentorData.specialization,
      // ✅ Students: PostgreSQL first, Firebase fallback
      studentsCount: mentorData.studentsCount || firebaseStats.totalSessions || 0,
      // ✅ Sessions: СБОР от Firebase + PostgreSQL
      sessionsCount: totalSessions,
      rating: parseFloat(mentorData.rating) || 0,
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

        const firebaseStats = await getMentorFirebaseStats(firebaseMentorId);

        // ✅ СБОР на сесиите от двете бази
        const totalSessions = (firebaseStats.totalSessions || 0) + (mentorData.sessionsCount || 0);
        const totalStudentsCount = (mentorData.studentsCount || 0) + (firebaseStats.totalSessions || 0);
        mentorsWithStats.push({
          id: mentorData.id,
          name: displayName,
          email: user.email,
          photoUrl: mentorData.photoUrl,
          specialization: mentorData.specialization,
          // ✅ Students: PostgreSQL first, Firebase fallback
          studentsCount: totalStudentsCount,
          // ✅ Sessions: СБОР от Firebase + PostgreSQL
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
            totalOnlineHours: firebaseStats.totalOnlineHours,
            averageResponseTime: firebaseStats.averageResponseTime,
            totalMessages: firebaseStats.totalMessages
          }
        });
      } catch (error) {
        console.error(`Error getting stats for mentor ${mentorData.id}:`, error);
      }
    }

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