import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faCheckCircle,
    faClock,
    faChartLine
} from '@fortawesome/free-solid-svg-icons';
import './membershipStatsOverview.css';

const MembershipStatsOverview = ({ stats }) => {
    const { t } = useTranslation();

    const statsData = [
        {
            key: 'total',
            label: t('membershipStatsOverview.total'),
            value: stats.total,
            icon: faUsers,
            color: '#3b82f6',
            bgColor: '#eff6ff'
        },
        {
            key: 'active',
            label: t('membershipStatsOverview.active'),
            value: stats.active,
            icon: faCheckCircle,
            color: '#10b981',
            bgColor: '#ecfdf5'
        },
        {
            key: 'recent',
            label: t('membershipStatsOverview.recent'),
            value: stats.recent,
            icon: faClock,
            color: '#f59e0b',
            bgColor: '#fffbeb'
        },
        {
            key: 'avgSize',
            label: t('membershipStatsOverview.avgSize'),
            value: stats.avgSize,
            icon: faChartLine,
            color: '#8b5cf6',
            bgColor: '#f3e8ff'
        }
    ];

    return (
        <div className="membershipstatsoverview-container">
            <div className="membershipstatsoverview-grid">
                {statsData.map((stat) => (
                    <div key={stat.key} className="membershipstatsoverview-card">
                        <div className="membershipstatsoverview-card-content">
                            <div 
                                className="membershipstatsoverview-icon-wrapper"
                                style={{ 
                                    backgroundColor: stat.bgColor,
                                    color: stat.color 
                                }}
                            >
                                <FontAwesomeIcon 
                                    icon={stat.icon} 
                                    className="membershipstatsoverview-icon"
                                />
                            </div>
                            <div className="membershipstatsoverview-content">
                                <div className="membershipstatsoverview-value">
                                    {stat.value}
                                </div>
                                <div className="membershipstatsoverview-label">
                                    {stat.label}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MembershipStatsOverview;