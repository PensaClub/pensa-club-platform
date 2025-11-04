// server/src/services/sessionSyncService.js

const { getFirebaseDb } = require('../firebase/firebaseAdmin');
const { mentor } = require('../sequelize/models/index');

/**
 * CRITICAL: Sync completed session stats to PostgreSQL
 * Извиква се ВЕДНАГА след като session завърши (status: "disconnected")
 * 
 * @param {string} sessionId - Firebase session ID
 * @param {string} mentorFirebaseId - Mentor email с _dot_ и _at_
 * @param {number} mentorPostgresId - Mentor ID в PostgreSQL
 */
const syncCompletedSessionStats = async (sessionId, mentorFirebaseId, mentorPostgresId) => {
  try {
    const db = getFirebaseDb();

    // ✅ 1. ВЗЕМИ SESSION DATA ОТ Firebase
    const sessionRef = db.ref(`mentor_sessions/${mentorFirebaseId}/${sessionId}`);
    const sessionSnapshot = await sessionRef.once('value');
    const session = sessionSnapshot.val();

    if (!session) {
      console.warn(`⚠️ Session ${sessionId} not found in Firebase`);
      return { success: false, error: 'Session not found' };
    }

    if (!session.endTime || !session.startTime) {
      console.warn(`⚠️ Session ${sessionId} missing timestamps`);
      return { success: false, error: 'Missing timestamps' };
    }

    // ✅ 2. ИЗЧИСЛИ SESSION DURATION
    const durationMs = session.endTime - session.startTime;
    const durationMinutes = Math.floor(durationMs / 60000);

    // ✅ 3. ВЗЕМИ CONVERSATION DATA
    const conversationId = session.conversationId;
    let messagesCount = 0;
    let responseTimes = [];

    if (conversationId) {
      const messagesRef = db.ref(`chat_messages/${conversationId}`);
      const messagesSnapshot = await messagesRef.once('value');
      const messages = messagesSnapshot.val() || {};
      
      const messagesList = Object.values(messages);
      
      const mentorMessages = messagesList.filter(msg => msg.senderType === 'mentor');
      const userMessages = messagesList.filter(msg => msg.senderType === 'user');
      
      messagesCount = mentorMessages.length;

      // ✅ Изчисли response times В СЕКУНДИ!
      userMessages.forEach((userMsg, index) => {
        const nextMentorMsg = mentorMessages.find(
          mMsg => mMsg.timestamp > userMsg.timestamp
        );
        
        if (nextMentorMsg) {
          const responseTimeMs = nextMentorMsg.timestamp - userMsg.timestamp;
          const responseTimeSeconds = Math.floor(responseTimeMs / 1000); // ✅ СЕКУНДИ!
          responseTimes.push(responseTimeSeconds);
        }
      });
      
    } else {
      console.warn(`⚠️ No conversationId found in session`);
    }

    // ✅ 4. UPDATE PostgreSQL - INCREMENT accumulated fields
    const mentorRecord = await mentor.findByPk(mentorPostgresId);
    
    if (!mentorRecord) {
      console.error(`❌ Mentor ${mentorPostgresId} not found in PostgreSQL`);
      return { success: false, error: 'Mentor not found' };
    }

    const responseTimeSum = responseTimes.reduce((sum, time) => sum + time, 0); // ✅ Сума в секунди
    const responseCount = responseTimes.length;

    await mentorRecord.increment({
      accumulatedOnlineMinutes: durationMinutes,
      accumulatedMessagesCount: messagesCount,
      accumulatedCompletedSessions: 1,
      accumulatedResponseTimeSum: responseTimeSum, // ✅ СЕКУНДИ!
      accumulatedResponseCount: responseCount
    });

    await mentorRecord.update({
      lastSessionSyncedAt: new Date()
    });

    return {
      success: true,
      stats: {
        durationMinutes,
        messagesCount,
        responseTimeSum, // в секунди
        responseCount
      }
    };

  } catch (error) {
    console.error('❌ Error syncing session stats:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Batch sync всички disconnected sessions за ментор
 * Използва се за миграция или recovery
 * 
 * @param {string} mentorFirebaseId 
 * @param {number} mentorPostgresId 
 */
const batchSyncMentorSessions = async (mentorFirebaseId, mentorPostgresId) => {
  try {

    const db = getFirebaseDb();

    // Вземи всички sessions
    const sessionsRef = db.ref(`mentor_sessions/${mentorFirebaseId}`);
    const sessionsSnapshot = await sessionsRef.once('value');
    const sessions = sessionsSnapshot.val() || {};

    const sessionsList = Object.entries(sessions);
    let syncedCount = 0;

    for (const [sessionId, session] of sessionsList) {
      if (session.status === 'completed' && session.endTime && session.startTime) {
        const result = await syncCompletedSessionStats(sessionId, mentorFirebaseId, mentorPostgresId);
        if (result.success) {
          syncedCount++;
        }
      }
    }

    return {
      success: true,
      total: sessionsList.length,
      synced: syncedCount
    };

  } catch (error) {
    console.error('❌ Error batch syncing sessions:', error);
    throw error;
  }
};

/**
 * Sync ВСИЧКИ ментори (миграция)
 * Използва се ВЕДНЪЖ за миграция на съществуващи данни
 */
const migrateAllMentorsSessions = async () => {
  try {

    const { user_account } = require('../sequelize/models/index');

    const mentors = await mentor.findAll({
      where: { status: 'active' },
      include: [
        {
          model: user_account,
          as: 'user',
          attributes: ['email']
        }
      ]
    });

    let totalSynced = 0;

    for (const mentorData of mentors) {
      try {
        const firebaseMentorId = mentorData.user.email
          .replace(/\./g, '_dot_')
          .replace(/@/g, '_at_');

        const result = await batchSyncMentorSessions(firebaseMentorId, mentorData.id);
        totalSynced += result.synced;


      } catch (error) {
        console.error(`❌ Error migrating mentor ${mentorData.id}:`, error);
      }
    }


    return {
      success: true,
      totalMentors: mentors.length,
      totalSessionsSynced: totalSynced
    };

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
};

module.exports = {
  syncCompletedSessionStats,
  batchSyncMentorSessions,
  migrateAllMentorsSessions
};