// client/src/components/DigiMentorPanel/DigiMentorQuickActions/DigiMentorQuickActions.jsx

import { useTranslation } from 'react-i18next';
import './digiMentorQuickActions.css';

export const DigiMentorQuickActions = ({ onAction }) => {
  const { t } = useTranslation();

  const actions = [
    {
      key: 'start-session',
      type: 'primary',
      label: t('digiMentorQuickActions.startSession'),
      svg: (
        <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      )
    },
    {
      key: 'view-messages',
      type: 'secondary',
      label: t('digiMentorQuickActions.viewMessages'),
      svg: (
        <path d="M8 10H16M8 14H11M6 20L3 17V7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V15C21 16.1046 20.1046 17 19 17H9L6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      )
    },
    {
      key: 'my-students',
      type: 'secondary',
      label: t('digiMentorQuickActions.myStudents'),
      svg: (
        <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      )
    },
    {
      key: 'view-reviews',
      type: 'secondary',
      label: t('digiMentorQuickActions.viewReviews'),
      svg: (
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      )
    }
  ];

  return (
    <div className="digi-mentor-quick-actions">
      <h2 className="digi-mentor-quick-actions-title">
        {t('digiMentorQuickActions.title')}
      </h2>
      <div className="digi-mentor-quick-actions-grid">
        {actions.map((action) => (
          <button
            key={action.key}
            className={`digi-mentor-quick-actions-btn digi-mentor-quick-actions-btn-${action.type}`}
            onClick={() => onAction?.(action.key)}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {action.svg}
            </svg>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};