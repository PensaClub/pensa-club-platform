// src/components/AdminDigiBridgeMentorStatistics/SessionQualityChart/SessionQualityChart.jsx

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './sessionQualityChart.css';

export const SessionQualityChart = ({ qualityData }) => {
  const { t } = useTranslation('digibridge');

  // ✅ Изчислява pie chart data от aggregated stats
  const chartData = useMemo(() => {
    if (!qualityData) return [];

    const { totalSessions, completedSessions, activeSessions } = qualityData;

    // Изчислява incomplete sessions (не са нито completed, нито active)
    const incompleteSessions = totalSessions - completedSessions - activeSessions;

    return [
      {
        name: t('SessionQualityChart.completed'),
        value: completedSessions,
        percentage: totalSessions > 0 ? ((completedSessions / totalSessions) * 100).toFixed(1) : 0,
        color: '#10b981'
      },
      {
        name: t('SessionQualityChart.active'),
        value: activeSessions,
        percentage: totalSessions > 0 ? ((activeSessions / totalSessions) * 100).toFixed(1) : 0,
        color: '#3b82f6'
      },
      {
        name: t('SessionQualityChart.incomplete'),
        value: incompleteSessions > 0 ? incompleteSessions : 0,
        percentage: totalSessions > 0 ? ((incompleteSessions / totalSessions) * 100).toFixed(1) : 0,
        color: '#f59e0b'
      }
    ].filter(item => item.value > 0); // ✅ Филтрира празни секции
  }, [qualityData, t]);

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
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={120}
                innerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
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
      {qualityData && (
        <div className="session-quality-chart-stats">
          {chartData.map((item, index) => (
            <div key={index} className="session-quality-chart-stat-card">
              <div 
                className="session-quality-chart-stat-icon"
                style={{ backgroundColor: item.color }}
              >
                {item.name === t('SessionQualityChart.completed') && '✅'}
                {item.name === t('SessionQualityChart.active') && '🔄'}
                {item.name === t('SessionQualityChart.incomplete') && '⚠️'}
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
      )}
    </div>
  );
};