import React from 'react';
import { useTranslation } from 'react-i18next';
import './milestones.css';

export const Milestones = ({ milestones = [] }) => {
    const { t } = useTranslation();

    // Проверка дали има milestones
    if (!milestones || milestones.length === 0) {
        return null;
    }

    // Сортиране на milestones по ID
    const sortedMilestones = [...milestones].sort((a, b) => a.id - b.id);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return '✅';
            case 'in-progress':
                return '🔄';
            case 'pending':
                return '⏳';
            case 'cancelled':
                return '❌';
            default:
                return '📅';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return '#059669';
            case 'in-progress':
                return '#1B8B8A';
            case 'pending':
                return '#f59e0b';
            case 'cancelled':
                return '#dc2626';
            default:
                return '#64748b';
        }
    };

    // Проверка дали датата е валидна
    const isValidDate = (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const year = date.getFullYear();
        // Проверяваме дали годината е разумна (не е 1970 или друга "мокната" година)
        return !isNaN(date.getTime()) && year > 1970 && year < 2100;
    };

    return (
        <div className="milestones-component">
            <div className="milestones-timeline">
                {sortedMilestones.map((milestone, index) => {
                    const statusColor = getStatusColor(milestone.status);
                    const isLast = index === sortedMilestones.length - 1;
                    const hasValidDate = isValidDate(milestone.dueDate);

                    return (
                        <div key={milestone.id} className="milestone-item">
                            <div className="milestone-timeline-container">
                                <div 
                                    className={`milestone-dot ${milestone.status}`}
                                    style={{ backgroundColor: statusColor }}
                                >
                                    <span className="milestone-icon">
                                        {getStatusIcon(milestone.status)}
                                    </span>
                                </div>
                                
                                {!isLast && (
                                    <div className="milestone-line"></div>
                                )}
                            </div>
                            
                            <div className="milestone-content">
                                <div className="milestone-header">
                                    <h4 className="milestone-title">{milestone.title}</h4>
                                    <span 
                                        className={`milestone-status ${milestone.status}`}
                                        style={{ color: statusColor }}
                                    >
                                        {t(`projects.milestones.status.${milestone.status}`)}
                                    </span>
                                </div>
                                
                                <div className="milestone-meta">
                                    {hasValidDate && (
                                        <div className="milestone-date">
                                            <span className="date-icon">📅</span>
                                            <span className="date-text">
                                                {new Date(milestone.dueDate).toLocaleDateString('bg-BG', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {milestone.description && (
                                        <p className="milestone-description">{milestone.description}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Timeline Summary */}
            <div className="milestones-summary">
                <div className="summary-stats">
                    <div className="summary-stat">
                        <span className="stat-value">
                            {sortedMilestones.filter(m => m.status === 'completed').length}
                        </span>
                        <span className="stat-label">{t('projects.milestones.completed')}</span>
                    </div>
                    
                    <div className="summary-stat">
                        <span className="stat-value">
                            {sortedMilestones.filter(m => m.status === 'in-progress').length}
                        </span>
                        <span className="stat-label">{t('projects.milestones.inProgress')}</span>
                    </div>
                    
                    <div className="summary-stat">
                        <span className="stat-value">
                            {sortedMilestones.filter(m => m.status === 'pending').length}
                        </span>
                        <span className="stat-label">{t('projects.milestones.pending')}</span>
                    </div>

                    <div className="summary-stat">
                        <span className="stat-value">
                            {sortedMilestones.filter(m => m.status === 'cancelled').length}
                        </span>
                        <span className="stat-label">{t('projects.milestones.cancelled')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};