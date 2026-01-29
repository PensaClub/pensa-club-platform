import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Video, Users, Presentation, TrendingUp } from 'lucide-react';
import './studentCreditsOverview.css';

const StudentCreditsOverview = ({ dashboardData = {} }) => {
    const { t } = useTranslation();
 const dashboard = dashboardData?.dashboard || {};
    const {
        totalCreditsEarned = 0,
        creditsFromCourses = 0,
        creditsFromLectures = 0,
        creditsFromSeminars = 0,
        creditsFromPresentations = 0
    } = dashboard;

    const getLevelInfo = (credits) => {
        if (credits >= 301) {
            return { 
                name: t('studentCreditsOverview.levels.master'), 
                color: '#b9f2ff', 
                gradient: 'linear-gradient(135deg, #67e8f9, #22d3ee)',
                min: 301, 
                max: 500,
                icon: '💎'
            };
        }
        if (credits >= 151) {
            return { 
                name: t('studentCreditsOverview.levels.expert'), 
                color: '#ffd700', 
                gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                min: 151, 
                max: 300,
                icon: '🥇'
            };
        }
        if (credits >= 51) {
            return { 
                name: t('studentCreditsOverview.levels.intermediate'), 
                color: '#c0c0c0', 
                gradient: 'linear-gradient(135deg, #d1d5db, #9ca3af)',
                min: 51, 
                max: 150,
                icon: '🥈'
            };
        }
        return { 
            name: t('studentCreditsOverview.levels.beginner'), 
            color: '#cd7f32', 
            gradient: 'linear-gradient(135deg, #d97706, #b45309)',
            min: 0, 
            max: 50,
            icon: '🥉'
        };
    };

    const levelInfo = getLevelInfo(totalCreditsEarned);
    const progressToNextLevel = ((totalCreditsEarned - levelInfo.min) / (levelInfo.max - levelInfo.min)) * 100;
    const creditsToNext = levelInfo.max - totalCreditsEarned;

    const creditCategories = [
        {
            key: 'courses',
            label: t('studentCreditsOverview.categories.courses'),
            value: creditsFromCourses,
            icon: BookOpen,
            color: '#3b82f6',
            gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        },
        {
            key: 'lectures',
            label: t('studentCreditsOverview.categories.lectures'),
            value: creditsFromLectures,
            icon: Video,
            color: '#8b5cf6',
            gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
        },
        {
            key: 'seminars',
            label: t('studentCreditsOverview.categories.seminars'),
            value: creditsFromSeminars,
            icon: Users,
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981, #059669)'
        },
        {
            key: 'presentations',
            label: t('studentCreditsOverview.categories.presentations'),
            value: creditsFromPresentations,
            icon: Presentation,
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
        }
    ];

    return (
        <div className="sdco-container">
            {/* Total Credits Card */}
            <div className="sdco-total-card">
                <div className="sdco-total-icon" style={{ background: levelInfo.gradient }}>
                    <span className="sdco-level-emoji">{levelInfo.icon}</span>
                </div>
                <div className="sdco-total-info">
                    <div className="sdco-total-label">{t('studentCreditsOverview.totalCredits')}</div>
                    <div className="sdco-total-value">{totalCreditsEarned}</div>
                    <div className="sdco-level-name" style={{ color: levelInfo.color }}>
                        {levelInfo.name}
                    </div>
                </div>
                <div className="sdco-level-progress">
                    <div className="sdco-progress-header">
                        <TrendingUp className="sdco-progress-icon" />
                        <span>{t('studentCreditsOverview.toNextLevel', { credits: Math.max(0, creditsToNext) })}</span>
                    </div>
                    <div className="sdco-progress-bar">
                        <div 
                            className="sdco-progress-fill"
                            style={{ 
                                width: `${Math.min(100, Math.max(0, progressToNextLevel))}%`,
                                background: levelInfo.gradient 
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Category Cards */}
            <div className="sdco-categories">
                {creditCategories.map((cat) => {
                    const IconComponent = cat.icon;
                    return (
                        <div key={cat.key} className="sdco-category-card">
                            <div className="sdco-category-icon" style={{ background: cat.gradient }}>
                                <IconComponent className="sdco-cat-icon" />
                            </div>
                            <div className="sdco-category-value">{cat.value}</div>
                            <div className="sdco-category-label">{cat.label}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StudentCreditsOverview;