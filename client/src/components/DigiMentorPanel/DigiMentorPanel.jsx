// client/src/components/DigiMentorPanel/DigiMentorPanel.jsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { useAuthContext } from '../contexts/UserContext';
import { useAcademy } from '../contexts/AcademyProvider';
import { useAcademyCourses } from '../contexts/AcademyCoursesProvider';
import { Loader } from '../Loader/Loader';
import { DigiMentorStats } from './DigiMentorStats/DigiMentorStats';
import { DigiMentorQuickActions } from './DigiMentorQuickActions/DigiMentorQuickActions';
import { DigiMentorRecentActivity } from './DigiMentorRecentActivity/DigiMentorRecentActivity';
import { DigiMentorUpcomingSessions } from './DigiMentorUpcomingSessions/DigiMentorUpcomingSessions';
import { DigiMentorStudentsList } from './DigiMentorStudentsList/DigiMentorStudentsList';
import { DigiMentorPerformanceChart } from './DigiMentorPerformanceChart/DigiMentorPerformanceChart';
import { MentorMeetings } from './MentorMeetings/MentorMeetings';
import DigiMentorSeminars from './DigiMentorSeminars/DigiMentorSeminars';
import './digiMentorPanel.css';

export const DigiMentorPanel = () => {
    const { t } = useTranslation('digibridge-mentor');
    const navigate = useLocalizedNavigate();
    const { 
        getMentorDashboardStats, 
        getMentorRecentActivity, 
        getMentorUpcomingSessions,
        getMentorStudents,
        getMentorPerformanceData,
        getMentorMeetings, 
        isLoading 
    } = useAcademy();
    const { profileData } = useAuthContext();
    const { getMentorSeminars } = useAcademyCourses();

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
    const [meetings, setMeetings] = useState([]);
    const [mentorSeminars, setMentorSeminars] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsData, activityData, sessionsData, studentsData, performanceData, meetingsData] = await Promise.all([
                getMentorDashboardStats().catch(() => null),
                getMentorRecentActivity().catch(() => null),
                getMentorUpcomingSessions().catch(() => null),
                getMentorStudents().catch(() => null),
                getMentorPerformanceData().catch(() => null),
                getMentorMeetings().catch(() => null)
            ]);

            if (statsData?.success) setStats(statsData.stats);
            if (activityData?.success) setActivities(activityData.activities);
            if (sessionsData?.success) setUpcomingSessions(sessionsData.sessions);
            if (studentsData?.success) setStudents(studentsData.students);
            if (performanceData?.success) setPerformanceData(performanceData.data);
            if (meetingsData?.success) setMeetings(meetingsData.meetings);
        } catch (err) {
            console.error('Error fetching mentor dashboard:', err);
            setError(t('digiMentorPanel.errorLoading'));
        }

        // Load seminars independently
        try {
            const semData = await getMentorSeminars();
            setMentorSeminars(semData?.seminars || []);
        } catch (err) {
            console.error('Error loading mentor seminars:', err);
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
                navigate('/mentor/reviews');
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

            {/* MENTOR SEMINARS */}
            <DigiMentorSeminars seminars={mentorSeminars} />

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