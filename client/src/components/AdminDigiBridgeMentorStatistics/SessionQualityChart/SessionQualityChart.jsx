// src/components/AdminDigiBridgeMentorStatistics/SessionQualityChart/SessionQualityChart.jsx

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './sessionQualityChart.css';

export const SessionQualityChart = ({ mentors }) => {
  const { t } = useTranslation();

  // Изчислява качествените метрики
  const qualityData = useMemo(() => {
    const totalSessions = mentors.reduce((sum, m) => sum + m.sessionsCount, 0);
    const totalCanceled = mentors.reduce((sum, m) => sum + m.quality.canceledSessions, 0);
    
    // Изчисляваме завършени сесии
    const averageCompletionRate = mentors.reduce((sum, m) => sum + m.quality.completionRate, 0) / mentors.length;
    const completedSessions = Math.round((totalSessions * averageCompletionRate) / 100);
    
    // Изчисляваме не се явили (остатъка от 100%)
    const noShowRate = 100 - averageCompletionRate - (totalCanceled / totalSessions * 100);
    const noShowSessions = Math.round((totalSessions * noShowRate) / 100);

    return [
      {
        name: t('SessionQualityChart.completed'),
        value: completedSessions,
        percentage: averageCompletionRate.toFixed(1),
        color: '#10b981'
      },
      {
        name: t('SessionQualityChart.canceled'),
        value: totalCanceled,
        percentage: ((totalCanceled / totalSessions) * 100).toFixed(1),
        color: '#f59e0b'
      },
      {
        name: t('SessionQualityChart.noShow'),
        value: noShowSessions,
        percentage: noShowRate.toFixed(1),
        color: '#ef4444'
      }
    ];
  }, [mentors, t]);

  // Custom Label
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '14px', fontWeight: 'bold' }}
      >
        {`${percentage}%`}
      </text>
    );
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="session-quality-chart-tooltip">
          <div 
            className="session-quality-chart-tooltip-header"
            style={{ backgroundColor: data.color }}
          >
            <p className="session-quality-chart-tooltip-name">{data.name}</p>
          </div>
          <div className="session-quality-chart-tooltip-body">
            <p className="session-quality-chart-tooltip-value">
              <span>{t('SessionQualityChart.sessions')}:</span>
              <strong>{data.value}</strong>
            </p>
            <p className="session-quality-chart-tooltip-value">
              <span>{t('SessionQualityChart.percentage')}:</span>
              <strong>{data.percentage}%</strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="session-quality-chart">
      <div className="session-quality-chart-header">
        <h2 className="session-quality-chart-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {t('SessionQualityChart.title')}
        </h2>
        <p className="session-quality-chart-subtitle">
          {t('SessionQualityChart.subtitle')}
        </p>
      </div>

      <div className="session-quality-chart-wrapper">
        {qualityData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={qualityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={120}
                innerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {qualityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="session-quality-chart-empty">
            <div className="session-quality-chart-empty-icon">📊</div>
            <p>{t('SessionQualityChart.noData')}</p>
          </div>
        )}
      </div>

      {/* STATISTICS CARDS */}
      <div className="session-quality-chart-stats">
        {qualityData.map((item, index) => (
          <div key={index} className="session-quality-chart-stat-card">
            <div 
              className="session-quality-chart-stat-icon"
              style={{ backgroundColor: item.color }}
            >
              {index === 0 && '✅'}
              {index === 1 && '⚠️'}
              {index === 2 && '❌'}
            </div>
            <div className="session-quality-chart-stat-content">
              <p className="session-quality-chart-stat-label">{item.name}</p>
              <p className="session-quality-chart-stat-value">
                {item.value} <span>({item.percentage}%)</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};