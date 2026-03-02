// src/components/AdminDigiBridgeMentorStatistics/TopMentorsByCourses/TopMentorsByCourses.jsx

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './topMentorsByCourses.css';

export const TopMentorsByCourses = ({ mentors, limit = 10 }) => {
  const { t } = useTranslation('digibridge');

  const topMentors = useMemo(() => {
    return [...mentors]
      .sort((a, b) => (b.courses?.length || 0) - (a.courses?.length || 0))
      .slice(0, limit)
      .filter(mentor => (mentor.courses?.length || 0) > 0) 
      .map(mentor => ({
        name: mentor.name.split(' ')[0], 
        fullName: mentor.name,
        courses: mentor.courses?.length || 0,
        specialization: mentor.specialization
      }));
  }, [mentors, limit]);

  // Градиент цветове за барове
  const COLORS = [
    '#8b5cf6', // purple
    '#0ea5e9', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ec4899', // pink
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#f97316', // orange
    '#84cc16', // lime
    '#a855f7'  // purple-light
  ];

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="top-mentors-by-courses-tooltip">
          <p className="top-mentors-by-courses-tooltip-name">{data.fullName}</p>
          <p className="top-mentors-by-courses-tooltip-spec">{data.specialization}</p>
          <p className="top-mentors-by-courses-tooltip-value">
            <strong>{data.courses}</strong> {t('TopMentorsByCourses.courses')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="top-mentors-by-courses">
      <div className="top-mentors-by-courses-header">
        <h2 className="top-mentors-by-courses-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          {t('TopMentorsByCourses.title')}
        </h2>
        <p className="top-mentors-by-courses-subtitle">
          {t('TopMentorsByCourses.subtitle')}
        </p>
      </div>

      <div className="top-mentors-by-courses-chart-wrapper">
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
                  value: t('TopMentorsByCourses.yAxisLabel'),
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: '#6b7280', fontWeight: 600, fontSize: 13 }
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
              <Bar
                dataKey="courses"
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
          <div className="top-mentors-by-courses-empty">
            <div className="top-mentors-by-courses-empty-icon">📚</div>
            <p>{t('TopMentorsByCourses.noData')}</p>
          </div>
        )}
      </div>
    </div>
  );
};