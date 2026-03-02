// src/components/AdminDigiBridgeMentorStatistics/AdminDigiBridgeMentorStatistics.jsx

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import './adminDigiBridgeMentorStatistics.css';

import { StatisticsOverviewCards } from './StatisticsOverviewCards/StatisticsOverviewCards';
import { useAcademy } from '../contexts/AcademyProvider';
import { MOCK_MENTORS_DETAILED } from './mockMentorStatisticsData';
import { DetailedMentorsTable } from './DetailedMentorsTable/DetailedMentorsTable';
import { ExportStatisticsButton } from './ExportStatisticsButton/ExportStatisticsButton';

// ✅ SKELETON IMPORTS
import { OverviewCardsSkeleton } from './Skeletons/OverviewCardsSkeleton';
import { ChartSkeleton } from './Skeletons/ChartSkeleton';
import { TableSkeleton } from './Skeletons/TableSkeleton';

// ✅ LAZY LOADED CHART COMPONENTS
const TopMentorsByCourses = lazy(() => import('./TopMentorsByCourses/TopMentorsByCourses').then(module => ({ default: module.TopMentorsByCourses })));
const TopMentorsByOnlineTime = lazy(() => import('./TopMentorsByOnlineTime/TopMentorsByOnlineTime').then(module => ({ default: module.TopMentorsByOnlineTime })));
const ActivityTrendChart = lazy(() => import('./ActivityTrendChart/ActivityTrendChart').then(module => ({ default: module.ActivityTrendChart })));
const SessionQualityChart = lazy(() => import('./SessionQualityChart/SessionQualityChart').then(module => ({ default: module.SessionQualityChart })));
const ResponseTimeChart = lazy(() => import('./ResponseTimeChart/ResponseTimeChart').then(module => ({ default: module.ResponseTimeChart })));
const MentorsBySpecialization = lazy(() => import('./MentorsBySpecialization/MentorsBySpecialization').then(module => ({ default: module.MentorsBySpecialization })));

