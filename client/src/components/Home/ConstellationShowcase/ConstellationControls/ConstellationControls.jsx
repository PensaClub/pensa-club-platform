import { useTranslation } from 'react-i18next';
import './constellationControls.css';

export const ConstellationControls = ({ activeFilter, setActiveFilter, isVisible }) => {
  const { t } = useTranslation();

  const filters = [
    { id: 'all', icon: '🌌', label: t('home.constellation.controls.all') },
    { id: 'initiatives', icon: '🎯', label: t('home.constellation.controls.initiatives') },
    { id: 'projects', icon: '🚀', label: t('home.constellation.controls.projects') },
    { id: 'stories', icon: '📖', label: t('home.constellation.controls.stories') }
  ];

  return (
    <div className={`constellation-controls ${isVisible ? 'visible' : ''}`}>
      <div className="controls-title">
        {t('home.constellation.controls.title')}
      </div>
      
      <div className="filter-buttons-stars">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`filter-btn-controls ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            <span className="filter-icon">{filter.icon}</span>
            <span className="filter-label">{filter.label}</span>
          </button>
        ))}
      </div>

      <div className="controls-hint">
        {t('home.constellation.controls.hint')}
      </div>
    </div>
  );
};