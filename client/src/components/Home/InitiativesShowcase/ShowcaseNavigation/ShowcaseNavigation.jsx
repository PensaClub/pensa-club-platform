import { useTranslation } from 'react-i18next';
import './showcaseNavigation.css';

export const ShowcaseNavigation = ({ activeTab, setActiveTab, featuredData, isVisible }) => {
  const { t } = useTranslation();

  const tabs = [
    { id: 'initiatives', icon: '🎯' },
    { id: 'projects', icon: '🚀' },
    { id: 'stories', icon: '📖' }
  ];

  return (
    <div className={`showcase-nav ${isVisible ? 'visible' : ''}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-text">
            {t(`home.showcase.${tab.id}`)}
          </span>
          <span className="tab-count">
            {featuredData[tab.id]?.length || 0}
          </span>
        </button>
      ))}
    </div>
  );
};