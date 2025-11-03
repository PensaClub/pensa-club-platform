// src/components/AdminDigiBridgeMentorStatistics/TopMentorsByOnlineTime/TopMentorsByOnlineTime.jsx

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './topMentorsByOnlineTime.css';

export const TopMentorsByOnlineTime = ({ mentors, limit = 10 }) => {
  const { t } = useTranslation();

  // ✅ Функция за форматиране на часове
  const formatHours = (hours) => {
    if (hours === 0) return '0 мин';
    
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} мин`;
    }
    
    const fullHours = Math.floor(hours);
    const minutes = Math.round((hours - fullHours) * 60);
    
    if (minutes === 0) {
      return `${fullHours} ч`;
    }
    
    return `${fullHours}ч ${minutes}м`;
  };

  // Сортира и взема top N ментори по часове онлайн този месец
  const topMentors = useMemo(() => {
    return [...mentors]
      .sort((a, b) => b.onlineTime.thisMonth - a.onlineTime.thisMonth)
      .slice(0, limit)
      .map(mentor => ({
        name: mentor.name.split(' ')[0], // Само първо име
        fullName: mentor.name,
        hours: mentor.onlineTime.thisMonth,
        hoursFormatted: formatHours(mentor.onlineTime.thisMonth), // ✅ ДОБАВЕНО
        specialization: mentor.specialization,
        totalHours: mentor.onlineTime.total,
        totalHoursFormatted: formatHours(mentor.onlineTime.total) // ✅ ДОБАВЕНО
      }));
  }, [mentors, limit]);

  // Градиент цветове за барове
  const COLORS = [
    '#ec4899', // pink
    '#8b5cf6', // purple
    '#6366f1', // indigo
    '#0ea5e9', // blue
    '#14b8a6', // teal
    '#10b981', // green
    '#84cc16', // lime
    '#f59e0b', // amber
    '#f97316', // orange
    '#ef4444'  // red
  ];

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="top-mentors-by-online-time-tooltip">
          <p className="top-mentors-by-online-time-tooltip-name">{data.fullName}</p>
          <p className="top-mentors-by-online-time-tooltip-spec">{data.specialization}</p>
          <div className="top-mentors-by-online-time-tooltip-values">
            <p className="top-mentors-by-online-time-tooltip-value">
              <span className="top-mentors-by-online-time-tooltip-label">
                {t('TopMentorsByOnlineTime.thisMonth')}:
              </span>
              <strong>{data.hoursFormatted}</strong>
            </p>
            <p className="top-mentors-by-online-time-tooltip-value">
              <span className="top-mentors-by-online-time-tooltip-label">
                {t('TopMentorsByOnlineTime.total')}:
              </span>
              <strong>{data.totalHoursFormatted}</strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="top-mentors-by-online-time">
      <div className="top-mentors-by-online-time-header">
        <h2 className="top-mentors-by-online-time-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {t('TopMentorsByOnlineTime.title')}
        </h2>
        <p className="top-mentors-by-online-time-subtitle">
          {t('TopMentorsByOnlineTime.subtitle')}
        </p>
      </div>

      <div className="top-mentors-by-online-time-chart-wrapper">
        {topMentors.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={topMentors}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                label={{
                  value: t('TopMentorsByOnlineTime.yAxisLabel'),
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: '#6b7280', fontWeight: 600, fontSize: 13 }
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(236, 72, 153, 0.1)' }} />
              <Bar
                dataKey="hours"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              >
                {topMentors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="top-mentors-by-online-time-empty">
            <div className="top-mentors-by-online-time-empty-icon">⏰</div>
            <p>{t('TopMentorsByOnlineTime.noData')}</p>
          </div>
        )}
      </div>
    </div>
  );
};