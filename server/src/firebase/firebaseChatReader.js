// server/src/firebase/firebaseChatReader.js

const { getFirebaseDb } = require('./firebaseAdmin');

/**
 * Вземи всички conversations за даден ментор
 * @param {string} mentorId 
 * @returns {Promise<Array>}
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
 * @param {string} conversationId 
 * @returns {Promise<Array>}
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
 * Изчисли response time за conversation (в минути)
 * @param {string} conversationId 
 * @param {string} mentorId 
 * @returns {Promise<number>}
 */
const calculateConversationResponseTime = async (conversationId, mentorId) => {
  try {
    const messages = await getConversationMessages(conversationId);
    
    if (messages.length < 2) {
      return 0;
    }

    let responseTimes = [];
    let lastUserMessageTime = null;

    for (const message of messages) {
      if (message.senderType === 'user') {
        lastUserMessageTime = message.timestamp;
      } else if (message.senderType === 'mentor' && message.senderId === mentorId && lastUserMessageTime) {
        const responseTime = (message.timestamp - lastUserMessageTime) / 60000; // конвертирай в минути
        responseTimes.push(responseTime);
        lastUserMessageTime = null;
      }
    }

    if (responseTimes.length === 0) {
      return 0;
    }

    // Среден response time
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    return Math.round(avgResponseTime);
  } catch (error) {
    console.error('Error calculating response time:', error);
    return 0;
  }
};

/**
 * Изчисли online time за conversation (в минути)
 * Това е времето между startedAt и endedAt (или сега ако не е приключен)
 * @param {Object} conversation 
 * @returns {number}
 */
const calculateConversationOnlineTime = (conversation) => {
  if (!conversation.startedAt) {
    return 0;
  }

  const endTime = conversation.endedAt || Date.now();
  const duration = (endTime - conversation.startedAt) / 60000; // минути
  
  return Math.round(duration);
};

/**
 * Вземи статистики за ментор
 * @param {string} mentorId 
 * @returns {Promise<Object>}
 */
const getMentorFirebaseStats = async (mentorId) => {
  try {
    const conversations = await getMentorConversations(mentorId);
    
    if (conversations.length === 0) {
      return {
        totalSessions: 0,
        activeSessions: 0,
        completedSessions: 0,
        totalOnlineMinutes: 0,
        averageResponseTime: 0,
        totalMessages: 0
      };
    }

    let totalOnlineMinutes = 0;
    let responseTimes = [];
    let totalMessages = 0;
    let activeSessions = 0;
    let completedSessions = 0;

    // Изчисли статистики за всяка conversation
    for (const conversation of conversations) {
      // Online time
      totalOnlineMinutes += calculateConversationOnlineTime(conversation);

      // Response time
      const responseTime = await calculateConversationResponseTime(conversation.id, mentorId);
      if (responseTime > 0) {
        responseTimes.push(responseTime);
      }

      // Messages count
      const messages = await getConversationMessages(conversation.id);
      const mentorMessages = messages.filter(msg => msg.senderId === mentorId);
      totalMessages += mentorMessages.length;

      // Status counts
      if (conversation.status === 'active') {
        activeSessions++;
      } else if (conversation.status === 'completed') {
        completedSessions++;
      }
    }

    // Среден response time
    const averageResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
      : 0;

    return {
      totalSessions: conversations.length,
      activeSessions,
      completedSessions,
      totalOnlineMinutes,
      totalOnlineHours: Math.round(totalOnlineMinutes / 60),
      averageResponseTime,
      totalMessages
    };
  } catch (error) {
    console.error('Error getting mentor Firebase stats:', error);
    throw error;
  }
};

/**
 * Вземи всички активни conversations
 * @returns {Promise<Array>}
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
 * Вземи pending requests (чакащи за приемане)
 * @returns {Promise<Array>}
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
  calculateConversationResponseTime,
  calculateConversationOnlineTime,
  getMentorFirebaseStats,
  getAllActiveConversations,
  getPendingRequests
};