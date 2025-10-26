// src/firebase/firebaseChat.js

import { getDatabase, ref, push, set, onValue, off, update, query, orderByChild, equalTo, limitToLast, remove } from 'firebase/database';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { firebaseStorage } from '../../firebase';
import { initializeApp, getApps, getApp } from 'firebase/app';
// Initialize Firebase Database
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_authDomain,
  projectId: import.meta.env.VITE_FIREBASE_projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_appId,
  databaseURL: 'https://pensaclub-909e0-default-rtdb.europe-west1.firebasedatabase.app'
};

// Initialize app if not already initialized
// if (!getApps().length) {
//   initializeApp(firebaseConfig);
// }
let databaseApp;
try {
  databaseApp = getApp('database'); // Опитай да вземеш съществуващия
} catch {
  databaseApp = initializeApp(firebaseConfig, 'database'); // Създай нов с име "database"
}
export const database = getDatabase(databaseApp);

// ===============================
// CHAT REQUESTS (опашка за чакащи)
// ===============================

/**
 * Създава нова заявка за помощ от потребител
 * @param {Object} requestData - { userId, userName, userEmail, problem, category }
 * @returns {Promise<string>} - requestId
 */
// src/firebase/firebaseChat.js

export const createChatRequest = async (requestData) => {
  try {
    console.log('🔷 Creating chat request with data:', requestData); // ✅ ДОБАВИ

    // Валидация
    if (!requestData.userId) {
      throw new Error('userId is required');
    }
    if (!requestData.userName) {
      throw new Error('userName is required');
    }

    const requestsRef = ref(database, 'chat_requests');
    console.log('🔷 requestsRef created:', requestsRef); // ✅ ДОБАВИ
    
    const newRequestRef = push(requestsRef);
    console.log('🔷 newRequestRef key:', newRequestRef.key); // ✅ ДОБАВИ
    
    const request = {
      userId: requestData.userId,
      userName: requestData.userName,
      userEmail: requestData.userEmail || '',
      problem: requestData.problem || 'Общ въпрос',
      category: requestData.category || 'General',
      status: 'waiting',
      mentorId: null,
      mentorName: null,
      createdAt: Date.now(),
      assignedAt: null
    };
    
    console.log('🔷 Request object to save:', request); // ✅ ДОБАВИ
    
    await set(newRequestRef, request);
    console.log('✅ Request saved successfully with ID:', newRequestRef.key); // ✅ ДОБАВИ
    
    return newRequestRef.key;
  } catch (error) {
    console.error('❌ Error creating chat request:', error); // Вече има
    console.error('❌ Error details:', error.message, error.code); // ✅ ДОБАВИ
    throw error;
  }
};

/**
 * Слуша за промени в заявките (за ментори)
 * @param {Function} callback - функция която се извиква при промяна
 * @returns {Function} - unsubscribe функция
 */
