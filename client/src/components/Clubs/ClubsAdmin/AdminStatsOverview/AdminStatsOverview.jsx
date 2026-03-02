import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faCheckCircle,
    faExclamationCircle,
    faPause,
    faBan,
    faShieldAlt,
    faChartLine
} from '@fortawesome/free-solid-svg-icons';
import './adminStatsOverview.css';

const AdminStatsOverview = ({ stats }) => {
    const { t } = useTranslation('clubs');

    // Calculate percentages and trends
    const calculations = useMemo(() => {
        if (!stats || stats.total === 0) {
            return {
                activePercentage: 0,
                verifiedPercentage: 0,
                pendingPercentage: 0,
                averageMembers: 0,
                healthScore: 0,
                pendingCount: 0
            };
        }

        const activePercentage = Math.round((stats.active / stats.total) * 100);
        const verifiedPercentage = Math.round((stats.verified / stats.total) * 100);
        
        // ПОПРАВЕНО: Pending = unverified клубове (isVerified: false)
        // Това са клубовете които чакат административно одобрение
        const pendingCount = stats.unverified || 0;
        const pendingPercentage = Math.round((pendingCount / stats.total) * 100);
        const averageMembers = Math.round(stats.totalMembers / stats.total);
        
        // Health score базиран на активни И верифицирани клубове
        const healthScore = Math.round(((stats.active + stats.verified) / (stats.total * 2)) * 100);

        return {
            activePercentage,
            verifiedPercentage,
            pendingPercentage,
            averageMembers,
            healthScore,
            pendingCount
        };
    }, [stats]);

    // Stats configuration
    const statsConfig = [
        {
            key: 'total',
            title: t('adminStatsOverview.cards.total.title'),
            value: stats?.total || 0,
            icon: faUsers,
            color: '#3b82f6',
            bgColor: '#dbeafe',
            description: t('adminStatsOverview.cards.total.description')
        },
        {
            key: 'active',
            title: t('adminStatsOverview.cards.active.title'),
            value: stats?.active || 0,
            icon: faCheckCircle,
            color: '#10b981',
            bgColor: '#d1fae5',
            percentage: calculations.activePercentage,
            description: t('adminStatsOverview.cards.active.description')
        },
        {
            key: 'pending',
            title: t('adminStatsOverview.cards.pending.title'),
            value: calculations.pendingCount, // unverified клубове
            icon: faExclamationCircle,
            color: '#f59e0b',
            bgColor: '#fef3c7',
            percentage: calculations.pendingPercentage,
            description: t('adminStatsOverview.cards.pending.description')
        },
        {
            key: 'verified',
            title: t('adminStatsOverview.cards.verified.title'),
            value: stats?.verified || 0,
            icon: faCheckCircle,
            color: '#8b5cf6',
            bgColor: '#ede9fe',
            percentage: calculations.verifiedPercentage,
            description: t('adminStatsOverview.cards.verified.description')
        }
    ];

    const detailedStats = [
        {
            label: t('adminStatsOverview.detailed.inactive'),
            value: stats?.inactive || 0,
            icon: faPause,
            color: '#6b7280'
        },
        {
            label: t('adminStatsOverview.detailed.suspended'),
            value: stats?.suspended || 0,
            icon: faBan,
            color: '#ef4444'
        },
        {
            label: t('adminStatsOverview.detailed.rejected'),
            value: stats?.rejected || 0,
            icon: faBan,
            color: '#dc2626'
        },
        {
            label: t('adminStatsOverview.detailed.unverified'),
            value: stats?.unverified || 0,
            icon: faShieldAlt,
            color: '#64748b'
        }
    ];

    return (
        <div className="adminstatsoverview-container">
            {/* Main Stats Cards */}
            <div className="adminstatsoverview-main-stats">
                {statsConfig.map((stat) => (
                    <div key={stat.key} className="adminstatsoverview-stat-card">
                        <div className="adminstatsoverview-stat-header">
                            <div 
                                className="adminstatsoverview-stat-icon"
                                style={{ backgroundColor: stat.bgColor }}
                            >
                                <FontAwesomeIcon 
                                    icon={stat.icon} 
                                    style={{ color: stat.color }}
                                />
                            </div>
                            <div className="adminstatsoverview-stat-content">
                                <div className="adminstatsoverview-stat-value">
                                    {(stat.value ?? 0).toLocaleString()}
                                    {stat.percentage !== undefined && (
                                        <span className="adminstatsoverview-stat-percentage">
                                            ({stat.percentage}%)
                                        </span>
                                    )}
                                </div>
                                <div className="adminstatsoverview-stat-title">
                                    {stat.title}
                                </div>
                            </div>
                        </div>
                        <div className="adminstatsoverview-stat-description">
                            {stat.description}
                        </div>
                        
                        {/* Progress bar for percentage stats */}
                        {stat.percentage !== undefined && (
                            <div className="adminstatsoverview-progress-container">
                                <div 
                                    className="adminstatsoverview-progress-bar"
                                    style={{ 
                                        backgroundColor: stat.bgColor,
                                        borderColor: stat.color 
                                    }}
                                >
                                    <div 
                                        className="adminstatsoverview-progress-fill"
                                        style={{ 
                                            width: `${stat.percentage}%`,
                                            backgroundColor: stat.color 
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Secondary Stats and Metrics */}
            <div className="adminstatsoverview-secondary-section">
                {/* Detailed Stats */}
                <div className="adminstatsoverview-detailed-stats">
                    <h3 className="adminstatsoverview-section-title">
                        {t('adminStatsOverview.detailed.title')}
                    </h3>
                    <div className="adminstatsoverview-detailed-grid">
                        {detailedStats.map((stat) => (
                            <div key={stat.label} className="adminstatsoverview-detailed-item">
                                <FontAwesomeIcon 
                                    icon={stat.icon} 
                                    style={{ color: stat.color }}
                                    className="adminstatsoverview-detailed-icon"
                                />
                                <span className="adminstatsoverview-detailed-value">
                                    {stat.value}
                                </span>
                                <span className="adminstatsoverview-detailed-label">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Health Score and Insights */}
                <div className="adminstatsoverview-insights">
                    <h3 className="adminstatsoverview-section-title">
                        {t('adminStatsOverview.insights.title')}
                    </h3>
                    
                    {/* Health Score */}
                    <div className="adminstatsoverview-health-score">
                        <div className="adminstatsoverview-health-header">
                            <FontAwesomeIcon icon={faChartLine} className="adminstatsoverview-health-icon" />
                            <div>
                                <div className="adminstatsoverview-health-title">
                                    {t('adminStatsOverview.insights.healthScore')}
                                </div>
                                <div className="adminstatsoverview-health-value">
                                    {calculations.healthScore}%
                                </div>
                            </div>
                        </div>
                        <div className="adminstatsoverview-health-bar">
                            <div 
                                className="adminstatsoverview-health-fill"
                                style={{ 
                                    width: `${calculations.healthScore}%`,
                                    backgroundColor: calculations.healthScore >= 70 ? '#10b981' : 
                                                   calculations.healthScore >= 40 ? '#f59e0b' : '#ef4444'
                                }}
                            />
                        </div>
                        <div className="adminstatsoverview-health-description">
                            {calculations.healthScore >= 70 
                                ? t('adminStatsOverview.insights.healthGood')
                                : calculations.healthScore >= 40 
                                ? t('adminStatsOverview.insights.healthMedium')
                                : t('adminStatsOverview.insights.healthPoor')
                            }
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="adminstatsoverview-metrics">
                        <div className="adminstatsoverview-metric">
                            <FontAwesomeIcon icon={faUsers} className="adminstatsoverview-metric-icon" />
                            <div className="adminstatsoverview-metric-content">
                                <div className="adminstatsoverview-metric-value">
                                    {calculations.averageMembers}
                                </div>
                                <div className="adminstatsoverview-metric-label">
                                    {t('adminStatsOverview.insights.avgMembers')}
                                </div>
                            </div>
                        </div>

                        <div className="adminstatsoverview-metric">
                            <FontAwesomeIcon icon={faUsers} className="adminstatsoverview-metric-icon" />
                            <div className="adminstatsoverview-metric-content">
                                <div className="adminstatsoverview-metric-value">
                                    {stats?.totalMembers?.toLocaleString() || 0}
                                </div>
                                <div className="adminstatsoverview-metric-label">
                                    {t('adminStatsOverview.insights.totalMembers')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Insights */}
                    <div className="adminstatsoverview-quick-insights">
                        {/* ПОПРАВЕНО: unverified клубове чакат одобрение */}
                        {calculations.pendingCount > 0 && (
                            <div className="adminstatsoverview-insight warning">
                                <FontAwesomeIcon icon={faExclamationCircle} />
                                <span>
                                    {t('adminStatsOverview.insights.pendingClubs', { 
                                        count: calculations.pendingCount 
                                    })}
                                </span>
                            </div>
                        )}
                        
                        {stats?.suspended > 0 && (
                            <div className="adminstatsoverview-insight error">
                                <FontAwesomeIcon icon={faBan} />
                                <span>
                                    {t('adminStatsOverview.insights.suspendedClubs', { 
                                        count: stats.suspended 
                                    })}
                                </span>
                            </div>
                        )}
                        
                        {calculations.verifiedPercentage < 50 && stats?.total > 0 && (
                            <div className="adminstatsoverview-insight info">
                                <FontAwesomeIcon icon={faCheckCircle} />
                                <span>
                                    {t('adminStatsOverview.insights.lowVerification')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminStatsOverview;