// server/src/firebase/firebaseChatReader.js

const { getFirebaseDb } = require('./firebaseAdmin');
const { mentor } = require('../sequelize/models/index');

// ✅ IN-MEMORY CACHE за Firebase Stats
const mentorStatsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 минути

/**
 * Вземи комбинирани статистики (Firebase CURRENT + PostgreSQL ACCUMULATED)
 * @param {string} mentorId - Mentor email с _dot_ и _at_
 * @param {number} postgresId - Mentor ID в PostgreSQL (optional за по-бърз query)
 * @returns {Object} - Комбинирани статистики
 */
const getMentorFirebaseStats = async (mentorId, postgresId = null) => {
  // ✅ CHECK CACHE FIRST
  const cached = mentorStatsCache.get(mentorId);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  try {
    const db = getFirebaseDb();

    // ✅ 1. ВЗЕМИ ACCUMULATED STATS ОТ PostgreSQL
    let accumulatedStats = {
      accumulatedOnlineMinutes: 0,
      accumulatedMessagesCount: 0,
      accumulatedCompletedSessions: 0,
      accumulatedResponseTimeSum: 0,
      accumulatedResponseCount: 0
    };

    if (postgresId) {
      const mentorRecord = await mentor.findByPk(postgresId, {
        attributes: [
          'accumulatedOnlineMinutes',
          'accumulatedMessagesCount',
          'accumulatedCompletedSessions',
          'accumulatedResponseTimeSum',
          'accumulatedResponseCount'
        ]
      });

      if (mentorRecord) {
        accumulatedStats = {
          accumulatedOnlineMinutes: mentorRecord.accumulatedOnlineMinutes || 0,
          accumulatedMessagesCount: mentorRecord.accumulatedMessagesCount || 0,
          accumulatedCompletedSessions: mentorRecord.accumulatedCompletedSessions || 0,
          accumulatedResponseTimeSum: mentorRecord.accumulatedResponseTimeSum || 0,
          accumulatedResponseCount: mentorRecord.accumulatedResponseCount || 0
        };
      }
    }

    // ✅ 2. ВЗЕМИ CURRENT SESSIONS ОТ Firebase
    const sessionsRef = db.ref(`mentor_sessions/${mentorId}`);
    const sessionsSnapshot = await sessionsRef.once('value');
    const sessions = sessionsSnapshot.val() || {};

    let currentOnlineMinutes = 0;
    let currentCompletedSessionsCount = 0;

    Object.values(sessions).forEach(session => {
      if (session.endTime && session.startTime) {
        const durationMs = session.endTime - session.startTime;
        const durationMinutes = Math.floor(durationMs / 60000);
        currentOnlineMinutes += durationMinutes;
        currentCompletedSessionsCount++;
      }
    });

    // ✅ 3. ВЗЕМИ CURRENT CONVERSATIONS ОТ Firebase
    const conversationsRef = db.ref('chat_conversations');
    const conversationsSnapshot = await conversationsRef
      .orderByChild('mentorId')
      .equalTo(mentorId)
      .once('value');

    const conversations = conversationsSnapshot.val() || {};
    const conversationsList = Object.entries(conversations);

    const totalSessions = conversationsList.length;
    const activeSessions = conversationsList.filter(([_, conv]) => conv.status === 'active').length;
    const completedSessions = conversationsList.filter(([_, conv]) => conv.status === 'completed').length;

    // ✅ 4. ВЗЕМИ CURRENT СЪОБЩЕНИЯ И RESPONSE TIME
    let currentMessages = 0;
    let currentResponseTimes = [];

    for (const [convId, conv] of conversationsList) {
      const messagesRef = db.ref(`chat_messages/${convId}`);
      const messagesSnapshot = await messagesRef.once('value');
      const messages = messagesSnapshot.val() || {};
      
      const messagesList = Object.values(messages);
      const mentorMessages = messagesList.filter(msg => msg.senderType === 'mentor');
      currentMessages += mentorMessages.length;

      // Изчисли response time
      const userMessages = messagesList.filter(msg => msg.senderType === 'user');
      
      userMessages.forEach((userMsg) => {
        const nextMentorMsg = mentorMessages.find(
          mMsg => mMsg.timestamp > userMsg.timestamp
        );
        
        if (nextMentorMsg) {
          const responseTimeMs = nextMentorMsg.timestamp - userMsg.timestamp;
          const responseTimeMinutes = Math.floor(responseTimeMs / 60000);
          currentResponseTimes.push(responseTimeMinutes);
        }
      });
    }

    // ✅ 5. КОМБИНИРАЙ ACCUMULATED + CURRENT
    const totalOnlineMinutes = accumulatedStats.accumulatedOnlineMinutes + currentOnlineMinutes;
    const totalOnlineHours = Math.round((totalOnlineMinutes / 60) * 100) / 100;
    const totalMessages = accumulatedStats.accumulatedMessagesCount + currentMessages;
    const totalCompletedSessions = accumulatedStats.accumulatedCompletedSessions + currentCompletedSessionsCount;

    // Average Response Time = (accumulated sum + current sum) / (accumulated count + current count)
    const totalResponseTimeSum = accumulatedStats.accumulatedResponseTimeSum + 
                                 currentResponseTimes.reduce((sum, time) => sum + time, 0);
    const totalResponseCount = accumulatedStats.accumulatedResponseCount + currentResponseTimes.length;
    
    const averageResponseTime = totalResponseCount > 0
      ? Math.round(totalResponseTimeSum / totalResponseCount)
      : 0;

    const stats = {
      // Current Firebase stats
      totalSessions,
      activeSessions,
      completedSessions: completedSessions + totalCompletedSessions,
      
      // Combined stats (PERSISTENT - never resets)
      totalOnlineMinutes,
      totalOnlineHours,
      averageResponseTime,
      totalMessages
    };

    // ✅ STORE IN CACHE
    mentorStatsCache.set(mentorId, {
      data: stats,
      timestamp: Date.now()
    });

    return stats;

  } catch (error) {
    console.error('Error getting mentor Firebase stats:', error);
    return {
      totalSessions: 0,
      activeSessions: 0,
      completedSessions: 0,
      totalOnlineMinutes: 0,
      totalOnlineHours: 0,
      averageResponseTime: 0,
      totalMessages: 0
    };
  }
};

