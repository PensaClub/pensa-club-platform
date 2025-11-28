// src/components/AdminDigiBridgeStudentApplications/Charts/ApplicationsByMentorChart.jsx

import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import './applicationsByMentorChart.css';

const BAR_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#a78bfa',
  '#c4b5fd',
  '#ddd6fe',
  '#ede9fe',
  '#f5f3ff',
  '#818cf8',
  '#a5b4fc',
  '#c7d2fe'
];

export const ApplicationsByMentorChart = ({ data, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="applicationsByMentorChart">
        <div className="applicationsByMentorChart-loading">
          <div className="applicationsByMentorChart-spinner"></div>
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="applicationsByMentorChart">
        <div className="applicationsByMentorChart-empty">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <rect x="8" y="32" width="12" height="24" rx="2" fill="currentColor" opacity="0.2" />
            <rect x="26" y="20" width="12" height="36" rx="2" fill="currentColor" opacity="0.3" />
            <rect x="44" y="8" width="12" height="48" rx="2" fill="currentColor" opacity="0.4" />
          </svg>
          <span>{t('applicationsByMentorChart.noData')}</span>
        </div>
      </div>
    );
  }

  // Вземи топ 10 ментори
  const chartData = data.slice(0, 10).map((item, index) => ({
    name: item.mentorName || t('applicationsByMentorChart.unknownMentor'),
    count: item.count || 0,
    photo: item.mentorPhoto,
    color: BAR_COLORS[index % BAR_COLORS.length]
  }));

  const maxCount = Math.max(...chartData.map(d => d.count));
  const total = chartData.reduce((sum, item) => sum + item.count, 0);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = total > 0 ? ((data.count / total) * 100).toFixed(1) : 0;

      return (
        <div className="applicationsByMentorChart-tooltip">
          <div className="applicationsByMentorChart-tooltipHeader">
            <div className="applicationsByMentorChart-tooltipAvatar">
              {data.photo ? (
                <img src={data.photo} alt={data.name} />
              ) : (
                <span>{data.name?.charAt(0)?.toUpperCase() || '?'}</span>
              )}
            </div>
            <span className="applicationsByMentorChart-tooltipName">{data.name}</span>
          </div>
          <div className="applicationsByMentorChart-tooltipValue">
            <strong>{data.count}</strong>
            <span>{t('applicationsByMentorChart.applications')}</span>
            <small>({percentage}%)</small>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="applicationsByMentorChart">
      {/* Header */}
      <div className="applicationsByMentorChart-header">
        <span className="applicationsByMentorChart-subtitle">
          {t('applicationsByMentorChart.topMentors', { count: chartData.length })}
        </span>
        <span className="applicationsByMentorChart-total">
          {t('applicationsByMentorChart.totalApplications')}: <strong>{total}</strong>
        </span>
      </div>

      {/* Chart */}
      <div className="applicationsByMentorChart-chartWrapper">
        <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 40)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <XAxis 
              type="number" 
              domain={[0, maxCount + 1]}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={120}
              tick={{ fontSize: 12, fill: '#374151' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
            <Bar 
              dataKey="count" 
              radius={[0, 6, 6, 0]}
              maxBarSize={28}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="applicationsByMentorChart-bar"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Mentor Cards */}
      <div className="applicationsByMentorChart-mentorCards">
        {chartData.slice(0, 5).map((mentor, index) => {
          const percentage = total > 0 ? ((mentor.count / total) * 100).toFixed(0) : 0;
          
          return (
            <div 
              key={index} 
              className="applicationsByMentorChart-mentorCard"
              style={{ borderLeftColor: mentor.color }}
            >
              <div className="applicationsByMentorChart-mentorAvatar">
                {mentor.photo ? (
                  <img src={mentor.photo} alt={mentor.name} />
                ) : (
                  <span style={{ background: mentor.color }}>
                    {mentor.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <div className="applicationsByMentorChart-mentorInfo">
                <span className="applicationsByMentorChart-mentorName">{mentor.name}</span>
                <span className="applicationsByMentorChart-mentorCount">
                  {mentor.count} {t('applicationsByMentorChart.applicationsShort')}
                  <small>({percentage}%)</small>
                </span>
              </div>
              <div className="applicationsByMentorChart-mentorRank">
                #{index + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};