// src/hooks/useActiveChatCount.js

import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../firebase/firebaseChat';

/**
 * Hook за броене на активни чатове
 * За User: брой активни conversations
 * За Admin/Mentor: брой pending requests + активни conversations
 */
export const useActiveChatCount = (userId, userRole) => {
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setActiveCount(0);
      return;
    }

    const unsubscribers = [];

    // За обикновен user - брой активни conversations
    if (userRole !== 'admin' && userRole !== 'mentor') {
      const conversationsRef = ref(database, 'chat_conversations');
      const userQuery = query(conversationsRef, orderByChild('userId'), equalTo(userId));
      
      const unsubscribe = onValue(userQuery, (snapshot) => {
        let count = 0;
        snapshot.forEach((childSnapshot) => {
          const conv = childSnapshot.val();
          if (conv.status === 'active') {
            count++;
          }
        });
        setActiveCount(count);
      });
      
      unsubscribers.push(unsubscribe);
    } 
    // За admin/mentor - pending requests + active conversations
    else {
      let pendingCount = 0;
      let activeConvCount = 0;

      // Слушай за pending requests
      const requestsRef = ref(database, 'chat_requests');
      const pendingQuery = query(requestsRef, orderByChild('status'), equalTo('waiting'));
      
      const unsubscribe1 = onValue(pendingQuery, (snapshot) => {
        pendingCount = snapshot.size || 0;
        setActiveCount(pendingCount + activeConvCount);
      });

      // Слушай за активни conversations
      const conversationsRef = ref(database, 'chat_conversations');
      const mentorQuery = query(conversationsRef, orderByChild('mentorId'), equalTo(userId));
      
      const unsubscribe2 = onValue(mentorQuery, (snapshot) => {
        activeConvCount = 0;
        snapshot.forEach((childSnapshot) => {
          const conv = childSnapshot.val();
          if (conv.status === 'active') {
            activeConvCount++;
          }
        });
        setActiveCount(pendingCount + activeConvCount);
      });

      unsubscribers.push(unsubscribe1, unsubscribe2);
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [userId, userRole]);

  return activeCount;
};