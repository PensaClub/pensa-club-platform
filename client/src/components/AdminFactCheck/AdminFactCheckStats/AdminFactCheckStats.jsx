// src/components/AdminFactCheck/AdminFactCheckStats/AdminFactCheckStats.jsx

import { useTranslation } from 'react-i18next';
import './adminFactCheckStats.css';

export const AdminFactCheckStats = ({ modules, signals }) => {
    const { t } = useTranslation('factcheck');

    const statCards = [
        {
            key: 'totalModules',
            label: t('admin.stats.totalModules'),
            value: modules.length,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
            ),
            color: '#f78da7',
            gradient: 'linear-gradient(135deg, #f78da7 0%, #ec4899 100%)',
        },
        {
            key: 'publishedModules',
            label: t('admin.stats.publishedModules'),
            value: modules.filter((m) => m.status === 'published').length,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            ),
            color: '#16a34a',
            gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        },
        {
            key: 'totalSignals',
            label: t('admin.stats.totalSignals'),
            value: signals.length,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
            ),
            color: '#3b82f6',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        },
        {
            key: 'newSignals',
            label: t('admin.stats.newSignals'),
            value: signals.filter((s) => s.status === 'new').length,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            ),
            color: '#dc2626',
            gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        },
    ];

    return (
        <div className="afcst">
            <div className="afcst-grid">
                {statCards.map((card) => (
                    <div
                        key={card.key}
                        className="afcst-card"
                        style={{ '--afcst-card-gradient': card.gradient }}
                    >
                        <div className="afcst-card-icon-wrapper">
                            <span
                                className="afcst-card-icon"
                                style={{ backgroundColor: card.color }}
                            >
                                {card.icon}
                            </span>
                        </div>

                        <div className="afcst-card-content">
                            <h3 className="afcst-card-label">{card.label}</h3>
                            <p className="afcst-card-value">{card.value}</p>
                        </div>

                        <div
                            className="afcst-card-glow"
                            style={{ backgroundColor: card.color }}
                        ></div>
                    </div>
                ))}
            </div>
        </div>
    );
};
