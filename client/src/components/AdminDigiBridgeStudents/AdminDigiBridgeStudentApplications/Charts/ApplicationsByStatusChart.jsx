// src/components/AdminDigiBridgeStudentApplications/Charts/ApplicationsByStatusChart.jsx

import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './applicationsByStatusChart.css';

const STATUS_COLORS = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444'
};

export const ApplicationsByStatusChart = ({ data, loading }) => {
  const { t } = useTranslation('digibridge-students');

  if (loading) {
    return (
      <div className="applicationsByStatusChart">
        <div className="applicationsByStatusChart-loading">
          <div className="applicationsByStatusChart-spinner"></div>
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0 || data.every(item => item.count === 0)) {
    return (
      <div className="applicationsByStatusChart">
        <div className="applicationsByStatusChart-empty">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <circle cx="32" cy="32" r="16" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          </svg>
          <span>{t('adminStudentApplications.charts.noData')}</span>
        </div>
      </div>
    );
  }

  // Форматирай данните за recharts
  const chartData = data
    .filter(item => item.count > 0)
    .map(item => ({
      name: t(`adminStudentApplications.status.${item.status}`),
      value: item.count,
      status: item.status
    }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="applicationsByStatusChart-tooltip">
          <div className="applicationsByStatusChart-tooltipHeader">
            <span 
              className="applicationsByStatusChart-tooltipDot"
              style={{ background: STATUS_COLORS[data.status] }}
            ></span>
            <span className="applicationsByStatusChart-tooltipLabel">{data.name}</span>
          </div>
          <div className="applicationsByStatusChart-tooltipValue">
            <strong>{data.value}</strong>
            <span>({percentage}%)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Legend
  const CustomLegend = ({ payload }) => {
    return (
      <div className="applicationsByStatusChart-legend">
        {payload.map((entry, index) => {
          const item = chartData.find(d => d.name === entry.value);
          const percentage = item ? ((item.value / total) * 100).toFixed(0) : 0;
          
          return (
            <div key={index} className="applicationsByStatusChart-legendItem">
              <span 
                className="applicationsByStatusChart-legendDot"
                style={{ background: entry.color }}
              ></span>
              <span className="applicationsByStatusChart-legendLabel">{entry.value}</span>
              <span className="applicationsByStatusChart-legendValue">
                {item?.value || 0}
                <small>({percentage}%)</small>
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="applicationsByStatusChart">
      {/* Total Badge */}
      <div className="applicationsByStatusChart-header">
        <span className="applicationsByStatusChart-total">
          {t('adminStudentApplications.stats.total')}: <strong>{total}</strong>
        </span>
      </div>

      {/* Chart */}
      <div className="applicationsByStatusChart-chartWrapper">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={STATUS_COLORS[entry.status]}
                  className="applicationsByStatusChart-cell"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="applicationsByStatusChart-centerLabel">
          <span className="applicationsByStatusChart-centerValue">{total}</span>
          <span className="applicationsByStatusChart-centerText">
            {t('adminStudentApplications.stats.total')}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="applicationsByStatusChart-legendWrapper">
        {chartData.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(0);
          
          return (
            <div key={index} className={`applicationsByStatusChart-legendItem applicationsByStatusChart-legendItem--${item.status}`}>
              <span 
                className="applicationsByStatusChart-legendDot"
                style={{ background: STATUS_COLORS[item.status] }}
              ></span>
              <span className="applicationsByStatusChart-legendLabel">{item.name}</span>
              <span className="applicationsByStatusChart-legendValue">
                {item.value}
                <small>({percentage}%)</small>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};