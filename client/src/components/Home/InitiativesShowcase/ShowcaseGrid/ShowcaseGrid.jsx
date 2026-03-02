import { useTranslation } from 'react-i18next';
import { ShowcaseCard } from '../ShowcaseCard/ShowcaseCard';
import './showcaseGrid.css';

export const ShowcaseGrid = ({ data, activeTab, isVisible }) => {
  const { t } = useTranslation('home');

  return (
    <div className={`showcase-grid ${isVisible ? 'visible' : ''}`}>
      {data.length > 0 ? (
        data.map((item, index) => (
          <ShowcaseCard 
            key={item.id || item.slug || index}
            item={item}
            type={activeTab}
            index={index}
            isVisible={isVisible}
          />
        ))
      ) : (
        <div className="showcase-empty">
          <div className="empty-icon">
            {activeTab === 'initiatives' && '🎯'}
            {activeTab === 'projects' && '🚀'}
            {activeTab === 'stories' && '📖'}
          </div>
          <p>{t(`home.showcase.no${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`)}</p>
        </div>
      )}
    </div>
  );
};