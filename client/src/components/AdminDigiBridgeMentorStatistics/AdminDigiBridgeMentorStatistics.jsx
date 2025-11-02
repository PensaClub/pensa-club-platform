// src/components/AdminDigiBridgeMentorStatistics/AdminDigiBridgeMentorStatistics.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './adminDigiBridgeMentorStatistics.css';

import { StatisticsOverviewCards } from './StatisticsOverviewCards/StatisticsOverviewCards';
import { useAcademy } from '../contexts/AcademyProvider';
import { MOCK_MENTORS_DETAILED } from './mockMentorStatisticsData'; 
import { TopMentorsByCourses } from './TopMentorsByCourses/TopMentorsByCourses';
import { TopMentorsByOnlineTime } from './TopMentorsByOnlineTime/TopMentorsByOnlineTime';
import { ActivityTrendChart } from './ActivityTrendChart/ActivityTrendChart';
import { SessionQualityChart } from './SessionQualityChart/SessionQualityChart';
import { ResponseTimeChart } from './ResponseTimeChart/ResponseTimeChart';
import { MentorsBySpecialization } from './MentorsBySpecialization/MentorsBySpecialization';
import { DetailedMentorsTable } from './DetailedMentorsTable/DetailedMentorsTable';
import { ExportStatisticsButton } from './ExportStatisticsButton/ExportStatisticsButton';

export const AdminDigiBridgeMentorStatistics = () => {
    const { t } = useTranslation();
    const { getMentorStatisticsOverview, getMentorsBySpecialization, getAllMentors,getAllMentorsWithStats } = useAcademy(); 

    // ✅ STATE ЗА РЕАЛНИ ДАННИ
    const [overviewStats, setOverviewStats] = useState(null);
    const [specializationData, setSpecializationData] = useState([]);
    const [realMentors, setRealMentors] = useState([]); 
    
    // ✅ ВРЕМЕННО - MOCK ДАННИ ЗА ФАЗА 2 КОМПОНЕНТИТЕ
    const [mockMentors] = useState(MOCK_MENTORS_DETAILED);
    
    const [isLoading, setIsLoading] = useState(false);
    const [timeFilter, setTimeFilter] = useState('thisMonth');

    // ===================================
    // FETCH DATA
    // ===================================

    useEffect(() => {
        fetchMentorStatistics();
    }, []);

    const fetchMentorStatistics = async () => {
        try {
            setIsLoading(true);

            // ✅ FETCH OVERVIEW STATS
            const overviewResponse = await getMentorStatisticsOverview();
            if (overviewResponse?.success) {
                setOverviewStats(overviewResponse.stats);
            }

            // ✅ FETCH SPECIALIZATION DATA
            const specializationResponse = await getMentorsBySpecialization();
            if (specializationResponse?.success) {
                setSpecializationData(specializationResponse.specializations);
            }

            // ✅ FETCH ALL MENTORS FOR TABLE
            const mentorsResponse = await getAllMentorsWithStats();
            if (mentorsResponse?.success) {
                setRealMentors(mentorsResponse.mentors);
            }

        } catch (error) {
            console.error('❌ Error fetching mentor statistics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // ===================================
    // HANDLERS
    // ===================================

    const handleTimeFilterChange = (filter) => {
        setTimeFilter(filter);
        // TODO ФАЗА 2: Филтрирай данните според избрания период
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
                    {/* ✅ OVERVIEW CARDS - РЕАЛНИ ДАННИ */}
                    {overviewStats && (
                        <StatisticsOverviewCards stats={overviewStats} />
                    )}

                    {/* CHARTS SECTION */}
                    <div className="admin-digibridge-mentor-statistics-charts">
                        {/* TODO ФАЗА 2 - ВРЕМЕННО MOCK ДАННИ */}
                        <TopMentorsByCourses mentors={mockMentors} />
                        <TopMentorsByOnlineTime mentors={mockMentors} />
                        <ActivityTrendChart mentors={mockMentors} />
                        <SessionQualityChart mentors={mockMentors} />
                        <ResponseTimeChart mentors={mockMentors} />
                        
                        {/* ✅ SPECIALIZATION CHART - РЕАЛНИ ДАННИ */}
                        {specializationData.length > 0 && (
                            <MentorsBySpecialization data={specializationData} />
                        )}
                    </div>

                    {/* ✅ TABLE SECTION - РЕАЛНИ ДАННИ - недовършени полета , чака се фаза 2 */}
                    {realMentors.length > 0 && (
                        <DetailedMentorsTable mentors={realMentors} />
                    )}
                </>
            )}
        </div>
    );
};