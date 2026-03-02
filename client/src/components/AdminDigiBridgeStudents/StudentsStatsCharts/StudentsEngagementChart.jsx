// src/components/AdminDigiBridgeStudents/StudentsStatsCharts/StudentsEngagementChart.jsx

import { useTranslation } from 'react-i18next';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import './studentsEngagementChart.css';

export const StudentsEngagementChart = ({ data, loading }) => {
  const { t } = useTranslation('digibridge-students');

  if (loading) {
    return (
      <div className="studentsEngagementChart">
        <div className="studentsEngagementChart-loading">
          <div className="studentsEngagementChart-spinner"></div>
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="studentsEngagementChart">
        <div className="studentsEngagementChart-empty">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <polygon points="32,8 56,24 48,52 16,52 8,24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
          </svg>
          <span>{t('adminDigiBridgeStudents.charts.noData')}</span>
        </div>
      </div>
    );
  }

  // Transform data for radar chart
  const chartData = [
    { 
      metric: t('adminDigiBridgeStudents.charts.engagement.sessions'), 
      value: data.sessionParticipation || data.sessions || data.weeklyEngagementRate || 0,
      fullMark: 100 
    },
    { 
      metric: t('adminDigiBridgeStudents.charts.engagement.courses'), 
      value: data.courseCompletion || data.courses || 0,
      fullMark: 100 
    },
    { 
      metric: t('adminDigiBridgeStudents.charts.engagement.mentoring'), 
      value: data.mentoringEngagement || data.mentoring || data.monthlyEngagementRate || 0,
      fullMark: 100 
    },
    { 
      metric: t('adminDigiBridgeStudents.charts.engagement.activities'), 
      value: data.activityCompletion || data.activities || 0,
      fullMark: 100 
    },
    { 
      metric: t('adminDigiBridgeStudents.charts.engagement.feedback'), 
      value: data.feedbackScore || data.feedback || 0,
      fullMark: 100 
    }
  ];

  const overallScore = data.overallScore || 
    Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="studentsEngagementChart-tooltip">
          <p className="studentsEngagementChart-tooltipLabel">{payload[0].payload.metric}</p>
          <p className="studentsEngagementChart-tooltipValue">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="studentsEngagementChart">
      <div className="studentsEngagementChart-header">
        <h3 className="studentsEngagementChart-title">
          <span className="studentsEngagementChart-icon">📈</span>
          {t('adminDigiBridgeStudents.charts.engagementOverview')}
        </h3>
      </div>

      {/* Overall Score */}
      <div className="studentsEngagementChart-scoreWrapper">
        <div 
          className="studentsEngagementChart-scoreCircle"
          style={{ borderColor: getScoreColor(overallScore) }}
        >
          <span 
            className="studentsEngagementChart-scoreValue"
            style={{ color: getScoreColor(overallScore) }}
          >
            {overallScore}%
          </span>
          <span className="studentsEngagementChart-scoreLabel">
            {t('adminDigiBridgeStudents.charts.overallEngagement')}
          </span>
        </div>
      </div>

      <div className="studentsEngagementChart-body">
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={chartData}>
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Engagement"
              dataKey="value"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.4}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics Grid */}
      <div className="studentsEngagementChart-metricsGrid">
        {chartData.map((item, index) => (
          <div key={index} className="studentsEngagementChart-metricCard">
            <div className="studentsEngagementChart-metricHeader">
              <span className="studentsEngagementChart-metricLabel">{item.metric}</span>
              <span className="studentsEngagementChart-metricValue">{item.value}%</span>
            </div>
            <div className="studentsEngagementChart-metricBar">
              <div 
                className="studentsEngagementChart-metricFill"
                style={{ 
                  width: `${item.value}%`,
                  backgroundColor: getScoreColor(item.value)
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};