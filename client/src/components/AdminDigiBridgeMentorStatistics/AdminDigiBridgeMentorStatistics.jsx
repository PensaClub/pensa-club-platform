// src/components/AdminDigiBridgeMentorStatistics/AdminDigiBridgeMentorStatistics.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './adminDigiBridgeMentorStatistics.css';

import { StatisticsOverviewCards } from './StatisticsOverviewCards/StatisticsOverviewCards';
import { useAcademy } from '../contexts/AcademyProvider';
import { MOCK_MENTORS_DETAILED, calculateOverallStats } from './mockMentorStatisticsData';
import { TopMentorsByCourses } from './TopMentorsByCourses/TopMentorsByCourses';
import { TopMentorsByOnlineTime } from './TopMentorsByOnlineTime/TopMentorsByOnlineTime';
import { ActivityTrendChart } from './ActivityTrendChart/ActivityTrendChart';
import { SessionQualityChart } from './SessionQualityChart/SessionQualityChart';
import { ResponseTimeChart } from './ResponseTimeChart/ResponseTimeChart';
import { MentorsBySpecialization } from './MentorsBySpecialization/MentorsBySpecialization';
import { DetailedMentorsTable } from './DetailedMentorsTable/DetailedMentorsTable';
import { ExportStatisticsButton } from './ExportStatisticsButton/ExportStatisticsButton';
// import { TopMentorsByCourses } from './TopMentorsByCourses/TopMentorsByCourses';
// import { TopMentorsByOnlineTime } from './TopMentorsByOnlineTime/TopMentorsByOnlineTime';
// import { ActivityTrendChart } from './ActivityTrendChart/ActivityTrendChart';
// import { SessionQualityChart } from './SessionQualityChart/SessionQualityChart';
// import { ResponseTimeChart } from './ResponseTimeChart/ResponseTimeChart';
// import { MentorsBySpecialization } from './MentorsBySpecialization/MentorsBySpecialization';
// import { DetailedMentorsTable } from './DetailedMentorsTable/DetailedMentorsTable';

export const AdminDigiBridgeMentorStatistics = () => {
    const { t } = useTranslation();
    const { getApprovedMentors } = useAcademy();

    // STATE
    const [mentors, setMentors] = useState(MOCK_MENTORS_DETAILED);
    const [isLoading, setIsLoading] = useState(false);
    const [timeFilter, setTimeFilter] = useState('thisMonth'); // thisMonth, lastMonth, last3Months, allTime

    // CALCULATED STATS
    const stats = calculateOverallStats(mentors);

    // ===================================
    // FETCH DATA
    // ===================================

    useEffect(() => {
        // TODO: Зареди от backend
        // fetchMentorStatistics();
    }, []);

    const fetchMentorStatistics = async () => {
        try {
            setIsLoading(true);
            // const data = await getApprovedMentors();
            // setMentors(data);
        } catch (error) {
            console.error('Error fetching mentor statistics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // ===================================
    // HANDLERS
    // ===================================

    const handleTimeFilterChange = (filter) => {
        setTimeFilter(filter);
        // TODO: Филтрирай данните според избрания период
    };

    const handleRefresh = () => {
        fetchMentorStatistics();
    };

    // ===================================
    // RENDER
    // ===================================

    return (
        <div className="admin-digibridge-mentor-statistics">
            {/* HERO SECTION */}
            <div className="admin-digibridge-mentor-statistics-hero">
                <div className="admin-digibridge-mentor-statistics-hero-content">
                    <h1>{t('AdminDigiBridgeMentorStatistics.title')}</h1>
                    <p>{t('AdminDigiBridgeMentorStatistics.description')}</p>
                </div>

                {/* FILTERS */}
                <div className="admin-digibridge-mentor-statistics-filters">
                    <select
                        value={timeFilter}
                        onChange={(e) => handleTimeFilterChange(e.target.value)}
                        className="admin-digibridge-mentor-statistics-select"
                    >
                        <option value="thisMonth">{t('AdminDigiBridgeMentorStatistics.thisMonth')}</option>
                        <option value="lastMonth">{t('AdminDigiBridgeMentorStatistics.lastMonth')}</option>
                        <option value="last3Months">{t('AdminDigiBridgeMentorStatistics.last3Months')}</option>
                        <option value="allTime">{t('AdminDigiBridgeMentorStatistics.allTime')}</option>
                    </select>

                    <button
                        onClick={handleRefresh}
                        className="admin-digibridge-mentor-statistics-refresh-btn"
                        disabled={isLoading}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                        </svg>
                        {t('AdminDigiBridgeMentorStatistics.refresh')}
                    </button>

                    {/* ✅ ДОБАВИ EXPORT БУТОНА ТУК */}
                    <ExportStatisticsButton mentors={mentors} stats={stats} />
                </div>
            </div>

            {/* LOADING STATE */}
            {isLoading ? (
                <div className="admin-digibridge-mentor-statistics-loading">
                    <div className="admin-digibridge-mentor-statistics-spinner"></div>
                    <p>{t('AdminDigiBridgeMentorStatistics.loading')}</p>
                </div>
            ) : (
                <>
                    {/* OVERVIEW CARDS */}
                    <StatisticsOverviewCards stats={stats} />

                    {/* CHARTS SECTION */}
                    <div className="admin-digibridge-mentor-statistics-charts">
                        <TopMentorsByCourses mentors={mentors} />
                        <TopMentorsByOnlineTime mentors={mentors} />
                        <ActivityTrendChart mentors={mentors} />
                        <SessionQualityChart mentors={mentors} />
                        <ResponseTimeChart mentors={mentors} />
                        <MentorsBySpecialization mentors={mentors} />
                    </div>

                    {/* TABLE SECTION */}
                    <DetailedMentorsTable mentors={mentors} />
                </>
            )}
        </div>
    );
};