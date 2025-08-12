// components/SportsHealthTracking/SportsHealthTracking.jsx
import { useState, useMemo, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState('heartRate');
  const [timeframe, setTimeframe] = useState('week'); // 'week', 'month', '3months', 'year'
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newEntry, setNewEntry] = useState({
    type: 'heartRate',
    value: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    notes: ''
  });

  // Симулирани данни за здравословно проследяване
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
        title: 'Дневни стъпки',
        target: 10000,
        current: 8500,
        unit: 'стъпки',
        icon: faRunning,
        color: '#ef4444',
        deadline: '2025-08-31'
      },
      {
        id: 2,
        type: 'weight',
        title: 'Целево тегло',
        target: 74.0,
        current: 75.2,
        unit: 'кг',
        icon: faWeight,
        color: '#8b5cf6',
        deadline: '2025-12-31'
      },
      {
        id: 3,
        type: 'water',
        title: 'Дневна хидратация',
        target: 2.5,
        current: 2.1,
        unit: 'литра',
        icon: faWater,
        color: '#06b6d4',
        deadline: '2025-08-31'
      },
      {
        id: 4,
        type: 'sleep',
        title: 'Качествен сън',
        target: 8.0,
        current: 7.5,
        unit: 'часа',
        icon: faBed,
        color: '#6366f1',
        deadline: '2025-08-31'
      }
    ]
  });

  // Проверяваме дали има данни
  if (!club?.pensionersSpecific?.healthServices && !club?.activities) {
    return null;
  }

  // Събираме данни за здравните услуги
  const healthServices = club.pensionersSpecific?.healthServices || {};
  const healthLectures = healthServices.healthLectures || [];
  const medicalServices = healthServices.medicalServices || [];

  // Табове
  const tabs = [
    { key: 'overview', label: 'Преглед', icon: faChartLine },
    { key: 'metrics', label: 'Показатели', icon: faHeartbeat },
    { key: 'goals', label: 'Цели', icon: faFlag },
    { key: 'insights', label: 'Анализи', icon: faLightbulb },
    { key: 'services', label: 'Услуги', icon: faMedkit }
  ];

  // Здравословни показатели
  const healthMetrics = [
    {
      key: 'heartRate',
      title: 'Пулс',
      icon: faHeartbeat,
      color: '#ef4444',
      unit: 'удара/мин',
      normalRange: [60, 100],
      gradient: 'linear-gradient(135deg, #ef4444, #f87171)'
    },
    {
      key: 'bloodPressure',
      title: 'Кръвно налягане',
      icon: faThermometerHalf,
      color: '#8b5cf6',
      unit: 'mmHg',
      normalRange: [120, 80],
      gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)'
    },
    {
      key: 'weight',
      title: 'Тегло',
      icon: faWeight,
      color: '#06b6d4',
      unit: 'кг',
      normalRange: [70, 80],
      gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)'
    },
    {
      key: 'steps',
      title: 'Стъпки',
      icon: faRunning,
      color: '#10b981',
      unit: 'стъпки',
      normalRange: [8000, 12000],
      gradient: 'linear-gradient(135deg, #10b981, #34d399)'
    },
    {
      key: 'sleep',
      title: 'Сън',
      icon: faBed,
      color: '#6366f1',
      unit: 'часа',
      normalRange: [7, 9],
      gradient: 'linear-gradient(135deg, #6366f1, #818cf8)'
    },
    {
      key: 'water',
      title: 'Вода',
      icon: faWater,
      color: '#0ea5e9',
      unit: 'литра',
      normalRange: [2, 3],
      gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)'
    }
  ];

  // Здравословни съвети
  const healthTips = [
    {
      id: 1,
      category: 'cardio',
      title: 'Кардио тренировки',
      tip: 'Редовните кардио упражнения укрепват сърцето и подобряват кръвообращението.',
      icon: faHeartbeat,
      color: '#ef4444'
    },
    {
      id: 2,
      category: 'nutrition',
      title: 'Здравословно хранене',
      tip: 'Консумирайте повече плодове, зеленчуци и цельнозърнести храни.',
      icon: faAppleAlt,
      color: '#10b981'
    },
    {
      id: 3,
      category: 'hydration',
      title: 'Хидратация',
      tip: 'Пийте поне 8 чаши вода дневно за оптимална хидратация.',
      icon: faWater,
      color: '#0ea5e9'
    },
    {
      id: 4,
      category: 'sleep',
      title: 'Качествен сън',
      tip: 'Спете 7-9 часа нощно за пълноценна възстановка.',
      icon: faBed,
      color: '#6366f1'
    },
    {
      id: 5,
      category: 'stress',
      title: 'Управление на стреса',
      tip: 'Практикувайте медитация и дълбоко дишане за намаляване на стреса.',
      icon: faLeaf,
      color: '#059669'
    }
  ];

  // Изчисляваме средни стойности и тенденции
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

  // Изчисляваме прогреса на целите
  const getGoalProgress = (goal) => {
    const progress = (goal.current / goal.target) * 100;
    return Math.min(progress, 100);
  };

  // Handlers
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

  // Ако няма здравни данни, не показваме компонента
  if (healthLectures.length === 0 && medicalServices.length === 0) {
    return null;
  }

  return (
    <section id="sports-health-tracking" className="sports-health-tracking-section">
      <div className="sports-health-tracking-container">
        
        {/* Header */}
        <div className="sports-health-tracking-header">
          <div className="sports-health-tracking-header-content">
            <div className="sports-health-tracking-badge">
              <FontAwesomeIcon icon={faShieldAlt} />
              <span>Здравословно проследяване</span>
            </div>
            <h2 className="sports-health-tracking-title">
              Следете здравето си всеки ден
            </h2>
            <p className="sports-health-tracking-subtitle">
              Интелигентно проследяване на здравословни показатели с персонализирани цели и съвети
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
                <span className="sports-health-tracking-stat-label">BPM</span>
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
                <span className="sports-health-tracking-stat-label">Стъпки</span>
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
                <span className="sports-health-tracking-stat-label">Цели</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
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

        {/* Content */}
        <div className="sports-health-tracking-content">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="sports-health-tracking-overview">
              
              {/* Metrics Grid */}
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
                            {data.trend === 'up' ? '+' : '-'}{data.change} от вчера
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Goals Progress */}
              <div className="sports-health-tracking-goals-overview">
                <div className="sports-health-tracking-section-header">
                  <h3>Прогрес на целите</h3>
                  <button 
                    onClick={() => setActiveTab('goals')}
                    className="sports-health-tracking-view-all-btn"
                  >
                    <span>Виж всички</span>
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

              {/* Health Tips */}
              <div className="sports-health-tracking-tips-section">
                <div className="sports-health-tracking-section-header">
                  <h3>Здравословни съвети</h3>
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

          {/* Metrics Tab */}
          {activeTab === 'metrics' && (
            <div className="sports-health-tracking-metrics">
              
              {/* Metric Selector */}
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

              {/* Timeframe Selector */}
              <div className="sports-health-tracking-timeframe-selector">
                {[
                  { key: 'week', label: '7 дни' },
                  { key: 'month', label: '30 дни' },
                  { key: '3months', label: '3 месеца' },
                  { key: 'year', label: '1 година' }
                ].map(period => (
                  <button
                    key={period.key}
                    onClick={() => setTimeframe(period.key)}
                    className={`sports-health-tracking-timeframe-btn ${timeframe === period.key ? 'active' : ''}`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              {/* Chart Placeholder */}
              <div className="sports-health-tracking-chart-container">
                <div className="sports-health-tracking-chart-placeholder">
                  <FontAwesomeIcon icon={faChartLine} />
                  <h4>Графика за {healthMetrics.find(m => m.key === selectedMetric)?.title}</h4>
                  <p>Тук ще се покаже детайлна графика с данни за избрания период</p>
                </div>
              </div>

              {/* Add Entry Button */}
              <div className="sports-health-tracking-actions">
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="sports-health-tracking-add-btn"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Добави запис</span>
                </button>
              </div>
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div className="sports-health-tracking-goals">
              
              <div className="sports-health-tracking-goals-header">
                <h3>Здравословни цели</h3>
                <p>Поставете си реалистични цели и следете прогреса си</p>
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
                              <>
                                <span>цел: {goal.target} {goal.unit}</span>
                              </>
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
                              {Math.round(progress)}% постигнато
                            </span>
                            <span className="sports-health-tracking-goal-deadline">
                              до {new Date(goal.deadline).toLocaleDateString('bg-BG')}
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

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="sports-health-tracking-insights">
              
              <div className="sports-health-tracking-insights-header">
                <h3>Здравословни анализи</h3>
                <p>Персонализирани препоръки базирани на вашите данни</p>
              </div>

              <div className="sports-health-tracking-insights-grid">
                
                {/* Trends Analysis */}
                <div className="sports-health-tracking-insight-card trends">
                  <div className="sports-health-tracking-insight-header">
                    <FontAwesomeIcon icon={faChartLine} />
                    <h4>Тенденции</h4>
                  </div>
                  <div className="sports-health-tracking-insight-content">
                    <div className="sports-health-tracking-trend-item positive">
                      <FontAwesomeIcon icon={faArrowUp} />
                      <span>Активността ви се е увеличила с 15% този месец</span>
                    </div>
                    <div className="sports-health-tracking-trend-item neutral">
                      <FontAwesomeIcon icon={faMinus} />
                      <span>Пулсът в покой остава стабилен</span>
                    </div>
                    <div className="sports-health-tracking-trend-item negative">
                      <FontAwesomeIcon icon={faArrowDown} />
                      <span>Качеството на съня се е влошило леко</span>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="sports-health-tracking-insight-card recommendations">
                  <div className="sports-health-tracking-insight-header">
                    <FontAwesomeIcon icon={faLightbulb} />
                    <h4>Препоръки</h4>
                  </div>
                  <div className="sports-health-tracking-insight-content">
                    <div className="sports-health-tracking-recommendation">
                      <FontAwesomeIcon icon={faWater} />
                      <span>Увеличете приема на вода с 0.5л дневно</span>
                    </div>
                    <div className="sports-health-tracking-recommendation">
                      <FontAwesomeIcon icon={faBed} />
                      <span>Опитайте да заспивате 30 мин по-рано</span>
                    </div>
                    <div className="sports-health-tracking-recommendation">
                      <FontAwesomeIcon icon={faRunning} />
                      <span>Добавете още 1500 стъпки дневно</span>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="sports-health-tracking-insight-card achievements">
                  <div className="sports-health-tracking-insight-header">
                    <FontAwesomeIcon icon={faTrophy} />
                    <h4>Постижения</h4>
                  </div>
                  <div className="sports-health-tracking-insight-content">
                    <div className="sports-health-tracking-achievement">
                      <FontAwesomeIcon icon={faAward} />
                      <span>7 дни поред над 8000 стъпки</span>
                    </div>
                    <div className="sports-health-tracking-achievement">
                      <FontAwesomeIcon icon={faStar} />
                      <span>Постигната цел за хидратация</span>
                    </div>
                    <div className="sports-health-tracking-achievement">
                      <FontAwesomeIcon icon={faCrown} />
                      <span>Най-добър месец за активност</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Health Tips */}
              <div className="sports-health-tracking-all-tips">
                <h4>Всички здравословни съвети</h4>
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

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="sports-health-tracking-services">
              
              <div className="sports-health-tracking-services-header">
                <h3>Здравни услуги</h3>
                <p>Професионални здравни услуги и лекции в нашия клуб</p>
              </div>

              {/* Health Lectures */}
              {healthLectures.length > 0 && (
                <div className="sports-health-tracking-service-section">
                  <h4>Здравни лекции</h4>
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
                                <span>{new Date(lecture.nextDate).toLocaleDateString('bg-BG')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medical Services */}
              {medicalServices.length > 0 && (
                <div className="sports-health-tracking-service-section">
                  <h4>Медицински услуги</h4>
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

              {/* Emergency Info */}
              <div className="sports-health-tracking-emergency-info">
                <div className="sports-health-tracking-emergency-header">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <h4>Спешна информация</h4>
                </div>
                <div className="sports-health-tracking-emergency-content">
                  <p>При спешни случаи свържете се с:</p>
                  <div className="sports-health-tracking-emergency-contacts">
                    <div className="sports-health-tracking-emergency-contact">
                      <strong>Спешна помощ: 112</strong>
                    </div>
                    <div className="sports-health-tracking-emergency-contact">
                      <strong>Клубен лекар: {club.contacts?.phone || 'Няма данни'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="sports-health-tracking-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="sports-health-tracking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sports-health-tracking-modal-header">
              <h3>Добави нов запис</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="sports-health-tracking-modal-close"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleAddEntry} className="sports-health-tracking-modal-form">
              <div className="sports-health-tracking-form-group">
                <label>Тип показател</label>
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
                  <label>Дата</label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="sports-health-tracking-form-group">
                  <label>Час</label>
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
                  Стойност ({healthMetrics.find(m => m.key === newEntry.type)?.unit})
                </label>
                <input
                  type={newEntry.type === 'bloodPressure' ? 'text' : 'number'}
                  placeholder={newEntry.type === 'bloodPressure' ? '120/80' : 'Въведете стойност'}
                  value={newEntry.value}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, value: e.target.value }))}
                  required
                />
              </div>
              
              <div className="sports-health-tracking-form-group">
                <label>Бележки (по желание)</label>
                <textarea
                  placeholder="Допълнителна информация..."
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                  rows="3"
                />
              </div>
              
              <div className="sports-health-tracking-form-actions">
                <button type="submit" className="sports-health-tracking-submit-btn">
                  <FontAwesomeIcon icon={faSave} />
                  <span>Запази</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="sports-health-tracking-cancel-btn"
                >
                  Отказ
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