// client/src/components/DigiMentorPanel/DigiMentorPerformanceChart/DigiMentorPerformanceChart.jsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './digiMentorPerformanceChart.css';

export const DigiMentorPerformanceChart = ({ performanceData = {} }) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('sessions'); // sessions, hours, students
  const [viewPeriod, setViewPeriod] = useState('month'); // week, month, year

  const { sessionsData = [], hoursData = [], studentsData = [] } = performanceData;

  const getChartData = () => {
    switch (chartType) {
      case 'sessions':
        return sessionsData;
      case 'hours':
        return hoursData;
      case 'students':
        return studentsData;
      default:
        return [];
    }
  };

  const getChartColor = () => {
    switch (chartType) {
      case 'sessions':
        return '#667eea';
      case 'hours':
        return '#059669';
      case 'students':
        return '#d97706';
      default:
        return '#667eea';
    }
  };

  const getChartTitle = () => {
    return t(`digiMentorPerformanceChart.chartTypes.${chartType}`);
  };

  if (!sessionsData.length && !hoursData.length && !studentsData.length) {
    return (
      <div className="digi-mentor-performance-chart">
        <h2 className="digi-mentor-performance-chart-title">
          {t('digiMentorPerformanceChart.title')}
        </h2>
        <div className="digi-mentor-performance-chart-empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 19V6L21 3V16M9 19C9 20.1046 7.65685 21 6 21C4.34315 21 3 20.1046 3 19C3 17.8954 4.34315 17 6 17C7.65685 17 9 17.8954 9 19ZM21 16C21 17.1046 19.6569 18 18 18C16.3431 18 15 17.1046 15 16C15 14.8954 16.3431 14 18 14C19.6569 14 21 14.8954 21 16ZM9 10V6L21 3V7L9 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>{t('digiMentorPerformanceChart.noData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="digi-mentor-performance-chart">
      <div className="digi-mentor-performance-chart-header">
        <h2 className="digi-mentor-performance-chart-title">
          {t('digiMentorPerformanceChart.title')}
        </h2>
        <div className="digi-mentor-performance-chart-controls">
          <div className="digi-mentor-performance-chart-period-buttons">
            <button
              className={`digi-mentor-performance-chart-period-btn ${viewPeriod === 'week' ? 'digi-mentor-performance-chart-period-btn-active' : ''}`}
              onClick={() => setViewPeriod('week')}
            >
              {t('digiMentorPerformanceChart.periods.week')}
            </button>
            <button
              className={`digi-mentor-performance-chart-period-btn ${viewPeriod === 'month' ? 'digi-mentor-performance-chart-period-btn-active' : ''}`}
              onClick={() => setViewPeriod('month')}
            >
              {t('digiMentorPerformanceChart.periods.month')}
            </button>
            <button
              className={`digi-mentor-performance-chart-period-btn ${viewPeriod === 'year' ? 'digi-mentor-performance-chart-period-btn-active' : ''}`}
              onClick={() => setViewPeriod('year')}
            >
              {t('digiMentorPerformanceChart.periods.year')}
            </button>
          </div>
        </div>
      </div>

      {/* CHART TYPE SELECTOR */}
      <div className="digi-mentor-performance-chart-type-selector">
        <button
          className={`digi-mentor-performance-chart-type-btn ${chartType === 'sessions' ? 'digi-mentor-performance-chart-type-btn-active' : ''}`}
          onClick={() => setChartType('sessions')}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{t('digiMentorPerformanceChart.chartTypes.sessions')}</span>
        </button>
        <button
          className={`digi-mentor-performance-chart-type-btn ${chartType === 'hours' ? 'digi-mentor-performance-chart-type-btn-active' : ''}`}
          onClick={() => setChartType('hours')}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{t('digiMentorPerformanceChart.chartTypes.hours')}</span>
        </button>
        <button
          className={`digi-mentor-performance-chart-type-btn ${chartType === 'students' ? 'digi-mentor-performance-chart-type-btn-active' : ''}`}
          onClick={() => setChartType('students')}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{t('digiMentorPerformanceChart.chartTypes.students')}</span>
        </button>
      </div>

      {/* CHART CONTAINER */}
      <div className="digi-mentor-performance-chart-container">
        <div className="digi-mentor-performance-chart-wrapper">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={getChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                style={{ fontSize: '0.875rem' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '0.875rem' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
                labelStyle={{ color: '#111827', fontWeight: '600' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                name={getChartTitle()}
                stroke={getChartColor()} 
                strokeWidth={3}
                dot={{ fill: getChartColor(), r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART */}
        <div className="digi-mentor-performance-chart-wrapper">
          <h3 className="digi-mentor-performance-chart-subtitle">
            {t('digiMentorPerformanceChart.comparisonTitle')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                style={{ fontSize: '0.875rem' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '0.875rem' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
                labelStyle={{ color: '#111827', fontWeight: '600' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar 
                dataKey="value" 
                name={getChartTitle()}
                fill={getChartColor()}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* STATS SUMMARY */}
      <div className="digi-mentor-performance-chart-summary">
        <div className="digi-mentor-performance-chart-summary-card">
          <div className="digi-mentor-performance-chart-summary-icon digi-mentor-performance-chart-summary-icon-blue">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 7H21M13 12H21M13 17H21M3 7L5 9L9 5M3 12L5 14L9 10M3 17L5 19L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="digi-mentor-performance-chart-summary-content">
            <p className="digi-mentor-performance-chart-summary-label">
              {t('digiMentorPerformanceChart.summary.total')}
            </p>
            <p className="digi-mentor-performance-chart-summary-value">
              {getChartData().reduce((sum, item) => sum + item.value, 0)}
            </p>
          </div>
        </div>

        <div className="digi-mentor-performance-chart-summary-card">
          <div className="digi-mentor-performance-chart-summary-icon digi-mentor-performance-chart-summary-icon-green">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 7L18 12L13 17M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="digi-mentor-performance-chart-summary-content">
            <p className="digi-mentor-performance-chart-summary-label">
              {t('digiMentorPerformanceChart.summary.average')}
            </p>
            <p className="digi-mentor-performance-chart-summary-value">
              {(getChartData().reduce((sum, item) => sum + item.value, 0) / getChartData().length).toFixed(1)}
            </p>
          </div>
        </div>

        <div className="digi-mentor-performance-chart-summary-card">
          <div className="digi-mentor-performance-chart-summary-icon digi-mentor-performance-chart-summary-icon-purple">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V20M12 4L18 10M12 4L6 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="digi-mentor-performance-chart-summary-content">
            <p className="digi-mentor-performance-chart-summary-label">
              {t('digiMentorPerformanceChart.summary.peak')}
            </p>
            <p className="digi-mentor-performance-chart-summary-value">
              {Math.max(...getChartData().map(item => item.value))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};