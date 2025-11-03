// src/components/AdminDigiBridgeMentorStatistics/ResponseTimeChart/ResponseTimeChart.jsx

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './responseTimeChart.css';

export const ResponseTimeChart = ({ responseTimesData, limit = 10 }) => {
  const { t } = useTranslation();

  // ✅ Извлича всички ментори от ranges и сортира по response time
  const topMentors = useMemo(() => {
    if (!responseTimesData || !responseTimesData.mentorsByRange) return [];

    const allMentors = [
      ...responseTimesData.mentorsByRange.excellent,
      ...responseTimesData.mentorsByRange.good,
      ...responseTimesData.mentorsByRange.average,
      ...responseTimesData.mentorsByRange.slow
    ];

    return allMentors
      .sort((a, b) => a.responseTime - b.responseTime)
      .slice(0, limit)
      .map(mentor => ({
        name: mentor.name.split(' ')[0], // Само първо име
        fullName: mentor.name,
        responseTime: mentor.responseTime,
        totalMessages: mentor.totalMessages
      }));
  }, [responseTimesData, limit]);

  // Динамични цветове базирани на response time (по-зелено за по-бързо)
  const getColor = (responseTime) => {
    if (responseTime <= 10) return '#10b981'; // green - отличен
    if (responseTime <= 15) return '#84cc16'; // lime - много добър
    if (responseTime <= 20) return '#f59e0b'; // amber - добър
    return '#ef4444'; // red - бавен
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="response-time-chart-tooltip">
          <p className="response-time-chart-tooltip-name">{data.fullName}</p>
          <div className="response-time-chart-tooltip-values">
            <p className="response-time-chart-tooltip-value">
              <span>{t('ResponseTimeChart.responseTime')}:</span>
              <strong>{data.responseTime} {t('ResponseTimeChart.minutes')}</strong>
            </p>
            <p className="response-time-chart-tooltip-value">
              <span>{t('ResponseTimeChart.totalMessages')}:</span>
              <strong>{data.totalMessages}</strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="response-time-chart">
      <div className="response-time-chart-header">
        <h2 className="response-time-chart-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {t('ResponseTimeChart.title')}
        </h2>
        <p className="response-time-chart-subtitle">
          {t('ResponseTimeChart.subtitle')}
        </p>
      </div>

      <div className="response-time-chart-wrapper">
        {topMentors.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={topMentors}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                type="number"
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                label={{
                  value: t('ResponseTimeChart.xAxisLabel'),
                  position: 'insideBottom',
                  offset: -10,
                  style: { fill: '#6b7280', fontWeight: 600, fontSize: 13 }
                }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
              <Bar
                dataKey="responseTime"
                radius={[0, 8, 8, 0]}
                maxBarSize={40}
              >
                {topMentors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.responseTime)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="response-time-chart-empty">
            <div className="response-time-chart-empty-icon">⏱️</div>
            <p>{t('ResponseTimeChart.noData')}</p>
          </div>
        )}
      </div>

      {/* LEGEND */}
      <div className="response-time-chart-legend">
        <div className="response-time-chart-legend-item">
          <span className="response-time-chart-legend-dot" style={{ backgroundColor: '#10b981' }}></span>
          <span className="response-time-chart-legend-label">
            {t('ResponseTimeChart.excellent')} (&le;10 {t('ResponseTimeChart.min')})
          </span>
        </div>
        <div className="response-time-chart-legend-item">
          <span className="response-time-chart-legend-dot" style={{ backgroundColor: '#84cc16' }}></span>
          <span className="response-time-chart-legend-label">
            {t('ResponseTimeChart.veryGood')} (11-15 {t('ResponseTimeChart.min')})
          </span>
        </div>
        <div className="response-time-chart-legend-item">
          <span className="response-time-chart-legend-dot" style={{ backgroundColor: '#f59e0b' }}></span>
          <span className="response-time-chart-legend-label">
            {t('ResponseTimeChart.good')} (16-20 {t('ResponseTimeChart.min')})
          </span>
        </div>
        <div className="response-time-chart-legend-item">
          <span className="response-time-chart-legend-dot" style={{ backgroundColor: '#ef4444' }}></span>
          <span className="response-time-chart-legend-label">
            {t('ResponseTimeChart.needsImprovement')} (&gt;20 {t('ResponseTimeChart.min')})
          </span>
        </div>
      </div>
    </div>
  );
};