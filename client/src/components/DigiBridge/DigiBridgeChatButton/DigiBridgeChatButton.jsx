// src/components/DigiBridge/DigiBridgeChatButton/DigiBridgeChatButton.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './digiBridgeChatButton.css';
import { useAuthContext } from '../../contexts/UserContext';
import { listenToUnreadCounts } from '../../firebase/firebaseChat';

export const DigiBridgeChatButton = ({ onClick }) => {
  const { t } = useTranslation();
  const { isAuthentication, profileData } = useAuthContext();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Ако не е логнат, не слушай за съобщения
    if (!isAuthentication || !profileData) return;

    // ✅ ПРОМЕНИ ТОВА:
    const userEmail = profileData?.email || '';
    const userId = userEmail.replace(/\./g, '_dot_').replace(/@/g, '_at_');
    
    if (!userId) return;

    const unsubscribe = listenToUnreadCounts(userId, ({ totalUnread }) => {
      setUnreadCount(totalUnread);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthentication, profileData]);

  // Не показвай бутона ако не е логнат
  if (!isAuthentication) return null;

  return (
    <div className="digibridge-chat-button-wrapper">
      <button
        className="digibridge-chat-button"
        onClick={onClick}
        aria-label={t('digiBridge.chatButton.ariaLabel')}
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

        {/* Текст */}
        <span className="digibridge-chat-button-text">
          {t('digiBridge.chatButton.help')}
        </span>
      </button>

      {/* Пулсиращ индикатор */}
      <span className="digibridge-chat-button-pulse"></span>
    </div>
  );
};