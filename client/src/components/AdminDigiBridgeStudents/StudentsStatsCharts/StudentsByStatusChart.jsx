// src/components/AdminDigiBridgeStudents/StudentsStatsCharts/StudentsByStatusChart.jsx

import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './studentsStatsCharts.css';

const COLORS = {
  active: '#10b981',
  inactive: '#ef4444',
  suspended: '#f59e0b',
  pending: '#6366f1'
};

export const StudentsByStatusChart = ({ data, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="studentsStatsChart">
        <div className="studentsStatsChart-loading">
          <div className="studentsStatsChart-spinner"></div>
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="studentsStatsChart">
        <div className="studentsStatsChart-empty">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
            <path d="M32 18v14M32 38v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>{t('adminDigiBridgeStudents.charts.noData')}</span>
        </div>
      </div>
    );
  }

  const chartData = Array.isArray(data) ? data.map(item => ({
    name: t(`adminDigiBridgeStudents.status.${item.status || item.name}`),
    value: item.count || item.value || 0,
    status: item.status || item.name
  })) : Object.entries(data).map(([key, value]) => ({
    name: t(`adminDigiBridgeStudents.status.${key}`),
    value: value,
    status: key
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="studentsStatsChart-tooltip">
          <p className="studentsStatsChart-tooltipLabel">{data.name}</p>
          <p className="studentsStatsChart-tooltipValue">
            {data.value} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="studentsStatsChart">
      <div className="studentsStatsChart-header">
        <h3 className="studentsStatsChart-title">
          <span className="studentsStatsChart-icon">✅</span>
          {t('adminDigiBridgeStudents.charts.byStatus')}
        </h3>
        <span className="studentsStatsChart-total">
          {t('adminDigiBridgeStudents.charts.total')}: <strong>{total}</strong>
        </span>
      </div>

      <div className="studentsStatsChart-body">
        <div className="studentsStatsChart-pieWrapper">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.status] || '#8884d8'} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: '#374151' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="studentsStatsChart-legend">
          {chartData.map((item, index) => (
            <div key={index} className="studentsStatsChart-legendItem">
              <span 
                className="studentsStatsChart-legendColor"
                style={{ backgroundColor: COLORS[item.status] || '#8884d8' }}
              ></span>
              <span className="studentsStatsChart-legendLabel">{item.name}</span>
              <span className="studentsStatsChart-legendValue">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};