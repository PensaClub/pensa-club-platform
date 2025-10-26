// src/components/DigiBridge/DigiBridgeChatButton/DigiBridgeChatButton.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './digiBridgeChatButton.css';
import { useAuthContext } from '../../contexts/UserContext';
import { listenToUnreadCounts, listenToUserConversations } from '../../firebase/firebaseChat';
import { DigiBridgeChatWindow } from '../DigiBridgeChatWindow/DigiBridgeChatWindow';
import { MentorChatHub } from '../MentorChatHub/MentorChatHub';

export const DigiBridgeChatButton = ({ onClick }) => {
  const { t } = useTranslation();
  const { isAuthentication, profileData } = useAuthContext();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null); // ✅ ДОБАВИ

  const userEmail = profileData?.email || '';
  const userId = userEmail.replace(/\./g, '_dot_').replace(/@/g, '_at_');
  const userRole = profileData?.role || 'user';

  // Слушай за непрочетени
  useEffect(() => {
    if (!isAuthentication || !profileData) return;

    if (!userId) return;

    const unsubscribe = listenToUnreadCounts(userId, ({ totalUnread }) => {
      setUnreadCount(totalUnread);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthentication, profileData, userId]);

  // ✅ ДОБАВИ: Слушай за активен conversation (само за users)
  useEffect(() => {
    if (!isAuthentication || !userId) return;
    
    // Само за обикновени users (не admin/mentor)
    if (userRole === 'admin' || userRole === 'mentor') return;

    const unsubscribe = listenToUserConversations(userId, (conversations) => {
      // Вземи първия активен conversation
      const active = conversations.find(c => c.status === 'active');
      setActiveConversation(active || null);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthentication, userId, userRole]);

  // Не показвай бутона ако не е логнат
  if (!isAuthentication) return null;

  // Ако е admin или mentor - различен UI
  const isMentor = userRole === 'admin' || userRole === 'mentor';

  // ✅ ОБНОВИ: Handle click
  const handleClick = () => {
    setIsOpen(true);
  };

  return (
    <>
      <div className="digibridge-chat-button-wrapper">
        <button
          className="digibridge-chat-button"
          onClick={handleClick}
          aria-label={isMentor ? 'Open chat hub' : t('digiBridge.chatButton.ariaLabel')}
        >
          {/* Badge за непрочетени */}
          {unreadCount > 0 && (
            <span className="digibridge-chat-button-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}

          {/* Икона за чат */}
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

          {/* Текст - различен за mentor/user */}
          <span className="digibridge-chat-button-text">
            {isMentor ? '💬 Чат' : t('digiBridge.chatButton.help')}
          </span>
        </button>

        {/* Пулсиращ индикатор */}
        <span className="digibridge-chat-button-pulse"></span>
      </div>

      {/* За MENTOR - Multi Chat Hub */}
      {isMentor && isOpen && (
        <MentorChatHub onClose={() => setIsOpen(false)} />
      )}

      {/* За USER - Single Chat Window */}
      {!isMentor && isOpen && (
        <DigiBridgeChatWindow 
          onClose={() => setIsOpen(false)}
          existingConversation={activeConversation} 
        />
      )}
    </>
  );
};