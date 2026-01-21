import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/UserContext';
import { useAcademyCourses } from '../contexts/AcademyCoursesProvider';
import { useAcademy } from '../contexts/AcademyProvider';
import './studentDashboard.css';
import StudentDashboardHeader from './StudentDashboardHeader/StudentDashboardHeader';
import StudentQuickStats from './StudentDashboardHeader/StudentQuickStats/StudentQuickStats';
import StudentContinueLearning from './StudentContinueLearning/StudentContinueLearning';
import StudentUpcomingEvents from './StudentUpcomingEvents/StudentUpcomingEvents';
import StudentMentorCard from './StudentMentorCard/StudentMentorCard';
import StudentCertificates from './StudentCertificates/StudentCertificates';
import StudentCreditsOverview from './StudentCreditsOverview/StudentCreditsOverview';
import StudentRecentActivity from './StudentRecentActivity/StudentRecentActivity';

const StudentDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isAuthentication, profileData } = useAuthContext();
    const { getMentorById } = useAcademy();
    const {
        getMyDashboard,
        getContinueCourses,
        getUpcomingLectures,
        getUpcomingSeminars,
        getMyCertificates,
        getMyProgress
    } = useAcademyCourses();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [dashboardData, setDashboardData] = useState(null);
    const [continueCourses, setContinueCourses] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [progressData, setProgressData] = useState(null);
    const [currentMentor, setCurrentMentor] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!isAuthentication) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const [
                    dashboardRes,
                    continueRes,
                    lecturesRes,
                    seminarsRes,
                    certificatesRes,
                    progressRes
                ] = await Promise.all([
                    getMyDashboard(),
                    getContinueCourses(3),
                    getUpcomingLectures(3),
                    getUpcomingSeminars(3),
                    getMyCertificates(),
                    getMyProgress()
                ]);

                setDashboardData(dashboardRes);
                setContinueCourses(continueRes?.courses || []);

                const allEvents = [
                    ...(lecturesRes?.lectures || []).map(l => ({ ...l, type: 'lecture' })),
                    ...(seminarsRes?.seminars || []).map(s => ({ ...s, type: 'seminar' }))
                ].sort((a, b) => new Date(a.scheduledDate || a.date) - new Date(b.scheduledDate || b.date));
                setUpcomingEvents(allEvents.slice(0, 5));

                setCertificates(certificatesRes?.certificates || []);
                setProgressData(progressRes);

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message || t('studentDashboard.error'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [isAuthentication]);

    // Fetch mentor data when dashboardData is loaded
    useEffect(() => {
        const fetchMentor = async () => {
            if (dashboardData?.currentMentorId) {
                try {
                    const mentorData = await getMentorById(dashboardData.currentMentorId);
                    setCurrentMentor(mentorData);
                } catch (err) {
                    console.error('Error fetching mentor:', err);
                }
            }
        };

        fetchMentor();
    }, [dashboardData?.currentMentorId, getMentorById]);

    if (!isAuthentication) {
        return (
            <div className="sdb-container">
                <div className="sdb-auth-required">
                    <div className="sdb-auth-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <h2 className="sdb-auth-title">{t('studentDashboard.loginRequired')}</h2>
                    <p className="sdb-auth-text">{t('studentDashboard.loginRequiredText')}</p>
                    <button
                        className="sdb-auth-button"
                        onClick={() => navigate('/login')}
                    >
                        {t('studentDashboard.loginButton')}
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="sdb-container">
                <div className="sdb-loading">
                    <div className="sdb-loading-spinner"></div>
                    <p className="sdb-loading-text">{t('studentDashboard.loading')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="sdb-container">
                <div className="sdb-error">
                    <div className="sdb-error-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <h2 className="sdb-error-title">{t('studentDashboard.error')}</h2>
                    <p className="sdb-error-text">{error}</p>
                    <button
                        className="sdb-retry-button"
                        onClick={() => window.location.reload()}
                    >
                        {t('studentDashboard.retry')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="sdb-container">
            <div className="sdb-bg-grid"></div>
            <div className="sdb-bg-orb sdb-bg-orb-1"></div>
            <div className="sdb-bg-orb sdb-bg-orb-2"></div>

            <div className="sdb-content">
                {/* Header */}
                <section className="sdb-section sdb-header-section">
                    <StudentDashboardHeader
                        user={profileData}
                        dashboardData={dashboardData}
                    />
                </section>

                {/* Credits Overview */}
                <section className="sdb-section sdb-credits-section">
                    <StudentCreditsOverview dashboardData={dashboardData} />
                </section>

                {/* Main Grid */}
                <div className="sdb-main-grid">
                    <div className="sdb-column sdb-column-left">
                        {/* Quick Stats */}
                        <section className="sdb-section sdb-stats-section">
                            <StudentQuickStats data={dashboardData} />
                        </section>

                        {/* Mentor Card */}
                        <section className="sdb-section sdb-mentor-section">
                            <StudentMentorCard
                                mentor={currentMentor}
                                assignedDate={dashboardData?.mentorAssignedDate}
                            />
                        </section>
                    </div>

                    <div className="sdb-column sdb-column-right">
                        {/* Continue Learning */}
                        <section className="sdb-section sdb-continue-section">
                            <StudentContinueLearning courses={continueCourses} />
                        </section>

                        {/* Upcoming Events */}
                        <section className="sdb-section sdb-events-section">
                            <StudentUpcomingEvents events={upcomingEvents} />
                        </section>
                    </div>
                </div>

                {/* Certificates */}
                <section className="sdb-section sdb-certificates-section">
                    <StudentCertificates certificates={certificates} />
                </section>

                {/* Recent Activity */}
                <section className="sdb-section sdb-activity-section">
                    <StudentRecentActivity activities={progressData?.recentActivity || []} />
                </section>
            </div>
        </div>
    );
};

export default StudentDashboard;