/**
 * Вземи всички conversations за даден ментор
 */
const getMentorConversations = async (mentorId) => {
  try {
    const db = getFirebaseDb();
    const conversationsRef = db.ref('chat_conversations');
    
    const snapshot = await conversationsRef
      .orderByChild('mentorId')
      .equalTo(mentorId)
      .once('value');

    if (!snapshot.exists()) {
      return [];
    }

    const conversations = [];
    snapshot.forEach((childSnapshot) => {
      conversations.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });

    return conversations;
  } catch (error) {
    console.error('Error getting mentor conversations:', error);
    throw error;
  }
};

/**
 * Вземи всички съобщения за conversation
 */
const getConversationMessages = async (conversationId) => {
  try {
    const db = getFirebaseDb();
    const messagesRef = db.ref(`chat_messages/${conversationId}`);
    
    const snapshot = await messagesRef
      .orderByChild('timestamp')
      .once('value');

    if (!snapshot.exists()) {
      return [];
    }

    const messages = [];
    snapshot.forEach((childSnapshot) => {
      messages.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });

    return messages;
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    throw error;
  }
};

/**
 * Вземи всички активни conversations
 */
const getAllActiveConversations = async () => {
  try {
    const db = getFirebaseDb();
    const conversationsRef = db.ref('chat_conversations');
    
    const snapshot = await conversationsRef
      .orderByChild('status')
      .equalTo('active')
      .once('value');

    if (!snapshot.exists()) {
      return [];
    }

    const conversations = [];
    snapshot.forEach((childSnapshot) => {
      conversations.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });

    return conversations;
  } catch (error) {
    console.error('Error getting active conversations:', error);
    throw error;
  }
};

/**
 * Вземи pending requests
 */
const getPendingRequests = async () => {
  try {
    const db = getFirebaseDb();
    const requestsRef = db.ref('chat_requests');
    
    const snapshot = await requestsRef
      .orderByChild('status')
      .equalTo('waiting')
      .once('value');

    if (!snapshot.exists()) {
      return [];
    }

    const requests = [];
    snapshot.forEach((childSnapshot) => {
      requests.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });

    return requests;
  } catch (error) {
    console.error('Error getting pending requests:', error);
    throw error;
  }
};

module.exports = {
  getMentorConversations,
  getConversationMessages,
  getMentorFirebaseStats,
  getAllActiveConversations,
  getPendingRequests
};