// src/components/AdminReAction/AdminReActionStats/AdminReActionStats.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import './adminReActionStats.css';

export const AdminReActionStats = ({ stats }) => {
    const { t } = useTranslation('reaction');

    if (!stats) return null;

    // ===================================
    // TOP STAT CARDS
    // ===================================

    const statCards = [
        {
            key: 'totalRequests',
            label: t('admin.stats.totalRequests'),
            value: stats.totalRequests || 0,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
            ),
            color: '#f78da7',
            gradient: 'linear-gradient(135deg, #f78da7 0%, #ec4899 100%)',
        },
        {
            key: 'completedVisits',
            label: t('admin.stats.completedVisits'),
            value: stats.completedVisits || 0,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            ),
            color: '#16a34a',
            gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        },
        {
            key: 'pendingRequests',
            label: t('admin.stats.pendingRequests'),
            value: stats.pendingRequests || 0,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            ),
            color: '#d97706',
            gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
        },
        {
            key: 'activeMentors',
            label: t('admin.stats.activeMentors'),
            value: stats.activeMentors || 0,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            color: '#7c3aed',
            gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
        },
    ];

    // ===================================
    // STATUS COLOR
    // ===================================

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return '#d97706';
            case 'reviewing': return '#3b82f6';
            case 'mentor_assigned': return '#7c3aed';
            case 'confirmed': return '#16a34a';
            case 'completed': return '#6b7280';
            case 'cancelled': return '#dc2626';
            default: return '#6b7280';
        }
    };

    // ===================================
    // RENDER
    // ===================================

    return (
        <div className="aras">
            {/* TOP STAT CARDS */}
            <div className="aras-cards">
                {statCards.map((card) => (
                    <div
                        key={card.key}
                        className="aras-card"
                        style={{ '--aras-card-gradient': card.gradient }}
                    >
                        <div className="aras-card-icon-wrapper">
                            <span
                                className="aras-card-icon"
                                style={{ backgroundColor: card.color }}
                            >
                                {card.icon}
                            </span>
                        </div>
                        <div className="aras-card-content">
                            <h3 className="aras-card-label">{card.label}</h3>
                            <p className="aras-card-value">{card.value}</p>
                        </div>
                        <div
                            className="aras-card-glow"
                            style={{ backgroundColor: card.color }}
                        ></div>
                    </div>
                ))}
            </div>

            {/* BREAKDOWN SECTIONS */}
            <div className="aras-sections">
                {/* Requests by Status */}
                {stats.byStatus && (
                    <div className="aras-section">
                        <h3 className="aras-section-title">{t('admin.stats.byStatus')}</h3>
                        <div className="aras-status-list">
                            {Object.entries(stats.byStatus).map(([status, count]) => (
                                <div key={status} className="aras-status-item">
                                    <span
                                        className="aras-status-dot"
                                        style={{ backgroundColor: getStatusColor(status) }}
                                    ></span>
                                    <span className="aras-status-label">
                                        {t(`admin.statuses.${status}`, status)}
                                    </span>
                                    <span className="aras-status-count">{count}</span>
                                    <div className="aras-status-bar">
                                        <div
                                            className="aras-status-bar-fill"
                                            style={{
                                                width: `${Math.min(100, (count / (stats.totalRequests || 1)) * 100)}%`,
                                                backgroundColor: getStatusColor(status),
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Visits by Month */}
                {stats.byMonth && stats.byMonth.length > 0 && (
                    <div className="aras-section">
                        <h3 className="aras-section-title">{t('admin.stats.byMonth')}</h3>
                        <div className="aras-month-table">
                            {stats.byMonth.map((item, i) => {
                                const maxCount = Math.max(...stats.byMonth.map((m) => m.count));
                                return (
                                    <div key={i} className="aras-month-row">
                                        <span className="aras-month-label">{item.month}</span>
                                        <div className="aras-month-bar">
                                            <div
                                                className="aras-month-bar-fill"
                                                style={{
                                                    width: `${Math.min(100, (item.count / (maxCount || 1)) * 100)}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <span className="aras-month-count">{item.count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="aras-columns">
                    {/* Top Cities */}
                    {stats.topCities && stats.topCities.length > 0 && (
                        <div className="aras-section">
                            <h3 className="aras-section-title">{t('admin.stats.topCities')}</h3>
                            <div className="aras-list">
                                {stats.topCities.map((item, i) => (
                                    <div key={i} className="aras-list-item">
                                        <span className="aras-list-rank">{i + 1}</span>
                                        <span className="aras-list-name">{item.city}</span>
                                        <span className="aras-list-count">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Topic Distribution */}
                    {stats.topTopics && stats.topTopics.length > 0 && (
                        <div className="aras-section">
                            <h3 className="aras-section-title">{t('admin.stats.topTopics')}</h3>
                            <div className="aras-list">
                                {stats.topTopics.map((item, i) => (
                                    <div key={i} className="aras-list-item">
                                        <span className="aras-list-rank">{i + 1}</span>
                                        <span className="aras-list-name">{item.topic}</span>
                                        <span className="aras-list-count">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
