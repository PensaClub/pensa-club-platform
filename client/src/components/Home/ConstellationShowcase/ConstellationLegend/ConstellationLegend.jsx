import { useTranslation } from 'react-i18next';
import './constellationLegend.css';

export const ConstellationLegend = ({ isVisible }) => {
  const { t } = useTranslation();

  const legendItems = [
    {
      type: 'initiative',
      icon: '🎯',
      color: '#1B8B8A',
      size: 'large',
      description: t('home.constellation.legend.initiative')
    },
    {
      type: 'project',
      icon: '🚀',
      color: '#E26020',
      size: 'medium',
      description: t('home.constellation.legend.project')
    },
    {
      type: 'story',
      icon: '📖',
      color: '#6366f1',
      size: 'small',
      description: t('home.constellation.legend.story')
    }
  ];

  return (
    <div className={`constellation-legend ${isVisible ? 'visible' : ''}`}>
      <h3 className="legend-title">
        {t('home.constellation.legend.title')}
      </h3>
      
      <div className="legend-items-stars">
        {legendItems.map((item) => (
          <div key={item.type} className="legend-item-stars">
            <div className="legend-node-demo">
              <svg width="60" height="40" viewBox="0 0 60 40">
                {/* Demo connection line */}
                <line 
                  x1="5" 
                  y1="20" 
                  x2="25" 
                  y2="20" 
                  stroke="rgba(148, 163, 184, 0.4)" 
                  strokeWidth="1"
                  strokeDasharray={item.type === 'story' ? "3,3" : "none"}
                />
                
                {/* Demo node */}
                <circle
                  cx="30"
                  cy="20"
                  r={item.size === 'large' ? '12' : item.size === 'medium' ? '8' : '6'}
                  fill="white"
                  stroke={item.color}
                  strokeWidth="2"
                />
                
                {/* Demo glow ring */}
                <circle
                  cx="30"
                  cy="20"
                  r={item.size === 'large' ? '16' : item.size === 'medium' ? '12' : '9'}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="1"
                  strokeOpacity="0.3"
                  className={item.type === 'initiative' ? 'demo-pulse' : ''}
                />
                
                {/* Demo icon */}
                <text
                  x="30"
                  y="24"
                  textAnchor="middle"
                  fontSize={item.size === 'large' ? '8' : '6'}
                >
                  {item.icon}
                </text>

                {/* Comet tail для story */}
                {item.type === 'story' && (
                  <ellipse
                    cx="18"
                    cy="20"
                    rx="8"
                    ry="1.5"
                    fill={item.color}
                    opacity="0.4"
                  />
                )}
              </svg>
            </div>
            
            <div className="legend-info">
              <div className="legend-type">
                {t(`home.constellation.types.${item.type}`)}
              </div>
              <div className="legend-description">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="legend-note">
        <span className="note-icon">💡</span>
        {t('home.constellation.legend.note')}
      </div>
    </div>
  );
};