import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeartbeat,
  faWeight,
  faRunning,
  faTrophy,
  faCalendarAlt,
  faChartLine,
  faMedkit,
  faUser,
  faUsers,
  faPlus,
  faMinus,
  faEdit,
  faSave,
  faTimes,
  faCheck,
  faExclamationTriangle,
  faInfoCircle,
  faLightbulb,
  faFire,
  faWater,
  faBed,
  faAppleAlt,
  faDumbbell,
  faStopwatch,
  faEye,
  faEyeSlash,
  faDownload,
  faShare,
  faPrint,
  faChevronUp,
  faChevronDown,
  faArrowUp,
  faArrowDown,
  faBolt,
  faGem,
  faStar,
  faAward,
  faCrown,
  faRocket,
  faShieldAlt,
  faHeart,
  faLeaf,
  faSun,
  faMoon,
  faThermometerHalf,
  faLungs,
  faBrain,
  faHandHoldingMedical,
  faFlag,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons';
import './sportsHealthTracking.css';

export const SportsHealthTracking = ({ club }) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState('heartRate');
  const [timeframe, setTimeframe] = useState('week');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newEntry, setNewEntry] = useState({
    type: 'heartRate',
    value: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    notes: ''
  });

  const [healthData, setHealthData] = useState({
    metrics: {
      heartRate: [
        { date: '2025-08-10', value: 72, time: '08:00' },
        { date: '2025-08-09', value: 75, time: '08:30' },
        { date: '2025-08-08', value: 70, time: '08:15' },
        { date: '2025-08-07', value: 74, time: '08:00' },
        { date: '2025-08-06', value: 73, time: '08:45' },
        { date: '2025-08-05', value: 71, time: '08:20' },
        { date: '2025-08-04', value: 76, time: '08:10' }
      ],
      bloodPressure: [
        { date: '2025-08-10', systolic: 120, diastolic: 80, time: '08:00' },
        { date: '2025-08-09', systolic: 118, diastolic: 78, time: '08:30' },
        { date: '2025-08-08', systolic: 122, diastolic: 82, time: '08:15' },
        { date: '2025-08-07', systolic: 119, diastolic: 79, time: '08:00' },
        { date: '2025-08-06', systolic: 121, diastolic: 81, time: '08:45' },
        { date: '2025-08-05', systolic: 117, diastolic: 77, time: '08:20' },
        { date: '2025-08-04', systolic: 123, diastolic: 83, time: '08:10' }
      ],
      weight: [
        { date: '2025-08-10', value: 75.2, time: '07:00' },
        { date: '2025-08-09', value: 75.4, time: '07:15' },
        { date: '2025-08-08', value: 75.1, time: '07:30' },
        { date: '2025-08-07', value: 75.5, time: '07:00' },
        { date: '2025-08-06', value: 75.3, time: '07:20' },
        { date: '2025-08-05', value: 75.6, time: '07:10' },
        { date: '2025-08-04', value: 75.8, time: '07:05' }
      ],
      steps: [
        { date: '2025-08-10', value: 8500, time: '23:59' },
        { date: '2025-08-09', value: 9200, time: '23:59' },
        { date: '2025-08-08', value: 7800, time: '23:59' },
        { date: '2025-08-07', value: 10100, time: '23:59' },
        { date: '2025-08-06', value: 8900, time: '23:59' },
        { date: '2025-08-05', value: 9600, time: '23:59' },
        { date: '2025-08-04', value: 8200, time: '23:59' }
      ],
      sleep: [
        { date: '2025-08-10', value: 7.5, quality: 'good', time: '07:00' },
        { date: '2025-08-09', value: 8.0, quality: 'excellent', time: '07:30' },
        { date: '2025-08-08', value: 6.5, quality: 'fair', time: '07:15' },
        { date: '2025-08-07', value: 7.8, quality: 'good', time: '07:20' },
        { date: '2025-08-06', value: 7.2, quality: 'good', time: '07:10' },
        { date: '2025-08-05', value: 8.2, quality: 'excellent', time: '07:45' },
        { date: '2025-08-04', value: 6.8, quality: 'fair', time: '07:05' }
      ],
      water: [
        { date: '2025-08-10', value: 2.1, time: '20:00' },
        { date: '2025-08-09', value: 2.5, time: '21:30' },
        { date: '2025-08-08', value: 1.8, time: '19:45' },
        { date: '2025-08-07', value: 2.3, time: '20:15' },
        { date: '2025-08-06', value: 2.0, time: '20:30' },
        { date: '2025-08-05', value: 2.7, time: '21:00' },
        { date: '2025-08-04', value: 1.9, time: '19:30' }
      ]
    },
    goals: [
      {
        id: 1,
        type: 'steps',
        title: t('clubs.SportsHealthTracking.goalTypes.dailySteps'),
        target: 10000,
        current: 8500,
        unit: t('clubs.SportsHealthTracking.units.steps'),
        icon: faRunning,
        color: '#ef4444',
        deadline: '2025-08-31'
      },
      {
        id: 2,
        type: 'weight',
        title: t('clubs.SportsHealthTracking.goalTypes.targetWeight'),
        target: 74.0,
        current: 75.2,
        unit: t('clubs.SportsHealthTracking.units.kg'),
        icon: faWeight,
        color: '#8b5cf6',
        deadline: '2025-12-31'
      },
      {
        id: 3,
        type: 'water',
        title: t('clubs.SportsHealthTracking.goalTypes.dailyHydration'),
        target: 2.5,
        current: 2.1,
        unit: t('clubs.SportsHealthTracking.units.liters'),
        icon: faWater,
        color: '#06b6d4',
        deadline: '2025-08-31'
      },
      {
        id: 4,
        type: 'sleep',
        title: t('clubs.SportsHealthTracking.goalTypes.qualitySleep'),
        target: 8.0,
        current: 7.5,
        unit: t('clubs.SportsHealthTracking.units.hours'),
        icon: faBed,
        color: '#6366f1',
        deadline: '2025-08-31'
      }
    ]
  });

  if (!club?.pensionersSpecific?.healthServices && !club?.activities) {
    return null;
  }

  const healthServices = club.pensionersSpecific?.healthServices || {};
  const healthLectures = healthServices.healthLectures || [];
  const medicalServices = healthServices.medicalServices || [];

  const getTabs = () => [
    { key: 'overview', label: t('clubs.SportsHealthTracking.tabs.overview'), icon: faChartLine },
    { key: 'metrics', label: t('clubs.SportsHealthTracking.tabs.metrics'), icon: faHeartbeat },
    { key: 'goals', label: t('clubs.SportsHealthTracking.tabs.goals'), icon: faFlag },
    { key: 'insights', label: t('clubs.SportsHealthTracking.tabs.insights'), icon: faLightbulb },
    { key: 'services', label: t('clubs.SportsHealthTracking.tabs.services'), icon: faMedkit }
  ];

  const getHealthMetrics = () => [
    {
      key: 'heartRate',
      title: t('clubs.SportsHealthTracking.metrics.heartRate.title'),
      icon: faHeartbeat,
      color: '#ef4444',
      unit: t('clubs.SportsHealthTracking.units.bpm'),
      normalRange: [60, 100],
      gradient: 'linear-gradient(135deg, #ef4444, #f87171)'
    },
    {
      key: 'bloodPressure',
      title: t('clubs.SportsHealthTracking.metrics.bloodPressure.title'),
      icon: faThermometerHalf,
      color: '#8b5cf6',
      unit: t('clubs.SportsHealthTracking.units.mmHg'),
      normalRange: [120, 80],
      gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)'
    },
    {
      key: 'weight',
      title: t('clubs.SportsHealthTracking.metrics.weight.title'),
      icon: faWeight,
      color: '#06b6d4',
      unit: t('clubs.SportsHealthTracking.units.kg'),
      normalRange: [70, 80],
      gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)'
    },
    {
      key: 'steps',
      title: t('clubs.SportsHealthTracking.metrics.steps.title'),
      icon: faRunning,
      color: '#10b981',
      unit: t('clubs.SportsHealthTracking.units.steps'),
      normalRange: [8000, 12000],
      gradient: 'linear-gradient(135deg, #10b981, #34d399)'
    },
    {
      key: 'sleep',
      title: t('clubs.SportsHealthTracking.metrics.sleep.title'),
      icon: faBed,
      color: '#6366f1',
      unit: t('clubs.SportsHealthTracking.units.hours'),
      normalRange: [7, 9],
      gradient: 'linear-gradient(135deg, #6366f1, #818cf8)'
    },
    {
      key: 'water',
      title: t('clubs.SportsHealthTracking.metrics.water.title'),
      icon: faWater,
      color: '#0ea5e9',
      unit: t('clubs.SportsHealthTracking.units.liters'),
      normalRange: [2, 3],
      gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)'
    }
  ];

  const getHealthTips = () => [
    {
      id: 1,
      category: 'cardio',
      title: t('clubs.SportsHealthTracking.tips.cardio.title'),
      tip: t('clubs.SportsHealthTracking.tips.cardio.content'),
      icon: faHeartbeat,
      color: '#ef4444'
    },
    {
      id: 2,
      category: 'nutrition',
      title: t('clubs.SportsHealthTracking.tips.nutrition.title'),
      tip: t('clubs.SportsHealthTracking.tips.nutrition.content'),
      icon: faAppleAlt,
      color: '#10b981'
    },
    {
      id: 3,
      category: 'hydration',
      title: t('clubs.SportsHealthTracking.tips.hydration.title'),
      tip: t('clubs.SportsHealthTracking.tips.hydration.content'),
      icon: faWater,
      color: '#0ea5e9'
    },
    {
      id: 4,
      category: 'sleep',
      title: t('clubs.SportsHealthTracking.tips.sleep.title'),
      tip: t('clubs.SportsHealthTracking.tips.sleep.content'),
      icon: faBed,
      color: '#6366f1'
    },
    {
      id: 5,
      category: 'stress',
      title: t('clubs.SportsHealthTracking.tips.stress.title'),
      tip: t('clubs.SportsHealthTracking.tips.stress.content'),
      icon: faLeaf,
      color: '#059669'
    }
  ];

  const getTimeframePeriods = () => [
    { key: 'week', label: t('clubs.SportsHealthTracking.timeframes.week') },
    { key: 'month', label: t('clubs.SportsHealthTracking.timeframes.month') },
    { key: '3months', label: t('clubs.SportsHealthTracking.timeframes.threeMonths') },
    { key: 'year', label: t('clubs.SportsHealthTracking.timeframes.year') }
  ];

  const tabs = getTabs();
  const healthMetrics = getHealthMetrics();
  const healthTips = getHealthTips();
  const timeframePeriods = getTimeframePeriods();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'de' ? 'de-DE' : 'en-US';
    return date.toLocaleDateString(locale);
  };

  const getCurrentMetrics = () => {
    const metrics = {};
    
    healthMetrics.forEach(metric => {
      const data = healthData.metrics[metric.key] || [];
      if (data.length > 0) {
        const latest = data[0];
        const previous = data[1];
        
        if (metric.key === 'bloodPressure') {
          metrics[metric.key] = {
            current: `${latest.systolic}/${latest.diastolic}`,
            value: latest.systolic,
            trend: previous ? (latest.systolic > previous.systolic ? 'up' : latest.systolic < previous.systolic ? 'down' : 'stable') : 'stable',
            change: previous ? Math.abs(latest.systolic - previous.systolic) : 0
          };
        } else {
          metrics[metric.key] = {
            current: latest.value,
            value: latest.value,
            trend: previous ? (latest.value > previous.value ? 'up' : latest.value < previous.value ? 'down' : 'stable') : 'stable',
            change: previous ? Math.abs(latest.value - previous.value) : 0
          };
        }
      }
    });
    
    return metrics;
  };

  const currentMetrics = getCurrentMetrics();

  const getGoalProgress = (goal) => {
    const progress = (goal.current / goal.target) * 100;
    return Math.min(progress, 100);
  };

  const getTrendLabel = (trend) => {
    return t(`clubs.SportsHealthTracking.trends.${trend}`);
  };

  const getChangeText = (change, trend) => {
    return t('clubs.SportsHealthTracking.changeFromYesterday', { 
      change: (trend === 'up' ? '+' : '-') + change 
    });
  };

  const handleAddEntry = (e) => {
    e.preventDefault();
    
    const newDataEntry = {
      date: newEntry.date,
      time: newEntry.time,
      value: parseFloat(newEntry.value)
    };

    if (newEntry.type === 'bloodPressure') {
      const [systolic, diastolic] = newEntry.value.split('/');
      newDataEntry.systolic = parseInt(systolic);
      newDataEntry.diastolic = parseInt(diastolic);
      delete newDataEntry.value;
    }

    setHealthData(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [newEntry.type]: [newDataEntry, ...prev.metrics[newEntry.type]]
      }
    }));

    setNewEntry({
      type: 'heartRate',
      value: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      notes: ''
    });
    setShowAddModal(false);
  };

  const handleGoalUpdate = (goalId, newTarget) => {
    setHealthData(prev => ({
      ...prev,
      goals: prev.goals.map(goal => 
        goal.id === goalId ? { ...goal, target: newTarget } : goal
      )
    }));
    setEditingGoal(null);
  };

  if (healthLectures.length === 0 && medicalServices.length === 0) {
    return null;
  }

  return (
    <section id="sports-health-tracking" className="sports-health-tracking-section">
      <div className="sports-health-tracking-container">
        
        <div className="sports-health-tracking-header">
          <div className="sports-health-tracking-header-content">
            <div className="sports-health-tracking-badge">
              <FontAwesomeIcon icon={faShieldAlt} />
              <span>{t('clubs.SportsHealthTracking.header.badge')}</span>
            </div>
            <h2 className="sports-health-tracking-title">
              {t('clubs.SportsHealthTracking.header.title')}
            </h2>
            <p className="sports-health-tracking-subtitle">
              {t('clubs.SportsHealthTracking.header.subtitle')}
            </p>
          </div>
          
          <div className="sports-health-tracking-quick-stats">
            <div className="sports-health-tracking-quick-stat">
              <div className="sports-health-tracking-stat-icon">
                <FontAwesomeIcon icon={faHeartbeat} />
              </div>
              <div className="sports-health-tracking-stat-content">
                <span className="sports-health-tracking-stat-number">
                  {currentMetrics.heartRate?.current || '72'}
                </span>
                <span className="sports-health-tracking-stat-label">
                  {t('clubs.SportsHealthTracking.units.bpm')}
                </span>
              </div>
            </div>
            <div className="sports-health-tracking-quick-stat">
              <div className="sports-health-tracking-stat-icon">
                <FontAwesomeIcon icon={faRunning} />
              </div>
              <div className="sports-health-tracking-stat-content">
                <span className="sports-health-tracking-stat-number">
                  {currentMetrics.steps?.current || '8,500'}
                </span>
                <span className="sports-health-tracking-stat-label">
                  {t('clubs.SportsHealthTracking.units.steps')}
                </span>
              </div>
            </div>
            <div className="sports-health-tracking-quick-stat">
              <div className="sports-health-tracking-stat-icon">
                <FontAwesomeIcon icon={faFlag} />
              </div>
              <div className="sports-health-tracking-stat-content">
                <span className="sports-health-tracking-stat-number">
                  {healthData.goals.filter(g => getGoalProgress(g) >= 100).length}
                </span>
                <span className="sports-health-tracking-stat-label">
                  {t('clubs.SportsHealthTracking.stats.goalsAchieved')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="sports-health-tracking-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`sports-health-tracking-tab ${activeTab === tab.key ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={tab.icon} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="sports-health-tracking-content">
          
          {activeTab === 'overview' && (
            <div className="sports-health-tracking-overview">
              
              <div className="sports-health-tracking-metrics-grid">
                {healthMetrics.slice(0, 4).map(metric => {
                  const data = currentMetrics[metric.key];
                  return (
                    <div 
                      key={metric.key}
                      className="sports-health-tracking-metric-card"
                      style={{ '--metric-gradient': metric.gradient }}
                    >
                      <div className="sports-health-tracking-metric-header">
                        <div className="sports-health-tracking-metric-icon">
                          <FontAwesomeIcon icon={metric.icon} />
                        </div>
                        <div className={`sports-health-tracking-metric-trend ${data?.trend || 'stable'}`}>
                          {data?.trend === 'up' && <FontAwesomeIcon icon={faArrowUp} />}
                          {data?.trend === 'down' && <FontAwesomeIcon icon={faArrowDown} />}
                          {data?.trend === 'stable' && <FontAwesomeIcon icon={faMinus} />}
                        </div>
                      </div>
                      <div className="sports-health-tracking-metric-content">
                        <h3>{metric.title}</h3>
                        <div className="sports-health-tracking-metric-value">
                          <span className="sports-health-tracking-metric-number">
                            {data?.current || '—'}
                          </span>
                          <span className="sports-health-tracking-metric-unit">
                            {metric.unit}
                          </span>
                        </div>
                        {data?.change > 0 && (
                          <div className="sports-health-tracking-metric-change">
                            {getChangeText(data.change, data.trend)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="sports-health-tracking-goals-overview">
                <div className="sports-health-tracking-section-header">
                  <h3>{t('clubs.SportsHealthTracking.overview.goalsProgress')}</h3>
                  <button 
                    onClick={() => setActiveTab('goals')}
                    className="sports-health-tracking-view-all-btn"
                  >
                    <span>{t('clubs.SportsHealthTracking.actions.viewAll')}</span>
                    <FontAwesomeIcon icon={faArrowUp} />
                  </button>
                </div>
                
                <div className="sports-health-tracking-goals-list">
                  {healthData.goals.slice(0, 3).map(goal => {
                    const progress = getGoalProgress(goal);
                    return (
                      <div key={goal.id} className="sports-health-tracking-goal-item">
                        <div className="sports-health-tracking-goal-info">
                          <div className="sports-health-tracking-goal-icon" style={{ '--goal-color': goal.color }}>
                            <FontAwesomeIcon icon={goal.icon} />
                          </div>
                          <div className="sports-health-tracking-goal-details">
                            <h4>{goal.title}</h4>
                            <span>{goal.current} / {goal.target} {goal.unit}</span>
                          </div>
                        </div>
                        <div className="sports-health-tracking-goal-progress">
                          <div className="sports-health-tracking-progress-bar">
                            <div 
                              className="sports-health-tracking-progress-fill"
                              style={{ 
                                width: `${progress}%`,
                                background: goal.color 
                              }}
                            />
                          </div>
                          <span className="sports-health-tracking-progress-percent">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="sports-health-tracking-tips-section">
                <div className="sports-health-tracking-section-header">
                  <h3>{t('clubs.SportsHealthTracking.overview.healthTips')}</h3>
                </div>
                
                <div className="sports-health-tracking-tips-grid">
                  {healthTips.slice(0, 3).map(tip => (
                    <div key={tip.id} className="sports-health-tracking-tip-card">
                      <div className="sports-health-tracking-tip-icon" style={{ '--tip-color': tip.color }}>
                        <FontAwesomeIcon icon={tip.icon} />
                      </div>
                      <div className="sports-health-tracking-tip-content">
                        <h4>{tip.title}</h4>
                        <p>{tip.tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="sports-health-tracking-metrics">
              
              <div className="sports-health-tracking-metric-selector">
                {healthMetrics.map(metric => (
                  <button
                    key={metric.key}
                    onClick={() => setSelectedMetric(metric.key)}
                    className={`sports-health-tracking-metric-btn ${selectedMetric === metric.key ? 'active' : ''}`}
                    style={{ '--metric-color': metric.color }}
                  >
                    <FontAwesomeIcon icon={metric.icon} />
                    <span>{metric.title}</span>
                  </button>
                ))}
              </div>

              <div className="sports-health-tracking-timeframe-selector">
                {timeframePeriods.map(period => (
                  <button
                    key={period.key}
                    onClick={() => setTimeframe(period.key)}
                    className={`sports-health-tracking-timeframe-btn ${timeframe === period.key ? 'active' : ''}`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              <div className="sports-health-tracking-chart-container">
                <div className="sports-health-tracking-chart-placeholder">
                  <FontAwesomeIcon icon={faChartLine} />
                  <h4>{t('clubs.SportsHealthTracking.metrics.chartTitle', { 
                    metric: healthMetrics.find(m => m.key === selectedMetric)?.title 
                  })}</h4>
                  <p>{t('clubs.SportsHealthTracking.metrics.chartDescription')}</p>
                </div>
              </div>

              <div className="sports-health-tracking-actions">
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="sports-health-tracking-add-btn"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>{t('clubs.SportsHealthTracking.actions.addEntry')}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="sports-health-tracking-goals">
              
              <div className="sports-health-tracking-goals-header">
                <h3>{t('clubs.SportsHealthTracking.goals.title')}</h3>
                <p>{t('clubs.SportsHealthTracking.goals.subtitle')}</p>
              </div>

              <div className="sports-health-tracking-goals-grid">
                {healthData.goals.map(goal => {
                  const progress = getGoalProgress(goal);
                  const isEditing = editingGoal === goal.id;
                  
                  return (
                    <div key={goal.id} className="sports-health-tracking-goal-card">
                      <div className="sports-health-tracking-goal-card-header">
                        <div className="sports-health-tracking-goal-card-icon" style={{ '--goal-color': goal.color }}>
                          <FontAwesomeIcon icon={goal.icon} />
                        </div>
                        <div className="sports-health-tracking-goal-card-actions">
                          {progress >= 100 && (
                            <div className="sports-health-tracking-goal-achievement">
                              <FontAwesomeIcon icon={faTrophy} />
                            </div>
                          )}
                          <button 
                            onClick={() => setEditingGoal(isEditing ? null : goal.id)}
                            className="sports-health-tracking-goal-edit-btn"
                          >
                            <FontAwesomeIcon icon={isEditing ? faTimes : faEdit} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="sports-health-tracking-goal-card-content">
                        <h4>{goal.title}</h4>
                        
                        <div className="sports-health-tracking-goal-values">
                          <div className="sports-health-tracking-goal-current">
                            <span className="sports-health-tracking-goal-number">{goal.current}</span>
                            <span className="sports-health-tracking-goal-unit">{goal.unit}</span>
                          </div>
                          <div className="sports-health-tracking-goal-target">
                            {isEditing ? (
                              <div className="sports-health-tracking-goal-edit">
                                <input
                                  type="number"
                                  defaultValue={goal.target}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleGoalUpdate(goal.id, parseFloat(e.target.value));
                                    }
                                  }}
                                />
                                <button 
                                  onClick={(e) => {
                                    const input = e.target.parentElement.querySelector('input');
                                    handleGoalUpdate(goal.id, parseFloat(input.value));
                                  }}
                                  className="sports-health-tracking-save-btn"
                                >
                                  <FontAwesomeIcon icon={faSave} />
                                </button>
                              </div>
                            ) : (
                              <span>{t('clubs.SportsHealthTracking.goals.target', { target: goal.target, unit: goal.unit })}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="sports-health-tracking-goal-progress-section">
                          <div className="sports-health-tracking-goal-progress-bar">
                            <div 
                              className="sports-health-tracking-goal-progress-fill"
                              style={{ 
                                width: `${progress}%`,
                                background: goal.color 
                              }}
                            />
                          </div>
                          <div className="sports-health-tracking-goal-progress-info">
                            <span className="sports-health-tracking-goal-progress-percent">
                              {t('clubs.SportsHealthTracking.goals.achieved', { progress: Math.round(progress) })}
                            </span>
                            <span className="sports-health-tracking-goal-deadline">
                              {t('clubs.SportsHealthTracking.goals.by')} {formatDate(goal.deadline)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="sports-health-tracking-insights">
              
              <div className="sports-health-tracking-insights-header">
                <h3>{t('clubs.SportsHealthTracking.insights.title')}</h3>
                <p>{t('clubs.SportsHealthTracking.insights.subtitle')}</p>
              </div>

              <div className="sports-health-tracking-insights-grid">
                
                <div className="sports-health-tracking-insight-card trends">
                  <div className="sports-health-tracking-insight-header">
                    <FontAwesomeIcon icon={faChartLine} />
                    <h4>{t('clubs.SportsHealthTracking.insights.trends.title')}</h4>
                  </div>
                  <div className="sports-health-tracking-insight-content">
                    <div className="sports-health-tracking-trend-item positive">
                      <FontAwesomeIcon icon={faArrowUp} />
                      <span>{t('clubs.SportsHealthTracking.insights.trends.activityIncrease')}</span>
                    </div>
                    <div className="sports-health-tracking-trend-item neutral">
                      <FontAwesomeIcon icon={faMinus} />
                      <span>{t('clubs.SportsHealthTracking.insights.trends.heartRateStable')}</span>
                    </div>
                    <div className="sports-health-tracking-trend-item negative">
                      <FontAwesomeIcon icon={faArrowDown} />
                      <span>{t('clubs.SportsHealthTracking.insights.trends.sleepDecline')}</span>
                    </div>
                  </div>
                </div>

                <div className="sports-health-tracking-insight-card recommendations">
                  <div className="sports-health-tracking-insight-header">
                    <FontAwesomeIcon icon={faLightbulb} />
                    <h4>{t('clubs.SportsHealthTracking.insights.recommendations.title')}</h4>
                  </div>
                  <div className="sports-health-tracking-insight-content">
                    <div className="sports-health-tracking-recommendation">
                      <FontAwesomeIcon icon={faWater} />
                      <span>{t('clubs.SportsHealthTracking.insights.recommendations.increaseWater')}</span>
                    </div>
                    <div className="sports-health-tracking-recommendation">
                      <FontAwesomeIcon icon={faBed} />
                      <span>{t('clubs.SportsHealthTracking.insights.recommendations.sleepEarlier')}</span>
                    </div>
                    <div className="sports-health-tracking-recommendation">
                      <FontAwesomeIcon icon={faRunning} />
                      <span>{t('clubs.SportsHealthTracking.insights.recommendations.moreSteps')}</span>
                    </div>
                  </div>
                </div>

                <div className="sports-health-tracking-insight-card achievements">
                  <div className="sports-health-tracking-insight-header">
                    <FontAwesomeIcon icon={faTrophy} />
                    <h4>{t('clubs.SportsHealthTracking.insights.achievements.title')}</h4>
                  </div>
                  <div className="sports-health-tracking-insight-content">
                    <div className="sports-health-tracking-achievement">
                      <FontAwesomeIcon icon={faAward} />
                      <span>{t('clubs.SportsHealthTracking.insights.achievements.sevenDaysSteps')}</span>
                    </div>
                    <div className="sports-health-tracking-achievement">
                      <FontAwesomeIcon icon={faStar} />
                      <span>{t('clubs.SportsHealthTracking.insights.achievements.hydrationGoal')}</span>
                    </div>
                    <div className="sports-health-tracking-achievement">
                      <FontAwesomeIcon icon={faCrown} />
                      <span>{t('clubs.SportsHealthTracking.insights.achievements.bestMonth')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sports-health-tracking-all-tips">
                <h4>{t('clubs.SportsHealthTracking.insights.allTips')}</h4>
                <div className="sports-health-tracking-tips-list">
                  {healthTips.map(tip => (
                    <div key={tip.id} className="sports-health-tracking-tip-item">
                      <div className="sports-health-tracking-tip-item-icon" style={{ '--tip-color': tip.color }}>
                        <FontAwesomeIcon icon={tip.icon} />
                      </div>
                      <div className="sports-health-tracking-tip-item-content">
                        <h5>{tip.title}</h5>
                        <p>{tip.tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="sports-health-tracking-services">
              
              <div className="sports-health-tracking-services-header">
                <h3>{t('clubs.SportsHealthTracking.services.title')}</h3>
                <p>{t('clubs.SportsHealthTracking.services.subtitle')}</p>
              </div>

              {healthLectures.length > 0 && (
                <div className="sports-health-tracking-service-section">
                  <h4>{t('clubs.SportsHealthTracking.services.healthLectures')}</h4>
                  <div className="sports-health-tracking-lectures-grid">
                    {healthLectures.map((lecture, index) => (
                      <div key={index} className="sports-health-tracking-lecture-card">
                        <div className="sports-health-tracking-lecture-icon">
                          <FontAwesomeIcon icon={faGraduationCap} />
                        </div>
                        <div className="sports-health-tracking-lecture-content">
                          <h5>{lecture.topic}</h5>
                          <div className="sports-health-tracking-lecture-details">
                            {lecture.lecturer && (
                              <div className="sports-health-tracking-lecture-detail">
                                <FontAwesomeIcon icon={faUser} />
                                <span>{lecture.lecturer}</span>
                              </div>
                            )}
                            {lecture.duration && (
                              <div className="sports-health-tracking-lecture-detail">
                                <FontAwesomeIcon icon={faStopwatch} />
                                <span>{lecture.duration}</span>
                              </div>
                            )}
                            {lecture.nextDate && (
                              <div className="sports-health-tracking-lecture-detail">
                                <FontAwesomeIcon icon={faCalendarAlt} />
                                <span>{formatDate(lecture.nextDate)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {medicalServices.length > 0 && (
                <div className="sports-health-tracking-service-section">
                  <h4>{t('clubs.SportsHealthTracking.services.medicalServices')}</h4>
                  <div className="sports-health-tracking-services-grid">
                    {medicalServices.map((service, index) => (
                      <div key={index} className="sports-health-tracking-service-card">
                        <div className="sports-health-tracking-service-icon">
                          <FontAwesomeIcon icon={faMedkit} />
                        </div>
                        <div className="sports-health-tracking-service-content">
                          <h5>{service.type}</h5>
                          {service.description && (
                            <p>{service.description}</p>
                          )}
                          <div className="sports-health-tracking-service-details">
                            {service.frequency && (
                              <div className="sports-health-tracking-service-detail">
                                <FontAwesomeIcon icon={faCalendarAlt} />
                                <span>{service.frequency}</span>
                              </div>
                            )}
                            {service.specialist && (
                              <div className="sports-health-tracking-service-detail">
                                <FontAwesomeIcon icon={faHandHoldingMedical} />
                                <span>{service.specialist}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="sports-health-tracking-emergency-info">
                <div className="sports-health-tracking-emergency-header">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <h4>{t('clubs.SportsHealthTracking.services.emergencyInfo')}</h4>
                </div>
                <div className="sports-health-tracking-emergency-content">
                  <p>{t('clubs.SportsHealthTracking.services.emergencyContact')}:</p>
                  <div className="sports-health-tracking-emergency-contacts">
                    <div className="sports-health-tracking-emergency-contact">
                      <strong>{t('clubs.SportsHealthTracking.services.emergencyNumber')}: 112</strong>
                    </div>
                    <div className="sports-health-tracking-emergency-contact">
                      <strong>{t('clubs.SportsHealthTracking.services.clubDoctor')}: {club.contacts?.phone || t('clubs.SportsHealthTracking.services.noData')}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="sports-health-tracking-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="sports-health-tracking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sports-health-tracking-modal-header">
              <h3>{t('clubs.SportsHealthTracking.modal.addEntry')}</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="sports-health-tracking-modal-close"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleAddEntry} className="sports-health-tracking-modal-form">
              <div className="sports-health-tracking-form-group">
                <label>{t('clubs.SportsHealthTracking.modal.metricType')}</label>
                <select 
                  value={newEntry.type}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, type: e.target.value }))}
                >
                  {healthMetrics.map(metric => (
                    <option key={metric.key} value={metric.key}>
                      {metric.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="sports-health-tracking-form-row">
                <div className="sports-health-tracking-form-group">
                  <label>{t('clubs.SportsHealthTracking.modal.date')}</label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="sports-health-tracking-form-group">
                  <label>{t('clubs.SportsHealthTracking.modal.time')}</label>
                  <input
                    type="time"
                    value={newEntry.time}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="sports-health-tracking-form-group">
                <label>
                  {t('clubs.SportsHealthTracking.modal.value')} ({healthMetrics.find(m => m.key === newEntry.type)?.unit})
                </label>
                <input
                  type={newEntry.type === 'bloodPressure' ? 'text' : 'number'}
                  placeholder={newEntry.type === 'bloodPressure' ? 
                    t('clubs.SportsHealthTracking.modal.bloodPressurePlaceholder') : 
                    t('clubs.SportsHealthTracking.modal.valuePlaceholder')}
                  value={newEntry.value}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, value: e.target.value }))}
                  required
                />
              </div>
              
              <div className="sports-health-tracking-form-group">
                <label>{t('clubs.SportsHealthTracking.modal.notes')}</label>
                <textarea
                  placeholder={t('clubs.SportsHealthTracking.modal.notesPlaceholder')}
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                  rows="3"
                />
              </div>
              
              <div className="sports-health-tracking-form-actions">
                <button type="submit" className="sports-health-tracking-submit-btn">
                  <FontAwesomeIcon icon={faSave} />
                  <span>{t('clubs.SportsHealthTracking.actions.save')}</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="sports-health-tracking-cancel-btn"
                >
                  {t('clubs.SportsHealthTracking.actions.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default SportsHealthTracking;