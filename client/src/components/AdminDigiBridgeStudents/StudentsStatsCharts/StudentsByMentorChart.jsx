// src/components/AdminDigiBridgeStudents/StudentsStatsCharts/StudentsByMentorChart.jsx

import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './studentsByMentorChart.css';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

export const StudentsByMentorChart = ({ data, loading }) => {
  const { t } = useTranslation('digibridge-students');

  if (loading) {
    return (
      <div className="studentsByMentorChart">
        <div className="studentsByMentorChart-loading">
          <div className="studentsByMentorChart-spinner"></div>
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="studentsByMentorChart">
        <div className="studentsByMentorChart-empty">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <rect x="8" y="32" width="12" height="24" rx="2" fill="currentColor" opacity="0.2"/>
            <rect x="26" y="20" width="12" height="36" rx="2" fill="currentColor" opacity="0.3"/>
            <rect x="44" y="8" width="12" height="48" rx="2" fill="currentColor" opacity="0.4"/>
          </svg>
          <span>{t('adminDigiBridgeStudents.charts.noData')}</span>
        </div>
      </div>
    );
  }

  const chartData = Array.isArray(data) ? data.map(item => ({
    name: item.mentorName || item.name || t('adminDigiBridgeStudents.noMentor'),
    students: item.studentCount || item.count || item.value || 0,
    avatar: item.mentorPhoto || item.mentorAvatar || item.avatar
  })) : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="studentsByMentorChart-tooltip">
          <p className="studentsByMentorChart-tooltipLabel">{label}</p>
          <p className="studentsByMentorChart-tooltipValue">
            {payload[0].value} {t('adminDigiBridgeStudents.charts.students')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="studentsByMentorChart">
      <div className="studentsByMentorChart-header">
        <h3 className="studentsByMentorChart-title">
          <span className="studentsByMentorChart-icon">🎓</span>
          {t('adminDigiBridgeStudents.charts.byMentor')}
        </h3>
      </div>

      <div className="studentsByMentorChart-body">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={120}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="students" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Mentor Cards */}
        <div className="studentsByMentorChart-mentorCards">
          {chartData.slice(0, 5).map((mentor, index) => (
            <div key={index} className="studentsByMentorChart-mentorCard">
              <div 
                className="studentsByMentorChart-mentorAvatar"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              >
                {mentor.avatar ? (
                  <img src={mentor.avatar} alt={mentor.name} />
                ) : (
                  <span>{mentor.name?.charAt(0)?.toUpperCase() || '?'}</span>
                )}
              </div>
              <div className="studentsByMentorChart-mentorInfo">
                <span className="studentsByMentorChart-mentorName">{mentor.name}</span>
                <span className="studentsByMentorChart-mentorCount">
                  {mentor.students} {t('adminDigiBridgeStudents.charts.students')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};