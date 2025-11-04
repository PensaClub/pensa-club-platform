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
        name: mentor.name.split(' ')[0],
        fullName: mentor.name,
        responseTime: mentor.responseTime,
        responseUnit: mentor.responseUnit || 'sec', // ✅ ДОБАВИ UNIT
        totalMessages: mentor.totalMessages
      }));
  }, [responseTimesData, limit]);

  // ✅ Динамични цветове базирани на response time И unit
  const getColor = (responseTime, responseUnit) => {
    if (responseUnit === 'sec') {
      if (responseTime <= 10) return '#10b981'; // green - отличен (0-10 sec)
      if (responseTime <= 30) return '#84cc16'; // lime - много добър (11-30 sec)
      if (responseTime <= 60) return '#f59e0b'; // amber - добър (31-60 sec)
      return '#ef4444'; // red - бавен (>60 sec)
    } else {
      // минути
      if (responseTime <= 1) return '#10b981'; // green - отличен (0-1 min)
      if (responseTime <= 3) return '#84cc16'; // lime - много добър (1-3 min)
      if (responseTime <= 5) return '#f59e0b'; // amber - добър (3-5 min)
      return '#ef4444'; // red - бавен (>5 min)
    }
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
              <strong>
                {data.responseTime} {data.responseUnit === 'sec' ? t('ResponseTimeChart.seconds') : t('ResponseTimeChart.minutes')}
              </strong>
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
                  <Cell key={`cell-${index}`} fill={getColor(entry.responseTime, entry.responseUnit)} />
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

      {/* ✅ LEGEND - ДИНАМИЧНА */}
      <div className="response-time-chart-legend">
        <div className="response-time-chart-legend-item">
          <span className="response-time-chart-legend-dot" style={{ backgroundColor: '#10b981' }}></span>
          <span className="response-time-chart-legend-label">
            {t('ResponseTimeChart.excellent')} (&le;10 сек / &le;1 мин)
          </span>
        </div>
        <div className="response-time-chart-legend-item">
          <span className="response-time-chart-legend-dot" style={{ backgroundColor: '#84cc16' }}></span>
          <span className="response-time-chart-legend-label">
            {t('ResponseTimeChart.veryGood')} (11-30 сек / 1-3 мин)
          </span>
        </div>
        <div className="response-time-chart-legend-item">
          <span className="response-time-chart-legend-dot" style={{ backgroundColor: '#f59e0b' }}></span>
          <span className="response-time-chart-legend-label">
            {t('ResponseTimeChart.good')} (31-60 сек / 3-5 мин)
          </span>
        </div>
        <div className="response-time-chart-legend-item">
          <span className="response-time-chart-legend-dot" style={{ backgroundColor: '#ef4444' }}></span>
          <span className="response-time-chart-legend-label">
            {t('ResponseTimeChart.needsImprovement')} (&gt;60 сек / &gt;5 мин)
          </span>
        </div>
      </div>
    </div>
  );
};