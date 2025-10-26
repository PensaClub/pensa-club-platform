// src/hooks/useUnreadCount.js

import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase/firebaseChat';

export const useUnreadCount = (userId) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    const unreadRef = ref(database, `user_unread_counts/${userId}`);
    
    const unsubscribe = onValue(unreadRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Сумирай всички непрочетени от всички conversations
        const total = Object.values(data).reduce((sum, count) => sum + (count || 0), 0);
        setUnreadCount(total);
      } else {
        setUnreadCount(0);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return unreadCount;
};