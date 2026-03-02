// src/components/DigiBridge/DigiBridgeMentorDashboard/RequestCard.jsx

import { useTranslation } from 'react-i18next';
import './requestCard.css';

export const RequestCard = ({ request, onAccept, isAccepting }) => {
  const { t } = useTranslation('digibridge');

  // Форматиране на времето
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

  return (
    <div className="digibridge-request-card">
      
      {/* HEADER */}
      <div className="digibridge-request-card-header">
        <div className="digibridge-request-card-user">
          <div className="digibridge-request-card-avatar">
            {request.userName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="digibridge-request-card-user-info">
            <h3 className="digibridge-request-card-user-name">{request.userName}</h3>
            <p className="digibridge-request-card-user-email">{request.userEmail}</p>
          </div>
        </div>
        <div className="digibridge-request-card-time">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>{formatTime(request.createdAt)}</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="digibridge-request-card-content">
    
        <div className="digibridge-request-card-category">
          <span className="digibridge-request-card-category-emoji">
            {getCategoryEmoji(request.category)}
          </span>
          <span className="digibridge-request-card-category-text">
            {/* ✅ ОБНОВЕНО */}
            {t(`digiBridge.chatWindow.categories.${getCategoryTranslationKey(request.category)}`)}
          </span>
        </div>
        <div className="digibridge-request-card-problem">
          <strong>{t('digiBridge.dashboard.problem')}:</strong> {request.problem}
        </div>
      </div>

      {/* FOOTER */}
      <div className="digibridge-request-card-footer">
        <div className="digibridge-request-card-status">
          <span className="digibridge-request-card-status-dot"></span>
          {t('digiBridge.dashboard.waitingForMentor')}
        </div>
        <button
          className="digibridge-request-card-accept-btn"
          onClick={onAccept}
          disabled={isAccepting}
        >
          {isAccepting ? (
            <>
              <span className="digibridge-request-card-spinner"></span>
              {t('digiBridge.dashboard.accepting')}
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {t('digiBridge.dashboard.acceptRequest')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};