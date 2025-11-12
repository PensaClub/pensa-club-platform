// client/src/components/DigiMentorPanel/DigiMentorPanel.jsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/UserContext';
import { useAcademy } from '../contexts/AcademyProvider';
import { Loader } from '../Loader/Loader';
import { DigiMentorStats } from './DigiMentorStats/DigiMentorStats';
import { DigiMentorQuickActions } from './DigiMentorQuickActions/DigiMentorQuickActions';
import { DigiMentorRecentActivity } from './DigiMentorRecentActivity/DigiMentorRecentActivity';
import { DigiMentorUpcomingSessions } from './DigiMentorUpcomingSessions/DigiMentorUpcomingSessions';
import { DigiMentorStudentsList } from './DigiMentorStudentsList/DigiMentorStudentsList';
import { DigiMentorPerformanceChart } from './DigiMentorPerformanceChart/DigiMentorPerformanceChart';
import { MentorMeetings } from './MentorMeetings/MentorMeetings'; // ✅ ДОБАВИ
import './digiMentorPanel.css';

export const DigiMentorPanel = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { 
        getMentorDashboardStats, 
        getMentorRecentActivity, 
        getMentorUpcomingSessions,
        getMentorStudents,
        getMentorPerformanceData,
        getMentorMeetings, // ✅ ДОБАВИ
        isLoading 
    } = useAcademy();
    const { profileData } = useAuthContext();

    const [stats, setStats] = useState({
        totalStudents: 0,
        activeSessions: 0,
        completedSessions: 0,
        totalOnlineHours: 0,
        averageRating: 0,
        totalReviews: 0,
        totalMessages: 0,
        averageResponseTime: 0
    });

    const [error, setError] = useState(null);
    const [activities, setActivities] = useState([]);
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [students, setStudents] = useState([]);
    const [performanceData, setPerformanceData] = useState({});
    const [meetings, setMeetings] = useState([]); // ✅ ДОБАВИ

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsData, activityData, sessionsData, studentsData, performanceData, meetingsData] = await Promise.all([
                getMentorDashboardStats(),
                getMentorRecentActivity(),
                getMentorUpcomingSessions(),
                getMentorStudents(),
                getMentorPerformanceData(),
                getMentorMeetings() // ✅ ДОБАВИ
            ]);

            if (statsData && statsData.success) {
                setStats(statsData.stats);
            }

            if (activityData && activityData.success) {
                setActivities(activityData.activities);
            }

            if (sessionsData && sessionsData.success) {
                setUpcomingSessions(sessionsData.sessions);
            }

            if (studentsData && studentsData.success) {
                setStudents(studentsData.students);
            }

            if (performanceData && performanceData.success) {
                setPerformanceData(performanceData.data);
            }

            if (meetingsData && meetingsData.success) { // ✅ ДОБАВИ
                setMeetings(meetingsData.meetings);
            }
        } catch (err) {
            console.error('Error fetching mentor dashboard:', err);
            setError(t('digiMentorPanel.errorLoading'));
        }
    };

    const handleQuickAction = (action) => {
        switch (action) {
            case 'start-session':
                console.log('Start session - TODO');
                break;
            case 'view-messages':
                navigate('/profile/messages');
                break;
            case 'my-students':
                navigate('/profile/mentor-students');
                break;
            case 'view-reviews':
                navigate('/profile/mentor-reviews');
                break;
            default:
                break;
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="digi-mentor-panel">
            {/* HEADER */}
            <div className="digi-mentor-panel-header">
                <div className="digi-mentor-panel-header-content">
                    <h1 className="digi-mentor-panel-title">
                        {t('digiMentorPanel.title')}
                    </h1>
                    <p className="digi-mentor-panel-subtitle">
                        {t('digiMentorPanel.welcome')}, {profileData?.details?.username || profileData?.email?.split('@')[0]}!
                    </p>
                </div>
            </div>

            {/* ERROR */}
            {error && (
                <div className="digi-mentor-panel-error">
                    <p>{error}</p>
                </div>
            )}

            {/* STATS COMPONENT */}
            <DigiMentorStats stats={stats} />

            {/* QUICK ACTIONS COMPONENT */}
            <DigiMentorQuickActions onAction={handleQuickAction} />

            {/* UPCOMING SESSIONS */}
            <DigiMentorUpcomingSessions sessions={upcomingSessions} />

            {/* MEETINGS - СЛЕД UPCOMING SESSIONS */}
            <MentorMeetings meetings={meetings} onRefresh={fetchDashboardData} />

            {/* PERFORMANCE CHART */}
            <DigiMentorPerformanceChart performanceData={performanceData} />

            {/* STUDENTS LIST */}
            <DigiMentorStudentsList students={students} />

            {/* RECENT ACTIVITY */}
            <DigiMentorRecentActivity activities={activities} />
        </div>
    );
};