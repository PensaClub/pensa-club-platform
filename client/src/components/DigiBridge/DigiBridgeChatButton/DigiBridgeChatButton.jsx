// src/components/DigiBridge/DigiBridgeChatButton/DigiBridgeChatButton.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './digiBridgeChatButton.css';
import { useAuthContext } from '../../contexts/UserContext';
import { 
  listenToUnreadCounts, 
  listenToUserConversations,
  listenToPendingRequests,
  listenToMentorConversations,
  listenToMessages
} from '../../firebase/firebaseChat';
import { DigiBridgeChatWindow } from '../DigiBridgeChatWindow/DigiBridgeChatWindow';
import { ChatWindowManager } from '../ChatWindowManager/ChatWindowManager';
import { MentorChatHub } from '../MentorChatHub/MentorChatHub';
export const DigiBridgeChatButton = ({ onClick }) => {
  const { t } = useTranslation();
  const { isAuthentication, profileData } = useAuthContext();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [mentorUnreadCount, setMentorUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);
  const [openChats, setOpenChats] = useState([]); // ✅ STATE ТУК

  const userEmail = profileData?.email || '';
  const userId = userEmail.replace(/\./g, '_dot_').replace(/@/g, '_at_');
  const userRole = profileData?.role || 'user';
  const isMentor = userRole === 'admin' || userRole === 'mentor';

  // Слушай за непрочетени (само за users)
  useEffect(() => {
    if (!isAuthentication || !userId || isMentor) return;

    const unsubscribe = listenToUnreadCounts(userId, ({ totalUnread }) => {
      setUnreadCount(totalUnread);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthentication, userId, isMentor]);

  // Слушай за pending requests (само за mentors)
  useEffect(() => {
    if (!isAuthentication || !isMentor) return;

    const unsubscribe = listenToPendingRequests((requests) => {
      setPendingCount(requests.length);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthentication, isMentor]);

  // Слушай за unread messages в активните conversations (само за mentors)
  useEffect(() => {
    if (!isAuthentication || !isMentor || !userId) return;

    let conversationUnsubscribes = [];
    let conversationsUnsubscribe = null;

    conversationsUnsubscribe = listenToMentorConversations(userId, (conversations) => {
      conversationUnsubscribes.forEach(unsub => unsub && unsub());
      conversationUnsubscribes = [];

      const activeConversations = conversations.filter(c => c.status === 'active');

      if (activeConversations.length === 0) {
        setMentorUnreadCount(0);
        return;
      }

      let totalUnread = 0;
      let processedCount = 0;

      activeConversations.forEach(conv => {
        const unsubscribe = listenToMessages(conv.id, (messages) => {
          const unreadMessages = messages.filter(
            msg => msg.senderId !== userId && !msg.read
          );

          totalUnread += unreadMessages.length;
          processedCount++;

          if (processedCount === activeConversations.length) {
            setMentorUnreadCount(totalUnread);
          }
        });

        conversationUnsubscribes.push(unsubscribe);
      });
    });

    return () => {
      if (conversationsUnsubscribe) conversationsUnsubscribe();
      conversationUnsubscribes.forEach(unsub => unsub && unsub());
    };
  }, [isAuthentication, isMentor, userId]);

  // Слушай за активен conversation (само за users)
  useEffect(() => {
    if (!isAuthentication || !userId || isMentor) return;

    const unsubscribe = listenToUserConversations(userId, (conversations) => {
      const active = conversations.find(c => c.status === 'active');
      setActiveConversation(active || null);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthentication, userId, isMentor]);

  if (!isAuthentication) return null;

  const handleClick = () => {
    setIsOpen(true);
  };

  // ✅ Функции за управление на чатове
  const handleOpenChat = (conversation) => {
  
  if (openChats.find(c => c.id === conversation.id)) {
    console.log('⚠️ Chat already open');
    return;
  }
  
  const newChats = [...openChats, conversation];
  console.log('🔵 Setting openChats to:', newChats);
  setOpenChats(newChats);
};

  const handleCloseChat = (conversationId) => {
    setOpenChats(openChats.filter(c => c.id !== conversationId));
  };

  const badgeCount = isMentor ? (pendingCount + mentorUnreadCount) : unreadCount;

  return (
    <>
      <div className="digibridge-chat-button-wrapper">
        <button
          className="digibridge-chat-button"
          onClick={handleClick}
          aria-label={isMentor ? 'Open chat hub' : t('digiBridge.chatButton.ariaLabel')}
        >
          {badgeCount > 0 && (
            <span className="digibridge-chat-button-badge">
              {badgeCount > 9 ? '9+' : badgeCount}
            </span>
          )}

          <svg
            className="digibridge-chat-button-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M8 10h8" />
            <path d="M8 14h4" />
          </svg>

          <span className="digibridge-chat-button-text">
            {isMentor ? '💬 Чат' : t('digiBridge.chatButton.help')}
          </span>
        </button>

        <span className="digibridge-chat-button-pulse"></span>
      </div>

      {/* Hub за MENTOR */}
      {isMentor && isOpen && (
        <MentorChatHub 
          onClose={() => setIsOpen(false)}
          onOpenChat={handleOpenChat}
        />
      )}

      {/* Chat за USER */}
      {!isMentor && isOpen && (
        <DigiBridgeChatWindow 
          onClose={() => setIsOpen(false)}
          existingConversation={activeConversation}
        />
      )}

      {/* ✅ CHAT WINDOWS MANAGER - извън Hub-а */}
      {isMentor && (
        <ChatWindowManager 
          openChats={openChats}
          onCloseChat={handleCloseChat}
        />
      )}
    </>
  );
};