import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileAlt,
    faCheckCircle,
    faExclamationCircle,
    faClock,
    faChartLine,
    faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import './draftStatsOverview.css';

const DraftStatsOverview = ({ stats }) => {
    const { t } = useTranslation('clubs');

    if (!stats) {
        return null;
    }

    const { total, complete, incomplete, lastModified } = stats;

    // Calculate completion rate
    const completionRate = total > 0 ? Math.round((complete / total) * 100) : 0;

    // Format last modified date
    const formatLastModified = (date) => {
        if (!date) return t('draftStatsOverview.noRecentActivity');
        
        const now = new Date();
        const modified = new Date(date.metadata?.updatedAt || date.updatedAt || date);
        const diffInHours = Math.floor((now - modified) / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInHours < 1) {
            return t('draftStatsOverview.modifiedMinutesAgo');
        } else if (diffInHours < 24) {
            return t('draftStatsOverview.modifiedHoursAgo', { hours: diffInHours });
        } else if (diffInDays < 7) {
            return t('draftStatsOverview.modifiedDaysAgo', { days: diffInDays });
        } else {
            return modified.toLocaleDateString('bg-BG');
        }
    };

    const getCompletionColor = (rate) => {
        if (rate >= 75) return 'high';
        if (rate >= 50) return 'medium';
        if (rate >= 25) return 'low';
        return 'minimal';
    };

    const lastModifiedText = formatLastModified(lastModified);
    const completionColor = getCompletionColor(completionRate);

    return (
        <div className="draftstatsoverview-container">
            <div className="draftstatsoverview-grid">
                
                {/* Total Drafts */}
                <div className="draftstatsoverview-stat-card draftstatsoverview-total">
                    <div className="draftstatsoverview-stat-icon">
                        <FontAwesomeIcon icon={faFileAlt} />
                    </div>
                    <div className="draftstatsoverview-stat-content">
                        <div className="draftstatsoverview-stat-value">{total}</div>
                        <div className="draftstatsoverview-stat-label">
                            {t('draftStatsOverview.totalDrafts')}
                        </div>
                    </div>
                </div>

                {/* Complete Drafts */}
                <div className="draftstatsoverview-stat-card draftstatsoverview-complete">
                    <div className="draftstatsoverview-stat-icon">
                        <FontAwesomeIcon icon={faCheckCircle} />
                    </div>
                    <div className="draftstatsoverview-stat-content">
                        <div className="draftstatsoverview-stat-value">{complete}</div>
                        <div className="draftstatsoverview-stat-label">
                            {t('draftStatsOverview.completeDrafts')}
                        </div>
                    </div>
                </div>

                {/* Incomplete Drafts */}
                <div className="draftstatsoverview-stat-card draftstatsoverview-incomplete">
                    <div className="draftstatsoverview-stat-icon">
                        <FontAwesomeIcon icon={faExclamationCircle} />
                    </div>
                    <div className="draftstatsoverview-stat-content">
                        <div className="draftstatsoverview-stat-value">{incomplete}</div>
                        <div className="draftstatsoverview-stat-label">
                            {t('draftStatsOverview.incompleteDrafts')}
                        </div>
                    </div>
                </div>

                {/* Completion Rate */}
                <div className={`draftstatsoverview-stat-card draftstatsoverview-completion ${completionColor}`}>
                    <div className="draftstatsoverview-stat-icon">
                        <FontAwesomeIcon icon={faChartLine} />
                    </div>
                    <div className="draftstatsoverview-stat-content">
                        <div className="draftstatsoverview-stat-value">
                            {completionRate}%
                        </div>
                        <div className="draftstatsoverview-stat-label">
                            {t('draftStatsOverview.completionRate')}
                        </div>
                    </div>
                    <div className="draftstatsoverview-progress-bar">
                        <div 
                            className="draftstatsoverview-progress-fill"
                            style={{ '--completion': `${completionRate}%` }}
                        ></div>
                    </div>
                </div>

            </div>

            {/* Last Activity */}
            {lastModified && (
                <div className="draftstatsoverview-activity">
                    <div className="draftstatsoverview-activity-content">
                        <div className="draftstatsoverview-activity-icon">
                            <FontAwesomeIcon icon={faClock} />
                        </div>
                        <div className="draftstatsoverview-activity-text">
                            <span className="draftstatsoverview-activity-label">
                                {t('draftStatsOverview.lastActivity')}:
                            </span>
                            <span className="draftstatsoverview-activity-time">
                                {lastModifiedText}
                            </span>
                            {lastModified.name && (
                                <span className="draftstatsoverview-activity-draft">
                                    ({lastModified.name})
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick insights */}
            {total > 0 && (
                <div className="draftstatsoverview-insights">
                    <div className="draftstatsoverview-insights-content">
                        {completionRate >= 75 && (
                            <div className="draftstatsoverview-insight draftstatsoverview-insight-positive">
                                <FontAwesomeIcon icon={faCheckCircle} />
                                <span>{t('draftStatsOverview.insights.highCompletion')}</span>
                            </div>
                        )}
                        
                        {incomplete > complete && total > 1 && (
                            <div className="draftstatsoverview-insight draftstatsoverview-insight-warning">
                                <FontAwesomeIcon icon={faExclamationCircle} />
                                <span>{t('draftStatsOverview.insights.moreIncomplete')}</span>
                            </div>
                        )}

                        {total >= 5 && (
                            <div className="draftstatsoverview-insight draftstatsoverview-insight-info">
                                <FontAwesomeIcon icon={faFileAlt} />
                                <span>{t('draftStatsOverview.insights.manyDrafts')}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DraftStatsOverview;