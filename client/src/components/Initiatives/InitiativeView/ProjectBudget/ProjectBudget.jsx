import React from 'react';
import { useTranslation } from 'react-i18next';
import './projectBudget.css';

export const ProjectBudget = ({ budget, currency = 'BGN' }) => {
    const { t } = useTranslation('content');

    // Проверка дали има budget данни
    if (!budget || (!budget.goal && !budget.total && !budget.funded)) {
        return null;
    }

    const goal = budget.goal || budget.total || 0;
    const funded = budget.funded || 0;
    const remaining = goal - funded;
    const progressPercentage = goal > 0 ? Math.round((funded / goal) * 100) : 0;

    return (
        <div className="budget-component">
            <div className="budget-card">
                {/* Budget Overview */}
                <div className="budget-overview">
                    <div className="budget-stats">
                        {goal > 0 && (
                            <div className="budget-stat-item">
                                <span className="budget-stat-label">{t('projectView.budget.goal')}</span>
                                <span className="budget-stat-value">
                                    {goal.toLocaleString()} {currency}
                                </span>
                            </div>
                        )}
                        
                        {funded > 0 && (
                            <div className="budget-stat-item">
                                <span className="budget-stat-label">{t('projectView.budget.funded')}</span>
                                <span className="budget-stat-value funded">
                                    {funded.toLocaleString()} {currency}
                                </span>
                            </div>
                        )}
                        
                        {goal > 0 && funded >= 0 && (
                            <div className="budget-stat-item">
                                <span className="budget-stat-label">{t('projectView.budget.remaining')}</span>
                                <span className="budget-stat-value remaining">
                                    {remaining.toLocaleString()} {currency}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {/* Progress Bar */}
                    {goal > 0 && funded >= 0 && (
                        <div className="budget-progress">
                            <div className="budget-progress-header">
                                <span className="progress-label">{t('projectView.budget.progress')}</span>
                                <span className="progress-percentage">
                                    {progressPercentage}%
                                </span>
                            </div>
                            <div className="budget-progress-bar">
                                <div 
                                    className="budget-progress-fill"
                                    style={{
                                        width: `${Math.min(progressPercentage, 100)}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Budget Status */}
                <div className="budget-status">
                    {goal > 0 && funded >= 0 && (
                        <div className="budget-status-item">
                            <span className="status-icon">
                                {funded >= goal ? '✅' : '🎯'}
                            </span>
                            <span className="status-text">
                                {funded >= goal 
                                    ? t('projectView.budget.fullyFunded')
                                    : t('projectView.budget.seekingFunding')
                                }
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};