export const listenToChatRequests = (callback) => {
  const requestsRef = ref(database, 'chat_requests');
  const waitingQuery = query(requestsRef, orderByChild('status'), equalTo('waiting'));
  
  onValue(waitingQuery, (snapshot) => {
    const requests = [];
    snapshot.forEach((childSnapshot) => {
      requests.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(requests);
  });
  
  // Връщаме unsubscribe функция
  return () => off(waitingQuery);
};

/**
 * Ментор приема заявка
 * @param {string} requestId
 * @param {Object} mentorData - { mentorId, mentorName }
 * @returns {Promise<string>} - conversationId
 */
export const acceptChatRequest = async (requestId, mentorData) => {
  try {
    const requestRef = ref(database, `chat_requests/${requestId}`);
    
    // Вземи данните на заявката
    const snapshot = await new Promise((resolve) => {
      onValue(requestRef, (snap) => {
        resolve(snap);
      }, { onlyOnce: true });
    });
    
    const requestData = snapshot.val();
    
    // Обнови заявката като приета
    await update(requestRef, {
      status: 'accepted',
      mentorId: mentorData.mentorId,
      mentorName: mentorData.mentorName,
      assignedAt: Date.now()
    });
    
    // Създай нов разговор
    const conversationId = await createConversation({
      userId: requestData.userId,
      userName: requestData.userName,
      mentorId: mentorData.mentorId,
      mentorName: mentorData.mentorName,
      problem: requestData.problem,
      category: requestData.category
    });
    
    return conversationId;
  } catch (error) {
    console.error('Error accepting chat request:', error);
    throw error;
  }
};

/**
 * Изтриване на заявка (ако е отхвърлена или стара)
 */
export const deleteChatRequest = async (requestId) => {
  try {
    const requestRef = ref(database, `chat_requests/${requestId}`);
    await remove(requestRef);
  } catch (error) {
    console.error('Error deleting chat request:', error);
    throw error;
  }
};

// ===============================
// CONVERSATIONS (разговори)
// ===============================

/**
 * Създава нов разговор
 */
const createConversation = async (conversationData) => {
  try {
    const conversationsRef = ref(database, 'chat_conversations');
    const newConversationRef = push(conversationsRef);
    
    const conversation = {
      ...conversationData,
      status: 'active',
      startedAt: Date.now(),
      endedAt: null,
      lastMessage: null,
      lastMessageAt: null
    };
    
    await set(newConversationRef, conversation);
    return newConversationRef.key;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

/**
 * Слуша за активните разговори на потребител
 */
export const listenToUserConversations = (userId, callback) => {
  const conversationsRef = ref(database, 'chat_conversations');
  const userQuery = query(conversationsRef, orderByChild('userId'), equalTo(userId));
  
  onValue(userQuery, (snapshot) => {
    const conversations = [];
    snapshot.forEach((childSnapshot) => {
      const conv = childSnapshot.val();
      if (conv.status === 'active') {
        conversations.push({
          id: childSnapshot.key,
          ...conv
        });
      }
    });
    callback(conversations);
  });
  
  return () => off(userQuery);
};

/**
 * Слуша за активните разговори на ментор
 */
// ✅ НОВ КОД:
export const listenToMentorConversations = (mentorId, callback) => {
  const conversationsRef = ref(database, 'chat_conversations');
  const mentorQuery = query(conversationsRef, orderByChild('mentorId'), equalTo(mentorId));
  
  onValue(mentorQuery, (snapshot) => {
    const conversations = [];
    snapshot.forEach((childSnapshot) => {
      // ✅ ВРЪЩАМЕ ВСИЧКИ conversations (и active, и completed)
      conversations.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(conversations);
  });
  
  return () => off(mentorQuery);
};

/**
 * Завършва разговор
 */
export const endConversation = async (conversationId) => {
  try {
    const conversationRef = ref(database, `chat_conversations/${conversationId}`);
    await update(conversationRef, {
      status: 'completed',
      endedAt: Date.now()
    });
  } catch (error) {
    console.error('Error ending conversation:', error);
    throw error;
  }
};

// ===============================
// MESSAGES (съобщения)
// ===============================

/**
 * Изпраща текстово съобщение
 */
export const sendMessage = async (conversationId, messageData) => {
  try {
    // ✅ ДОБАВИ: Провери дали conversation-ът е completed и го reopen-ни
    const conversationRef = ref(database, `chat_conversations/${conversationId}`);
    const conversationSnapshot = await new Promise((resolve) => {
      onValue(conversationRef, (snap) => {
        resolve(snap);
      }, { onlyOnce: true });
    });
    
    const conversation = conversationSnapshot.val();
    
    // Ако е completed, върни го на active
    if (conversation && conversation.status === 'completed') {
      await update(conversationRef, {
        status: 'active',
        endedAt: null,
        reopenedAt: Date.now()
      });
    }
    
    // ✅ ОРИГИНАЛНИЯТ КОД ПРОДЪЛЖАВА:
    const messagesRef = ref(database, `chat_messages/${conversationId}`);
    const newMessageRef = push(messagesRef);
    
    const message = {
      ...messageData,
      timestamp: Date.now(),
      read: false,
      type: messageData.type || 'text'
    };
    
    await set(newMessageRef, message);
    
    // Обнови последното съобщение в разговора
    await update(conversationRef, {
      lastMessage: message.message || 'Изображение',
      lastMessageAt: message.timestamp
    });
    
    // Увеличи броя непрочетени за получателя
    const recipientId = messageData.senderType === 'user' ? messageData.mentorId : messageData.userId;
    if (recipientId) {
      await incrementUnreadCount(recipientId, conversationId);
    }
    
    return newMessageRef.key;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Слуша за съобщения в разговор
 */
export const listenToMessages = (conversationId, callback) => {
  const messagesRef = ref(database, `chat_messages/${conversationId}`);
  const messagesQuery = query(messagesRef, limitToLast(50)); // последните 50 съобщения
  
  onValue(messagesQuery, (snapshot) => {
    const messages = [];
    snapshot.forEach((childSnapshot) => {
      messages.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(messages);
  });
  
  return () => off(messagesQuery);
};

/**
 * Маркира съобщенията като прочетени
 */
export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    const messagesRef = ref(database, `chat_messages/${conversationId}`);
    const snapshot = await new Promise((resolve) => {
      onValue(messagesRef, (snap) => {
        resolve(snap);
      }, { onlyOnce: true });
    });
    
    const updates = {};
    snapshot.forEach((childSnapshot) => {
      const message = childSnapshot.val();
      // Маркираме само съобщенията, които НЕ са изпратени от текущия потребител
      if (message.senderId !== userId && !message.read) {
        updates[`${childSnapshot.key}/read`] = true;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      await update(messagesRef, updates);
    }
    
    // Нулираме непрочетените за този разговор
    await resetUnreadCount(userId, conversationId);
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// ===============================
// FILE UPLOAD (качване на файлове)
// ===============================

/**
 * Качва файл (снимка или документ)
 */
export const uploadChatFile = async (file, conversationId, onProgress = null) => {
  try {
    const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileName = `${fileId}_${file.name}`;
    const filePath = `chat_files/${conversationId}/${fileName}`;
    
    const fileRef = storageRef(firebaseStorage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Записваме информация за файла в Realtime Database
            const fileInfo = {
              id: fileId,
              name: file.name,
              size: file.size,
              type: file.type,
              url: downloadURL,
              path: filePath,
              uploadedAt: Date.now(),
              conversationId: conversationId
            };
            
            // Записваме в chat_files колекцията за да можем да ги изтриваме след време
            const filesRef = ref(database, `chat_files/${conversationId}`);
            const newFileRef = push(filesRef);
            await set(newFileRef, fileInfo);
            
            resolve(fileInfo);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Изтрива файл (използва се от Cloud Function за автоматично изтриване)
 */
export const deleteChatFile = async (filePath, fileId, conversationId) => {
  try {
    // Изтрий от Storage
    const fileRef = storageRef(firebaseStorage, filePath);
    await deleteObject(fileRef);
    
    // Изтрий записа от Database
    const fileDbRef = ref(database, `chat_files/${conversationId}/${fileId}`);
    await remove(fileDbRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Вземи стари файлове (за автоматично изтриване)
 */
export const getOldChatFiles = async (daysOld = 14) => {
  try {
    const filesRef = ref(database, 'chat_files');
    const snapshot = await new Promise((resolve) => {
      onValue(filesRef, (snap) => {
        resolve(snap);
      }, { onlyOnce: true });
    });
    
    const oldFiles = [];
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    
    snapshot.forEach((conversationSnapshot) => {
      conversationSnapshot.forEach((fileSnapshot) => {
        const file = fileSnapshot.val();
        if (file.uploadedAt < cutoffTime) {
          oldFiles.push({
            id: fileSnapshot.key,
            conversationId: conversationSnapshot.key,
            ...file
          });
        }
      });
    });
    
    return oldFiles;
  } catch (error) {
    console.error('Error getting old files:', error);
    throw error;
  }
};

// ===============================
// MENTOR STATUS (статус на ментори)
// ===============================

/**
 * Обнови статус на ментор
 */
export const updateMentorStatus = async (mentorId, status) => {
  try {
    const statusRef = ref(database, `mentor_status/${mentorId}`);
    await update(statusRef, {
      status: status, // 'online' | 'offline' | 'busy'
      lastActive: Date.now()
    });
  } catch (error) {
    console.error('Error updating mentor status:', error);
    throw error;
  }
};

/**
 * Вземи всички онлайн ментори
 */
export const getOnlineMentors = (callback) => {
  const statusRef = ref(database, 'mentor_status');
  const onlineQuery = query(statusRef, orderByChild('status'), equalTo('online'));
  
  onValue(onlineQuery, (snapshot) => {
    const mentors = [];
    snapshot.forEach((childSnapshot) => {
      mentors.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(mentors);
  });
  
  return () => off(onlineQuery);
};

/**
 * Слуша статус на конкретен ментор
 */
export const listenToMentorStatus = (mentorId, callback) => {
  const statusRef = ref(database, `mentor_status/${mentorId}`);
  
  onValue(statusRef, (snapshot) => {
    callback(snapshot.val());
  });
  
  return () => off(statusRef);
};

// ===============================
// UNREAD COUNTS (непрочетени съобщения)
// ===============================

/**
 * Увеличава броя непрочетени
 */
const incrementUnreadCount = async (userId, conversationId) => {
  try {
    const unreadRef = ref(database, `user_unread_counts/${userId}/${conversationId}`);
    const snapshot = await new Promise((resolve) => {
      onValue(unreadRef, (snap) => {
        resolve(snap);
      }, { onlyOnce: true });
    });
    
    const currentCount = snapshot.val() || 0;
    await set(unreadRef, currentCount + 1);
  } catch (error) {
    console.error('Error incrementing unread count:', error);
  }
};

/**
 * Нулира непрочетените
 */
const resetUnreadCount = async (userId, conversationId) => {
  try {
    const unreadRef = ref(database, `user_unread_counts/${userId}/${conversationId}`);
    await set(unreadRef, 0);
  } catch (error) {
    console.error('Error resetting unread count:', error);
  }
};

/**
 * Слуша за непрочетени съобщения на потребител
 */
export const listenToUnreadCounts = (userId, callback) => {
  const unreadRef = ref(database, `user_unread_counts/${userId}`);
  
  onValue(unreadRef, (snapshot) => {
    const counts = snapshot.val() || {};
    const totalUnread = Object.values(counts).reduce((sum, count) => sum + count, 0);
    callback({ counts, totalUnread });
  });
  
  return () => off(unreadRef);
};

// ===============================
// EXPORT ALL
// ===============================

export default {
  // Chat Requests
  createChatRequest,
  listenToChatRequests,
  acceptChatRequest,
  deleteChatRequest,
  
  // Conversations
  listenToUserConversations,
  listenToMentorConversations,
  endConversation,
  
  // Messages
  sendMessage,
  listenToMessages,
  markMessagesAsRead,
  
  // Files
  uploadChatFile,
  deleteChatFile,
  getOldChatFiles,
  
  // Mentor Status
  updateMentorStatus,
  getOnlineMentors,
  listenToMentorStatus,
  
  // Unread Counts
  listenToUnreadCounts
};