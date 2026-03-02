// client/src/components/DigiMentorPanel/StudentDetails/StudentAttendanceTab.jsx

import { useTranslation } from 'react-i18next';
import './studentAttendanceTab.css';

export const StudentAttendanceTab = ({ student }) => {
  const { t } = useTranslation('digibridge-mentor');

  if (!student) return null;

  const { attendance, mentorHelp } = student;

  // ✅ Safe calculations
  const attendancePercentage = attendance.totalScheduledSessions > 0
    ? (attendance.attendedSessions / attendance.totalScheduledSessions) * 100
    : 0;

  const missedPercentage = attendance.totalScheduledSessions > 0
    ? (attendance.missedSessions / attendance.totalScheduledSessions) * 100
    : 0;

  const meetingCompletionPercentage = mentorHelp.scheduledMeetings > 0
    ? (mentorHelp.completedMeetings / mentorHelp.scheduledMeetings) * 100
    : 0;

  return (
    <div className="student-attendance-tab">
      {/* ATTENDANCE OVERVIEW */}
      <div className="student-attendance-section">
        <h3 className="student-attendance-section-title">
          📊 {t('studentDetails.attendance.overview')}
        </h3>

        <div className="student-attendance-cards">
          {/* ATTENDANCE RATE CARD */}
          <div className="student-attendance-main-card">
            <div className="student-attendance-circle">
              <svg viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="url(#attendance-gradient)"
                  strokeWidth="20"
                  strokeDasharray={`${(attendance.attendanceRate / 100) * 502.4} 502.4`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
                <defs>
                  <linearGradient id="attendance-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="student-attendance-circle-center">
                <span className="student-attendance-circle-value">{attendance.attendanceRate}%</span>
                <span className="student-attendance-circle-label">{t('studentDetails.attendance.rate')}</span>
              </div>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="student-attendance-stats-grid">
            <div className="student-attendance-stat-card">
              <div className="student-attendance-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
                📅
              </div>
              <div className="student-attendance-stat-content">
                <span className="student-attendance-stat-value">{attendance.totalScheduledSessions}</span>
                <span className="student-attendance-stat-label">{t('studentDetails.attendance.totalSessions')}</span>
              </div>
            </div>

            <div className="student-attendance-stat-card">
              <div className="student-attendance-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                ✅
              </div>
              <div className="student-attendance-stat-content">
                <span className="student-attendance-stat-value">{attendance.attendedSessions}</span>
                <span className="student-attendance-stat-label">{t('studentDetails.attendance.attended')}</span>
              </div>
            </div>

            <div className="student-attendance-stat-card">
              <div className="student-attendance-stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
                ❌
              </div>
              <div className="student-attendance-stat-content">
                <span className="student-attendance-stat-value">{attendance.missedSessions}</span>
                <span className="student-attendance-stat-label">{t('studentDetails.attendance.missed')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MENTOR HELP */}
      <div className="student-attendance-section">
        <h3 className="student-attendance-section-title">
          💬 {t('studentDetails.attendance.mentorHelp')}
        </h3>

        <div className="student-attendance-mentor-help">
          <div className="student-attendance-help-card">
            <div className="student-attendance-help-icon" style={{ background: '#fef3c7' }}>
              💬
            </div>
            <div className="student-attendance-help-content">
              <span className="student-attendance-help-value">{mentorHelp.totalChatSessions}</span>
              <span className="student-attendance-help-label">{t('studentDetails.attendance.chatSessions')}</span>
            </div>
          </div>

          <div className="student-attendance-help-card">
            <div className="student-attendance-help-icon" style={{ background: '#dbeafe' }}>
              ⏱️
            </div>
            <div className="student-attendance-help-content">
              <span className="student-attendance-help-value">{mentorHelp.totalChatHours}h</span>
              <span className="student-attendance-help-label">{t('studentDetails.attendance.chatHours')}</span>
            </div>
          </div>

          <div className="student-attendance-help-card">
            <div className="student-attendance-help-icon" style={{ background: '#fce7f3' }}>
              📅
            </div>
            <div className="student-attendance-help-content">
              <span className="student-attendance-help-value">
                {mentorHelp.completedMeetings} / {mentorHelp.scheduledMeetings}
              </span>
              <span className="student-attendance-help-label">{t('studentDetails.attendance.completedMeetings')}</span>
            </div>
          </div>

          <div className="student-attendance-help-card">
            <div className="student-attendance-help-icon" style={{ background: '#d1fae5' }}>
              📆
            </div>
            <div className="student-attendance-help-content">
              <span className="student-attendance-help-value">
                {mentorHelp.lastChatDate 
                  ? new Date(mentorHelp.lastChatDate).toLocaleDateString('bg-BG')
                  : t('studentDetails.attendance.noChats')}
              </span>
              <span className="student-attendance-help-label">{t('studentDetails.attendance.lastChat')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* VISUAL BREAKDOWN */}
      <div className="student-attendance-section">
        <h3 className="student-attendance-section-title">
          📈 {t('studentDetails.attendance.breakdown')}
        </h3>

        <div className="student-attendance-breakdown">
          <div className="student-attendance-breakdown-item">
            <div className="student-attendance-breakdown-header">
              <span className="student-attendance-breakdown-label">
                {t('studentDetails.attendance.attended')}
              </span>
              <span className="student-attendance-breakdown-value">
                {attendance.attendedSessions} / {attendance.totalScheduledSessions}
              </span>
            </div>
            <div className="student-attendance-breakdown-bar">
              <div
                className="student-attendance-breakdown-bar-fill"
                style={{
                  width: `${attendancePercentage}%`,
                  background: '#059669'
                }}
              />
            </div>
          </div>

          <div className="student-attendance-breakdown-item">
            <div className="student-attendance-breakdown-header">
              <span className="student-attendance-breakdown-label">
                {t('studentDetails.attendance.missed')}
              </span>
              <span className="student-attendance-breakdown-value">
                {attendance.missedSessions} / {attendance.totalScheduledSessions}
              </span>
            </div>
            <div className="student-attendance-breakdown-bar">
              <div
                className="student-attendance-breakdown-bar-fill"
                style={{
                  width: `${missedPercentage}%`,
                  background: '#dc2626'
                }}
              />
            </div>
          </div>

          <div className="student-attendance-breakdown-item">
            <div className="student-attendance-breakdown-header">
              <span className="student-attendance-breakdown-label">
                {t('studentDetails.attendance.meetingCompletion')}
              </span>
              <span className="student-attendance-breakdown-value">
                {mentorHelp.completedMeetings} / {mentorHelp.scheduledMeetings}
              </span>
            </div>
            <div className="student-attendance-breakdown-bar">
              <div
                className="student-attendance-breakdown-bar-fill"
                style={{
                  width: `${meetingCompletionPercentage}%`,
                  background: '#2563eb'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};