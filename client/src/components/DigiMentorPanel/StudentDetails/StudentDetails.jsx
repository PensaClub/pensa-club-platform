// client/src/components/DigiMentorPanel/StudentDetails/StudentDetails.jsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../../contexts/AcademyProvider';
import { Loader } from '../../Loader/Loader';
import { StudentOverviewTab } from './StudentOverviewTab';
import { StudentCoursesTab } from './StudentCoursesTab';
import { StudentActivitiesTab } from './StudentActivitiesTab';
import { StudentAttendanceTab } from './StudentAttendanceTab';
import { StudentScheduleTab } from './StudentScheduleTab';
import { StudentNotesTab } from './StudentNotesTab';
import './studentDetails.css';

export const StudentDetails = () => {
  const { studentId } = useParams();
  const navigate = useLocalizedNavigate();
  const { t } = useTranslation('digibridge-mentor');
  
  const { getStudentDetails, isLoading: academyLoading } = useAcademy();
  
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getStudentDetails(studentId);
      
      if (result.success) {
        setStudent(result.student);
      } else {
        setError(result.message || t('studentDetails.errorLoading'));
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching student details:', err);
      setError(t('studentDetails.errorLoading'));
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="student-details-error">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h2>{error}</h2>
        <button onClick={() => navigate('/profile/mentor-dashboard/students')}>
          {t('studentDetails.backToList')}
        </button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="student-details-error">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h2>{t('studentDetails.notFound')}</h2>
        <button 
          className="student-details-back-btn"
          onClick={() => navigate('/profile/mentor-dashboard/students')}
        >
          {t('studentDetails.backToList')}
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: t('studentDetails.tabs.overview'), icon: '📊' },
    { id: 'courses', label: t('studentDetails.tabs.courses'), icon: '📚' },
    { id: 'activities', label: t('studentDetails.tabs.activities'), icon: '🎯' },
    { id: 'attendance', label: t('studentDetails.tabs.attendance'), icon: '📅' },
    { id: 'schedule', label: t('studentDetails.tabs.schedule'), icon: '🗓️' },
    { id: 'notes', label: t('studentDetails.tabs.notes'), icon: '📝' }
  ];

  return (
    <div className="student-details">
      {/* HEADER */}
      <div className="student-details-header">
        <button 
          className="student-details-back-btn"
          onClick={() => navigate('/profile/mentor-dashboard/students')}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t('studentDetails.backToList')}
        </button>

        <div className="student-details-header-content">
          <div className="student-details-profile">
            <div className="student-details-avatar">
              {student.avatar ? (
                <img src={student.avatar} alt={student.name} />
              ) : (
                <div className="student-details-avatar-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>

            <div className="student-details-info">
              <h1 className="student-details-name">{student.name}</h1>
              <div className="student-details-contact">
                <span className="student-details-email">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {student.user.email}
                </span>
                {student.user.phone && (
                  <span className="student-details-phone">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {student.user.phone}
                  </span>
                )}
              </div>
              <div className="student-details-meta">
                <span className="student-details-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('studentDetails.registeredSince')}: {new Date(student.registrationDate).toLocaleDateString('bg-BG')}
                </span>
                {student.currentMentor && (
                  <span className="student-details-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t('studentDetails.currentMentor')}: {student.currentMentor.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="student-details-quick-stats">
            <div className="student-details-stat-card student-details-stat-card-primary">
              <div className="student-details-stat-icon">💎</div>
              <div className="student-details-stat-content">
                <span className="student-details-stat-label">{t('studentDetails.totalCredits')}</span>
                <span className="student-details-stat-value">
                  {student.credits.totalEarned} / {student.credits.totalPossible}
                </span>
              </div>
            </div>

            <div className="student-details-stat-card">
              <div className="student-details-stat-icon">📚</div>
              <div className="student-details-stat-content">
                <span className="student-details-stat-label">{t('studentDetails.activeCourses')}</span>
                <span className="student-details-stat-value">
                  {student.courses.filter(c => c.status === 'in_progress').length}
                </span>
              </div>
            </div>

            <div className="student-details-stat-card">
              <div className="student-details-stat-icon">✅</div>
              <div className="student-details-stat-content">
                <span className="student-details-stat-label">{t('studentDetails.completedCourses')}</span>
                <span className="student-details-stat-value">
                  {student.courses.filter(c => c.status === 'completed').length}
                </span>
              </div>
            </div>

            <div className="student-details-stat-card">
              <div className="student-details-stat-icon">📊</div>
              <div className="student-details-stat-content">
                <span className="student-details-stat-label">{t('studentDetails.attendanceRate')}</span>
                <span className="student-details-stat-value">{student.attendance.attendanceRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="student-details-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`student-details-tab ${activeTab === tab.id ? 'student-details-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="student-details-tab-icon">{tab.icon}</span>
            <span className="student-details-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="student-details-content">
        {activeTab === 'overview' && <StudentOverviewTab student={student} />}
        {activeTab === 'courses' && <StudentCoursesTab student={student} />}
        {activeTab === 'activities' && <StudentActivitiesTab student={student} />}
        {activeTab === 'attendance' && <StudentAttendanceTab student={student} />}
        {activeTab === 'schedule' && <StudentScheduleTab student={student} />}
        {activeTab === 'notes' && <StudentNotesTab student={student} />}
      </div>
    </div>
  );
};