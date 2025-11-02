// src/components/AdminDigiBridgeMentorStatistics/MentorsBySpecialization/MentorsBySpecialization.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './mentorsBySpecialization.css';

export const MentorsBySpecialization = ({ data }) => {
  const { t } = useTranslation();

  // ✅ ВЕЧЕ НЕ ПРАВИМ useMemo - ДАННИТЕ ИДВАТ ГОТОВИ
  const specializationData = data || [];

  // Цветове за различните специализации
  const COLORS = {
    'Digital Security': '#8b5cf6',
    'Social Media': '#0ea5e9',
    'Online Banking': '#10b981',
    'Media Literacy': '#f59e0b',
    'Communication Tools': '#ec4899',
    'E-Commerce': '#f97316',
    'Other': '#6b7280'
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="mentors-by-specialization-tooltip">
          <p className="mentors-by-specialization-tooltip-title">{data.specialization}</p>
          <div className="mentors-by-specialization-tooltip-content">
            <div className="mentors-by-specialization-tooltip-row">
              <span className="mentors-by-specialization-tooltip-label">
                {t('MentorsBySpecialization.mentors')}:
              </span>
              <strong>{data.count}</strong>
            </div>
            <div className="mentors-by-specialization-tooltip-row">
              <span className="mentors-by-specialization-tooltip-label">
                {t('MentorsBySpecialization.students')}:
              </span>
              <strong>{data.totalStudents}</strong>
            </div>
            <div className="mentors-by-specialization-tooltip-row">
              <span className="mentors-by-specialization-tooltip-label">
                {t('MentorsBySpecialization.avgRating')}:
              </span>
              <strong>⭐ {data.averageRating}</strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mentors-by-specialization">
      <div className="mentors-by-specialization-header">
        <h2 className="mentors-by-specialization-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {t('MentorsBySpecialization.title')}
        </h2>
        <p className="mentors-by-specialization-subtitle">
          {t('MentorsBySpecialization.subtitle')}
        </p>
      </div>

      <div className="mentors-by-specialization-wrapper">
        {specializationData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={specializationData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="specialization"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                label={{
                  value: t('MentorsBySpecialization.yAxisLabel'),
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: '#6b7280', fontWeight: 600, fontSize: 13 }
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
              <Bar
                dataKey="count"
                radius={[8, 8, 0, 0]}
                maxBarSize={80}
              >
                {specializationData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.specialization] || COLORS['Other']} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="mentors-by-specialization-empty">
            <div className="mentors-by-specialization-empty-icon">👥</div>
            <p>{t('MentorsBySpecialization.noData')}</p>
          </div>
        )}
      </div>

      {/* STATS CARDS */}
      {specializationData.length > 0 && (
        <div className="mentors-by-specialization-stats">
          {specializationData.slice(0, 3).map((spec, index) => (
            <div key={index} className="mentors-by-specialization-stat-card">
              <div 
                className="mentors-by-specialization-stat-icon"
                style={{ backgroundColor: COLORS[spec.specialization] || COLORS['Other'] }}
              >
                {index + 1}
              </div>
              <div className="mentors-by-specialization-stat-content">
                <p className="mentors-by-specialization-stat-label">{spec.specialization}</p>
                <div className="mentors-by-specialization-stat-values">
                  <span className="mentors-by-specialization-stat-value">
                    <strong>{spec.count}</strong> {t('MentorsBySpecialization.mentors')}
                  </span>
                  <span className="mentors-by-specialization-stat-divider">•</span>
                  <span className="mentors-by-specialization-stat-value">
                    ⭐ {spec.averageRating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};