export const AdminDigiBridgeMentorStatistics = () => {
    const { t } = useTranslation('digibridge');
    const { getMentorStatisticsOverview,
        getMentorsBySpecialization,
        getAllMentors,
        getAllMentorsWithStats,
        getTopMentorsByOnlineTime,
        getResponseTimesStats,
        getActivityTrendData,
        getSessionQualityData,
          getAllMentorsWithStatsFiltered,
    } = useAcademy();

    // ✅ STATE ЗА РЕАЛНИ ДАННИ
    const [overviewStats, setOverviewStats] = useState(null);
    const [specializationData, setSpecializationData] = useState([]);
    const [realMentors, setRealMentors] = useState([]);
    const [topMentorsByTime, setTopMentorsByTime] = useState([]);
    const [responseTimesData, setResponseTimesData] = useState(null);
    const [activityTrendData, setActivityTrendData] = useState([]);
    const [sessionQualityData, setSessionQualityData] = useState(null);
    const [allMentorsForCourses, setAllMentorsForCourses] = useState([]);
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

            // ⏱️ TODO: ПРЕМАХНИ ТОВА - САМО ЗА ТЕСТВАНЕ!
            await new Promise(resolve => setTimeout(resolve, 2000));

            // ✅ FETCH OVERVIEW STATS
            const overviewResponse = await getMentorStatisticsOverview();
            if (overviewResponse?.success) {
                setOverviewStats(overviewResponse.stats);
            }
            // ✅ FETCH ALL MENTORS FOR COURSES CHART
            const allMentorsResponse = await getAllMentors({ limit: 100 });
            if (allMentorsResponse?.success) {
                setAllMentorsForCourses(allMentorsResponse.mentors);
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

            // ✅ FETCH TOP MENTORS BY ONLINE TIME
            const topMentorsResponse = await getTopMentorsByOnlineTime(5);
            if (topMentorsResponse?.success) {
                setTopMentorsByTime(topMentorsResponse.mentors);
            }

            // ✅ FETCH RESPONSE TIMES
            const responseTimesResponse = await getResponseTimesStats();
            if (responseTimesResponse?.success) {
                setResponseTimesData(responseTimesResponse.stats);
            }

            // ✅ FETCH ACTIVITY TREND
            const activityTrendResponse = await getActivityTrendData(6);
            if (activityTrendResponse?.success) {
                setActivityTrendData(activityTrendResponse.trend);
            }

            // ✅ FETCH SESSION QUALITY
            const sessionQualityResponse = await getSessionQualityData();
            if (sessionQualityResponse?.success) {
                setSessionQualityData(sessionQualityResponse.quality);
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

 const handleTimeFilterChange = async (filter) => {
  setTimeFilter(filter);
  
  const monthsMap = {
    'thisMonth': 1,
    'lastMonth': 1,
    'last3Months': 3,
    'allTime': 12
  };
  
  const months = monthsMap[filter] || 6;
  
  try {
    setIsLoading(true);

    // // ⏱️ TODO: ПРЕМАХНИ ТОВА - САМО ЗА ТЕСТВАНЕ!
    // await new Promise(resolve => setTimeout(resolve, 500));
    
    // ✅ 1. FETCH FILTERED MENTORS
    const mentorsResponse = await getAllMentorsWithStatsFiltered(filter);
    if (mentorsResponse?.success) {
      setRealMentors(mentorsResponse.mentors);
    }
    
    // ✅ 2. FETCH ACTIVITY TREND
    const activityTrendResponse = await getActivityTrendData(months);
    if (activityTrendResponse?.success) {
      setActivityTrendData(activityTrendResponse.trend);
    }
    
  } catch (error) {
    console.error('❌ Error filtering statistics:', error);
  } finally {
    setIsLoading(false);
  }
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
                    <ExportStatisticsButton mentors={realMentors} stats={overviewStats} />

                </div>
            </div>

            {/* ✅ OVERVIEW CARDS - SKELETON OR REAL */}
            {isLoading && !overviewStats ? (
                <OverviewCardsSkeleton />
            ) : (
                overviewStats && <StatisticsOverviewCards stats={overviewStats} />
            )}

            {/* ✅ CHARTS SECTION - LAZY LOADED WITH SUSPENSE */}
            {isLoading && !activityTrendData.length ? (
                <div className="admin-digibridge-mentor-statistics-charts">
                    <ChartSkeleton />
                    <ChartSkeleton />
                    <ChartSkeleton />
                    <ChartSkeleton />
                    <ChartSkeleton />
                    <ChartSkeleton />
                </div>
            ) : (
                <div className="admin-digibridge-mentor-statistics-charts">
                    <Suspense fallback={<ChartSkeleton />}>
                        <TopMentorsByCourses mentors={allMentorsForCourses} limit={10} />
                    </Suspense>

                    <Suspense fallback={<ChartSkeleton />}>
                        <TopMentorsByOnlineTime mentors={topMentorsByTime} limit={10} />
                    </Suspense>

                    <Suspense fallback={<ChartSkeleton />}>
                        <ActivityTrendChart trendData={activityTrendData} />
                    </Suspense>

                    <Suspense fallback={<ChartSkeleton />}>
                        <SessionQualityChart qualityData={sessionQualityData} />
                    </Suspense>

                    <Suspense fallback={<ChartSkeleton />}>
                        <ResponseTimeChart responseTimesData={responseTimesData} limit={10} />
                    </Suspense>

                    {/* ✅ SPECIALIZATION CHART - LAZY LOADED */}
                    {specializationData.length > 0 && (
                        <Suspense fallback={<ChartSkeleton />}>
                            <MentorsBySpecialization data={specializationData} />
                        </Suspense>
                    )}
                </div>
            )}

            {/* ✅ TABLE SECTION - SKELETON OR REAL */}
            {isLoading && !realMentors.length ? (
                <TableSkeleton rows={5} />
            ) : (
                realMentors.length > 0 && <DetailedMentorsTable mentors={realMentors} />
            )}
        </div>
    );
};