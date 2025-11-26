// src/components/AdminDigiBridgeStudents/StudentsStatsCharts/StudentsAttendanceChart.jsx

import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import './studentsStatsCharts.css';

export const StudentsAttendanceChart = ({ data, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="studentsStatsChart">
        <div className="studentsStatsChart-loading">
          <div className="studentsStatsChart-spinner"></div>
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="studentsStatsChart">
        <div className="studentsStatsChart-empty">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <path d="M8 48L24 32L40 40L56 16" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.3"/>
            <circle cx="24" cy="32" r="4" fill="currentColor" opacity="0.3"/>
            <circle cx="40" cy="40" r="4" fill="currentColor" opacity="0.3"/>
          </svg>
          <span>{t('adminDigiBridgeStudents.charts.noData')}</span>
        </div>
      </div>
    );
  }

  // Transform data
  const chartData = data.monthly || data.weekly || data.trends || [];
  const avgAttendance = data.average || data.avgAttendance || 0;
  const trend = data.trend || 'stable';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="studentsStatsChart-tooltip">
          <p className="studentsStatsChart-tooltipLabel">{label}</p>
          <p className="studentsStatsChart-tooltipValue">
            {payload[0].value}% {t('adminDigiBridgeStudents.charts.attendance')}
          </p>
        </div>
      );
    }
    return null;
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  return (
    <div className="studentsStatsChart">
      <div className="studentsStatsChart-header">
        <h3 className="studentsStatsChart-title">
          <span className="studentsStatsChart-icon">📅</span>
          {t('adminDigiBridgeStudents.charts.attendanceTrends')}
        </h3>
        <div className="studentsStatsChart-trend">
          <span className="studentsStatsChart-trendIcon">{getTrendIcon()}</span>
          <span className="studentsStatsChart-trendLabel">
            {t(`adminDigiBridgeStudents.charts.trend.${trend}`)}
          </span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="studentsStatsChart-summary">
        <div className="studentsStatsChart-summaryCard studentsStatsChart-summaryCard--teal">
          <span className="studentsStatsChart-summaryValue">{avgAttendance.toFixed(1)}%</span>
          <span className="studentsStatsChart-summaryLabel">
            {t('adminDigiBridgeStudents.charts.avgAttendance')}
          </span>
        </div>
      </div>

      <div className="studentsStatsChart-body">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="attendance" 
              stroke="#14b8a6" 
              strokeWidth={2}
              fill="url(#attendanceGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};