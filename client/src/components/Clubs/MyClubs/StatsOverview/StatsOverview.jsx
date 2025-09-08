import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faCheckCircle,
  faUserFriends,
  faChartBar
} from '@fortawesome/free-solid-svg-icons';
import './statsOverview.css';

const StatsOverview = ({ stats }) => {
  const { t } = useTranslation();

  const statItems = [
    {
      key: 'total',
      label: t('profile.clubs.stats.totalClubs'),
      value: stats.total,
      icon: faUsers,
      color: 'blue',
      description: t('profile.clubs.stats.totalClubsDesc')
    },
    {
      key: 'active',
      label: t('profile.clubs.stats.activeClubs'),
      value: stats.active,
      icon: faCheckCircle,
      color: 'green',
      description: t('profile.clubs.stats.activeClubsDesc')
    },
    {
      key: 'totalMembers',
      label: t('profile.clubs.stats.totalMembers'),
      value: stats.totalMembers,
      icon: faUserFriends,
      color: 'purple',
      description: t('profile.clubs.stats.totalMembersDesc')
    },
    {
      key: 'avgMembers',
      label: t('profile.clubs.stats.avgMembers'),
      value: stats.avgMembers,
      icon: faChartBar,
      color: 'orange',
      description: t('profile.clubs.stats.avgMembersDesc')
    }
  ];

  return (
    <div className="statsmyclubs-overview">
      <div className="statsmyclubs-grid">
        {statItems.map((item) => (
          <div 
            key={item.key} 
            className={`statsmyclubs-card statsmyclubs-card--${item.color}`}
          >
            <div className="statsmyclubs-card-header">
              <div className="statsmyclubs-icon-wrapper">
                <FontAwesomeIcon 
                  icon={item.icon} 
                  className="statsmyclubs-icon"
                />
              </div>
              <div className="statsmyclubs-info">
                <h3 className="statsmyclubs-value">{item.value}</h3>
                <p className="statsmyclubs-label">{item.label}</p>
              </div>
            </div>
            <div className="statsmyclubs-card-footer">
              <p className="statsmyclubs-description">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsOverview;