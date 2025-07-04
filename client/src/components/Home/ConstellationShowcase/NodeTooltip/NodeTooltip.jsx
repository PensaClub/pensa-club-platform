import { useTranslation } from 'react-i18next';
import './nodeTooltip.css';

export const NodeTooltip = ({ node, mousePosition }) => {
  const { t } = useTranslation();

  if (!node || !mousePosition) return null;

  return (
    <div 
      className="constellation-tooltip-overlay"
      style={{
        left: mousePosition.x + 20,
        top: mousePosition.y - 30,
      }}
    >
      <div className="tooltip-content">
        <div className="tooltip-header">
          <span className="tooltip-icon">
            {node.type === 'initiative' && '🎯'}
            {node.type === 'project' && '🚀'}
            {node.type === 'story' && '📖'}
          </span>
          <span className="tooltip-type">
            {t(`home.constellation.${node.type}`)}
          </span>
        </div>
        
        <h4 className="tooltip-title">{node.title}</h4>
        
        {node.description && (
          <p className="tooltip-description">
            {node.description.length > 100 
              ? `${node.description.substring(0, 100)}...` 
              : node.description
            }
          </p>
        )}
        
        <div className="tooltip-action">
          {t('home.constellation.clickToExplore')}
        </div>
      </div>
    </div>
  );
};