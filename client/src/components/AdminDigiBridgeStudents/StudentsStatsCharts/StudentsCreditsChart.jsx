// src/components/AdminDigiBridgeStudents/StudentsStatsCharts/StudentsCreditsChart.jsx

import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './studentsStatsCharts.css';

export const StudentsCreditsChart = ({ data, loading }) => {
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
            <path d="M32 8l6 12 14 2-10 10 2 14-12-6-12 6 2-14-10-10 14-2z" fill="currentColor" opacity="0.3"/>
          </svg>
          <span>{t('adminDigiBridgeStudents.charts.noData')}</span>
        </div>
      </div>
    );
  }

  // Transform data for chart
  const chartData = data.ranges ? data.ranges.map(range => ({
    range: range.label || range.range,
    count: range.count || 0
  })) : [
    { range: '0-10', count: data['0-10'] || 0 },
    { range: '11-25', count: data['11-25'] || 0 },
    { range: '26-50', count: data['26-50'] || 0 },
    { range: '51-100', count: data['51-100'] || 0 },
    { range: '100+', count: data['100+'] || 0 }
  ];

  const totalStudents = chartData.reduce((sum, item) => sum + item.count, 0);
  const avgCredits = data.average || data.avgCredits || 0;
  const maxCredits = data.max || data.maxCredits || 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / totalStudents) * 100).toFixed(1);
      return (
        <div className="studentsStatsChart-tooltip">
          <p className="studentsStatsChart-tooltipLabel">{label} {t('adminDigiBridgeStudents.charts.credits')}</p>
          <p className="studentsStatsChart-tooltipValue">
            {payload[0].value} {t('adminDigiBridgeStudents.charts.students')} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="studentsStatsChart">
      <div className="studentsStatsChart-header">
        <h3 className="studentsStatsChart-title">
          <span className="studentsStatsChart-icon">⭐</span>
          {t('adminDigiBridgeStudents.charts.creditsDistribution')}
        </h3>
      </div>

      {/* Stats Summary */}
      <div className="studentsStatsChart-summary">
        <div className="studentsStatsChart-summaryCard">
          <span className="studentsStatsChart-summaryValue">{totalStudents}</span>
          <span className="studentsStatsChart-summaryLabel">
            {t('adminDigiBridgeStudents.charts.totalStudents')}
          </span>
        </div>
        <div className="studentsStatsChart-summaryCard">
          <span className="studentsStatsChart-summaryValue">{avgCredits.toFixed(1)}</span>
          <span className="studentsStatsChart-summaryLabel">
            {t('adminDigiBridgeStudents.charts.avgCredits')}
          </span>
        </div>
        <div className="studentsStatsChart-summaryCard">
          <span className="studentsStatsChart-summaryValue">{maxCredits}</span>
          <span className="studentsStatsChart-summaryLabel">
            {t('adminDigiBridgeStudents.charts.maxCredits')}
          </span>
        </div>
      </div>

      <div className="studentsStatsChart-body">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              fill="#f59e0b" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};