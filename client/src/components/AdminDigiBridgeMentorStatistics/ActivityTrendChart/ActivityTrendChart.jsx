// src/components/AdminDigiBridgeMentorStatistics/ActivityTrendChart/ActivityTrendChart.jsx

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './activityTrendChart.css';

export const ActivityTrendChart = ({ mentors }) => {
  const { t } = useTranslation();

  // Генерира данни за последните 6 месеца
  const trendData = useMemo(() => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('bg-BG', { month: 'short', year: '2-digit' });
      
      // Симулираме данни базирани на текущите ментори
      // TODO: В реалния случай това ще идва от backend
      const sessionsCount = mentors.reduce((sum, m) => {
        // Разпределяме сесиите пропорционално през месеците
        return sum + Math.floor(m.activity.sessionsThisMonth * (0.7 + Math.random() * 0.6));
      }, 0);
      
      const onlineHours = mentors.reduce((sum, m) => {
        return sum + Math.floor(m.onlineTime.thisMonth * (0.7 + Math.random() * 0.6));
      }, 0);
      
      months.push({
        month: monthName,
        sessions: sessionsCount,
        hours: onlineHours
      });
    }
    
    return months;
  }, [mentors]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="activity-trend-chart-tooltip">
          <p className="activity-trend-chart-tooltip-label">{label}</p>
          <div className="activity-trend-chart-tooltip-values">
            {payload.map((entry, index) => (
              <p key={index} className="activity-trend-chart-tooltip-value">
                <span 
                  className="activity-trend-chart-tooltip-dot"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="activity-trend-chart-tooltip-name">
                  {entry.name}:
                </span>
                <strong>{entry.value}</strong>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="activity-trend-chart">
      <div className="activity-trend-chart-header">
        <h2 className="activity-trend-chart-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          {t('ActivityTrendChart.title')}
        </h2>
        <p className="activity-trend-chart-subtitle">
          {t('ActivityTrendChart.subtitle')}
        </p>
      </div>

      <div className="activity-trend-chart-wrapper">
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={trendData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                label={{
                  value: t('ActivityTrendChart.sessionsLabel'),
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: '#6b7280', fontWeight: 600, fontSize: 13 }
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                label={{
                  value: t('ActivityTrendChart.hoursLabel'),
                  angle: 90,
                  position: 'insideRight',
                  style: { fill: '#6b7280', fontWeight: 600, fontSize: 13 }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sessions"
                name={t('ActivityTrendChart.sessions')}
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="hours"
                name={t('ActivityTrendChart.hours')}
                stroke="#ec4899"
                strokeWidth={3}
                dot={{ fill: '#ec4899', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="activity-trend-chart-empty">
            <div className="activity-trend-chart-empty-icon">📈</div>
            <p>{t('ActivityTrendChart.noData')}</p>
          </div>
        )}
      </div>
    </div>
  );
};