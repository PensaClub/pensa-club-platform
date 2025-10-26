// src/components/DigiBridge/UserChatsPage/UserChatCard.jsx

import { useTranslation } from 'react-i18next';
import './userChatCard.css';

export const UserChatCard = ({ conversation, isCompleted = false, onOpen }) => {
  const { t } = useTranslation();

  // Форматиране на време
  const formatTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('digiBridge.dashboard.timeJustNow');
    if (minutes < 60) return t('digiBridge.dashboard.timeMinutesAgo', { count: minutes });
    if (hours < 24) return t('digiBridge.dashboard.timeHoursAgo', { count: hours });
    return t('digiBridge.dashboard.timeDaysAgo', { count: days });
  };

  // Категория емоджи
  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'General': '❓',
      'Online Banking': '🏦',
      'Social Media': '📱',
      'Digital Security': '🔒',
      'Email': '📧',
      'Basic Computer Skills': '💻'
    };
    return emojiMap[category] || '❓';
  };

  // Категория превод
  const getCategoryTranslationKey = (category) => {
    const keyMap = {
      'General': 'general',
      'Online Banking': 'banking',
      'Social Media': 'socialMedia',
      'Digital Security': 'security',
      'Email': 'email',
      'Basic Computer Skills': 'computer'
    };
    return keyMap[category] || 'general';
  };

  return (
    <div 
      className={`user-chat-card ${isCompleted ? 'completed' : 'active'}`}
      onClick={onOpen}
    >
      
      {/* MENTOR INFO */}
      <div className="user-chat-card-mentor">
        <div className="user-chat-card-avatar">
          {conversation.mentorName?.charAt(0)?.toUpperCase() || 'M'}
        </div>
        <div className="user-chat-card-details">
          <h3 className="user-chat-card-mentor-name">
            {conversation.mentorName || t('digiBridge.userChats.mentor')}
          </h3>
          <div className="user-chat-card-category">
            <span className="user-chat-card-category-emoji">
              {getCategoryEmoji(conversation.category)}
            </span>
            <span className="user-chat-card-category-text">
              {t(`digiBridge.chatWindow.categories.${getCategoryTranslationKey(conversation.category)}`)}
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="user-chat-card-content">
        <div className="user-chat-card-problem">
          <strong>{t('digiBridge.dashboard.problem')}:</strong> {conversation.problem}
        </div>
        
        {conversation.lastMessage && (
          <div className="user-chat-card-last-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>{conversation.lastMessage}</span>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="user-chat-card-footer">
        {/* Status */}
        <div className={`user-chat-card-status ${isCompleted ? 'completed' : 'active'}`}>
          {isCompleted ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {t('digiBridge.dashboard.completed')}
            </>
          ) : (
            <>
              <span className="user-chat-card-status-dot"></span>
              {t('digiBridge.dashboard.active')}
            </>
          )}
        </div>

        {/* Time */}
        <div className="user-chat-card-time">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>
            {conversation.lastMessageAt 
              ? formatTime(conversation.lastMessageAt)
              : formatTime(conversation.startedAt)
            }
          </span>
        </div>
      </div>

      {/* ARROW ICON */}
      <div className="user-chat-card-arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>

    </div>
  );
};