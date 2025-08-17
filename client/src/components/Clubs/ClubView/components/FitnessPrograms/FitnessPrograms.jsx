import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDumbbell,
  faHeartbeat,
  faRunning,
  faLeaf,
  faSwimmer,
  faFire,
  faUsers,
  faClock,
  faCalendarAlt,
  faUser,
  faStopwatch,
  faWeight,
  faTrophy,
  faChartLine,
  faPlay,
  faPause,
  faForward,
  faBackward,
  faPlus,
  faMinus,
  faInfoCircle,
  faCheckCircle,
  faExclamationTriangle,
  faPaperPlane,
  faEnvelope,
  faMobile,
  faTimes,
  faArrowRight,
  faArrowLeft,
  faExpand,
  faCompress,
  faFlag
} from '@fortawesome/free-solid-svg-icons';
import './fitnessPrograms.css';

export const FitnessPrograms = ({ club }) => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    name: '',
    email: '',
    phone: '',
    fitnessLevel: '',
    goals: '',
    notes: ''
  });
  const [enrollStatus, setEnrollStatus] = useState(null);

  if (!club?.activities?.regular?.length && 
      !club?.pensionersSpecific?.ageSpecificNeeds?.lowImpactActivities?.length) {
    return null;
  }

  const activities = club.activities || {};
  const regularActivities = activities.regular || [];
  const pensionersSpecific = club.pensionersSpecific || {};
  const ageSpecificNeeds = pensionersSpecific.ageSpecificNeeds || {};
  const lowImpactActivities = ageSpecificNeeds.lowImpactActivities || [];
  const contacts = club.contacts || {};

  const getIntensityFromName = (name) => {
    const lowerName = name.toLowerCase();
    const intensityTerms = t('clubs.FitnessPrograms.intensityTerms', { returnObjects: true });
    
    if (intensityTerms.low.some(term => lowerName.includes(term))) {
      return t('clubs.FitnessPrograms.intensityLevels.low');
    }
    if (intensityTerms.high.some(term => lowerName.includes(term))) {
      return t('clubs.FitnessPrograms.intensityLevels.high');
    }
    return t('clubs.FitnessPrograms.intensityLevels.medium');
  };

  const getCategoryFromName = (name) => {
    const lowerName = name.toLowerCase();
    const categoryTerms = t('clubs.FitnessPrograms.categoryTerms', { returnObjects: true });
    
    for (const [categoryKey, terms] of Object.entries(categoryTerms)) {
      if (terms.some(term => lowerName.includes(term))) {
        return categoryKey;
      }
    }
    return 'fitness';
  };

  const getActivityIcon = (name) => {
    const lowerName = name.toLowerCase();
    const iconTerms = t('clubs.FitnessPrograms.activityIconTerms', { returnObjects: true });
    
    for (const [iconKey, terms] of Object.entries(iconTerms)) {
      if (terms.some(term => lowerName.includes(term))) {
        const iconMap = {
          wellness: faLeaf,
          aquatic: faSwimmer,
          strength: faDumbbell,
          cardio: faHeartbeat,
          dance: faFire,
          walking: faRunning
        };
        return iconMap[iconKey] || faDumbbell;
      }
    }
    return faDumbbell;
  };

  const getActivityColor = (name) => {
    const lowerName = name.toLowerCase();
    const colorTerms = t('clubs.FitnessPrograms.activityColorTerms', { returnObjects: true });
    
    for (const [colorKey, terms] of Object.entries(colorTerms)) {
      if (terms.some(term => lowerName.includes(term))) {
        const colorMap = {
          wellness: '#22c55e',
          aquatic: '#06b6d4',
          strength: '#f97316',
          cardio: '#ef4444',
          dance: '#8b5cf6',
          walking: '#059669'
        };
        return colorMap[colorKey] || '#6b7280';
      }
    }
    return '#6b7280';
  };

  const getIntensityColor = (intensity) => {
    const intensityMap = {
      [t('clubs.FitnessPrograms.intensityLevels.low')]: '#22c55e',
      [t('clubs.FitnessPrograms.intensityLevels.medium')]: '#f59e0b',
      [t('clubs.FitnessPrograms.intensityLevels.high')]: '#ef4444'
    };
    return intensityMap[intensity] || '#6b7280';
  };

  const extractDuration = (timeString) => {
    if (!timeString) return null;
    const match = timeString.match(/(\d+):(\d+)-(\d+):(\d+)/);
    if (match) {
      const startHour = parseInt(match[1]);
      const startMin = parseInt(match[2]);
      const endHour = parseInt(match[3]);
      const endMin = parseInt(match[4]);
      const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
      return t('clubs.FitnessPrograms.duration', { minutes: duration });
    }
    return null;
  };

  const allPrograms = [
    ...regularActivities.map(activity => ({
      ...activity,
      type: 'regular',
      intensity: getIntensityFromName(activity.name),
      category: getCategoryFromName(activity.name),
      icon: getActivityIcon(activity.name),
      color: getActivityColor(activity.name),
      suitableFor: [],
      duration: extractDuration(activity.time) || t('clubs.FitnessPrograms.defaultDuration')
    })),
    ...lowImpactActivities.map(activity => ({
      name: activity.name,
      intensity: activity.intensity || t('clubs.FitnessPrograms.intensityLevels.low'),
      suitableFor: activity.suitableFor || [],
      type: 'low-impact',
      category: 'wellness',
      icon: getActivityIcon(activity.name),
      color: getActivityColor(activity.name),
      description: t('clubs.FitnessPrograms.lowImpactDescription', { 
        suitableFor: activity.suitableFor?.join(', ') || t('clubs.FitnessPrograms.everyone') 
      }),
      duration: t('clubs.FitnessPrograms.shortDuration'),
      participants: 0,
      day: t('clubs.FitnessPrograms.flexible'),
      time: t('clubs.FitnessPrograms.byAgreement')
    }))
  ];

  if (allPrograms.length === 0) {
    return null;
  }

  const getProgramFilters = () => [
    { key: 'all', label: t('clubs.FitnessPrograms.filters.all'), icon: faDumbbell, color: '#6b7280' },
    { key: 'fitness', label: t('clubs.FitnessPrograms.filters.fitness'), icon: faDumbbell, color: '#f97316' },
    { key: 'cardio', label: t('clubs.FitnessPrograms.filters.cardio'), icon: faHeartbeat, color: '#ef4444' },
    { key: 'wellness', label: t('clubs.FitnessPrograms.filters.wellness'), icon: faLeaf, color: '#22c55e' },
    { key: 'aquatic', label: t('clubs.FitnessPrograms.filters.aquatic'), icon: faSwimmer, color: '#06b6d4' },
    { key: 'dance', label: t('clubs.FitnessPrograms.filters.dance'), icon: faFire, color: '#8b5cf6' }
  ];

  const programFilters = getProgramFilters();

  const filteredPrograms = allPrograms.filter(program => {
    return activeFilter === 'all' || program.category === activeFilter;
  });

  const getFitnessLevels = () => [
    { value: '', label: t('clubs.FitnessPrograms.fitnessLevels.select') },
    { value: 'Начинаещ', label: t('clubs.FitnessPrograms.fitnessLevels.beginner') },
    { value: 'Средно ниво', label: t('clubs.FitnessPrograms.fitnessLevels.intermediate') },
    { value: 'Напреднал', label: t('clubs.FitnessPrograms.fitnessLevels.advanced') },
    { value: 'Експерт', label: t('clubs.FitnessPrograms.fitnessLevels.expert') }
  ];

  const getGoalOptions = () => [
    { value: '', label: t('clubs.FitnessPrograms.goals.select') },
    { value: 'Отслабване', label: t('clubs.FitnessPrograms.goals.weightLoss') },
    { value: 'Покачване на мускулна маса', label: t('clubs.FitnessPrograms.goals.muscleGain') },
    { value: 'Подобряване на кондицията', label: t('clubs.FitnessPrograms.goals.fitnessImprovement') },
    { value: 'Поддържане на здравето', label: t('clubs.FitnessPrograms.goals.healthMaintenance') },
    { value: 'Релаксация и стрес', label: t('clubs.FitnessPrograms.goals.relaxation') },
    { value: 'Рехабилитация', label: t('clubs.FitnessPrograms.goals.rehabilitation') },
    { value: 'Социализация', label: t('clubs.FitnessPrograms.goals.socialization') }
  ];

  const fitnessLevels = getFitnessLevels();
  const goalOptions = getGoalOptions();

  const handleEnrollChange = (field, value) => {
    setEnrollForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEnrollSubmit = (e) => {
    e.preventDefault();
    setEnrollStatus('sending');

    if (contacts.email && selectedProgram) {
      const categoryLabel = programFilters.find(f => f.key === selectedProgram.category)?.label || t('clubs.FitnessPrograms.filters.fitness');
      const subject = encodeURIComponent(t('clubs.FitnessPrograms.enrollEmail.subject', { 
        programName: selectedProgram.name 
      }));
      const body = encodeURIComponent(t('clubs.FitnessPrograms.enrollEmail.body', {
        programName: selectedProgram.name,
        category: categoryLabel,
        intensity: selectedProgram.intensity,
        day: selectedProgram.day || '',
        time: selectedProgram.time || '',
        instructor: selectedProgram.instructor || '',
        name: enrollForm.name,
        email: enrollForm.email,
        phone: enrollForm.phone,
        fitnessLevel: enrollForm.fitnessLevel || t('clubs.FitnessPrograms.enrollEmail.notSpecified'),
        goals: enrollForm.goals || t('clubs.FitnessPrograms.enrollEmail.notSpecified'),
        notes: enrollForm.notes || t('clubs.FitnessPrograms.enrollEmail.none'),
        clubName: club.name
      }));
      
      try {
        window.location.href = `mailto:${contacts.email}?subject=${subject}&body=${body}`;
        setEnrollStatus('sent');
        setTimeout(() => {
          setShowEnrollModal(false);
          setEnrollStatus(null);
          setSelectedProgram(null);
          setEnrollForm({ name: '', email: '', phone: '', fitnessLevel: '', goals: '', notes: '' });
        }, 2000);
      } catch (error) {
        setEnrollStatus('error');
      }
    } else {
      setEnrollStatus('error');
    }
  };

  const openEnrollModal = (program) => {
    setSelectedProgram(program);
    setShowEnrollModal(true);
  };

  const programStats = programFilters.slice(1).map(filter => ({
    ...filter,
    count: allPrograms.filter(p => p.category === filter.key).length
  })).filter(stat => stat.count > 0);

  return (
    <section id="fitness-programs" className="fitness-programs-section">
      <div className="fitness-programs-container">
        
        <div className="fitness-programs-header">
          <div className="fitness-programs-badge">
            <FontAwesomeIcon icon={faDumbbell} />
            <span>{t('clubs.FitnessPrograms.header.badge')}</span>
          </div>
          <h2 className="fitness-programs-title">
            {t('clubs.FitnessPrograms.header.title')}
          </h2>
          <p className="fitness-programs-subtitle">
            {t('clubs.FitnessPrograms.header.subtitle')}
          </p>
        </div>

        <div className="fitness-programs-stats">
          <div className="fitness-programs-total-stat">
            <div className="fitness-programs-total-icon">
              <FontAwesomeIcon icon={faTrophy} />
            </div>
            <div className="fitness-programs-total-content">
              <div className="fitness-programs-total-number">{allPrograms.length}</div>
              <div className="fitness-programs-total-label">{t('clubs.FitnessPrograms.stats.activePrograms')}</div>
            </div>
          </div>
          
          {programStats.map((stat, index) => (
            <div 
              key={stat.key} 
              className="fitness-programs-stat-card"
              style={{ '--stat-color': stat.color, '--stat-delay': `${index * 0.1}s` }}
            >
              <div className="fitness-programs-stat-icon">
                <FontAwesomeIcon icon={stat.icon} />
              </div>
              <div className="fitness-programs-stat-content">
                <div className="fitness-programs-stat-number">{stat.count}</div>
                <div className="fitness-programs-stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="fitness-programs-filters">
          {programFilters.map(filter => {
            const count = filter.key === 'all' ? allPrograms.length : 
                         allPrograms.filter(p => p.category === filter.key).length;
            
            return count > 0 && (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`fitness-programs-filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
                style={{ '--filter-color': filter.color }}
              >
                <FontAwesomeIcon icon={filter.icon} />
                <span>{filter.label}</span>
                <div className="fitness-programs-filter-count">{count}</div>
              </button>
            );
          })}
        </div>

        <div className="fitness-programs-content">
          {filteredPrograms.length > 0 ? (
            <div className="fitness-programs-grid">
              {filteredPrograms.map((program, index) => (
                <div 
                  key={index} 
                  className="fitness-programs-card"
                  style={{ 
                    '--program-color': program.color,
                    '--program-delay': `${index * 0.1}s` 
                  }}
                >
                  <div className="fitness-programs-card-header">
                    <div className="fitness-programs-card-icon">
                      <FontAwesomeIcon icon={program.icon} />
                    </div>
                    <div className="fitness-programs-card-badges">
                      <span 
                        className="fitness-programs-intensity-badge"
                        style={{ '--intensity-color': getIntensityColor(program.intensity) }}
                      >
                        {program.intensity}
                      </span>
                      {program.type === 'low-impact' && (
                        <span className="fitness-programs-type-badge">
                          {t('clubs.FitnessPrograms.badges.gentle')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="fitness-programs-card-content">
                    <h4>{program.name}</h4>
                    {program.description && (
                      <p className="fitness-programs-card-description">
                        {program.description}
                      </p>
                    )}
                    
                    <div className="fitness-programs-card-details">
                      {program.duration && (
                        <div className="fitness-programs-card-detail">
                          <FontAwesomeIcon icon={faClock} />
                          <span>{program.duration}</span>
                        </div>
                      )}
                      {program.day && program.day !== t('clubs.FitnessPrograms.flexible') && (
                        <div className="fitness-programs-card-detail">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          <span>{program.day}</span>
                        </div>
                      )}
                      {program.time && program.time !== t('clubs.FitnessPrograms.byAgreement') && (
                        <div className="fitness-programs-card-detail">
                          <FontAwesomeIcon icon={faStopwatch} />
                          <span>{program.time}</span>
                        </div>
                      )}
                      {program.instructor && (
                        <div className="fitness-programs-card-detail">
                          <FontAwesomeIcon icon={faUser} />
                          <span>{program.instructor}</span>
                        </div>
                      )}
                      {program.participants > 0 && (
                        <div className="fitness-programs-card-detail">
                          <FontAwesomeIcon icon={faUsers} />
                          <span>{t('clubs.FitnessPrograms.participants', { count: program.participants })}</span>
                        </div>
                      )}
                    </div>
                    
                    {program.suitableFor?.length > 0 && (
                      <div className="fitness-programs-card-suitable">
                        <h6>{t('clubs.FitnessPrograms.suitableFor')}:</h6>
                        <div className="fitness-programs-suitable-tags">
                          {program.suitableFor.slice(0, 2).map((condition, idx) => (
                            <span key={idx} className="fitness-programs-suitable-tag">
                              {condition}
                            </span>
                          ))}
                          {program.suitableFor.length > 2 && (
                            <span className="fitness-programs-suitable-more">
                              +{program.suitableFor.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="fitness-programs-card-footer">
                    <button 
                      onClick={() => openEnrollModal(program)}
                      className="fitness-programs-enroll-btn"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      <span>{t('clubs.FitnessPrograms.actions.enroll')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="fitness-programs-no-results">
              <FontAwesomeIcon icon={faInfoCircle} />
              <h4>{t('clubs.FitnessPrograms.noResults.title')}</h4>
              <p>{t('clubs.FitnessPrograms.noResults.message')}</p>
            </div>
          )}
        </div>
      </div>

      {showEnrollModal && (
        <div className="fitness-programs-modal" onClick={() => setShowEnrollModal(false)}>
          <div className="fitness-programs-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="fitness-programs-modal-close" 
              onClick={() => setShowEnrollModal(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="fitness-programs-modal-header">
              <FontAwesomeIcon icon={faDumbbell} />
              <h3>{t('clubs.FitnessPrograms.enrollModal.title', { programName: selectedProgram?.name })}</h3>
              <p>{t('clubs.FitnessPrograms.enrollModal.subtitle')}</p>
            </div>
            
            {enrollStatus === 'sent' ? (
              <div className="fitness-programs-form-success">
                <FontAwesomeIcon icon={faCheckCircle} />
                <h4>{t('clubs.FitnessPrograms.enrollModal.success.title')}</h4>
                <p>{t('clubs.FitnessPrograms.enrollModal.success.message')}</p>
              </div>
            ) : enrollStatus === 'error' ? (
              <div className="fitness-programs-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>{t('clubs.FitnessPrograms.enrollModal.error.title')}</h4>
                <p>{t('clubs.FitnessPrograms.enrollModal.error.message')}</p>
              </div>
            ) : (
              <form onSubmit={handleEnrollSubmit} className="fitness-programs-form">
                {selectedProgram && (
                  <div className="fitness-programs-selected-program">
                    <h4>{t('clubs.FitnessPrograms.enrollModal.selectedProgram')}:</h4>
                    <div className="fitness-programs-program-summary">
                      <FontAwesomeIcon icon={selectedProgram.icon} />
                      <div>
                        <strong>{selectedProgram.name}</strong>
                        <span>{t('clubs.FitnessPrograms.enrollModal.intensity')}: {selectedProgram.intensity}</span>
                        {selectedProgram.day && <span>{selectedProgram.day}</span>}
                        {selectedProgram.time && <span>{selectedProgram.time}</span>}
                        {selectedProgram.duration && <span>{t('clubs.FitnessPrograms.enrollModal.duration')}: {selectedProgram.duration}</span>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="fitness-programs-form-row">
                  <div className="fitness-programs-form-group">
                    <label htmlFor="fitness-name">
                      <FontAwesomeIcon icon={faUser} />
                      {t('clubs.FitnessPrograms.enrollModal.form.name')} *
                    </label>
                    <input
                      type="text"
                      id="fitness-name"
                      value={enrollForm.name}
                      onChange={(e) => handleEnrollChange('name', e.target.value)}
                      required
                      placeholder={t('clubs.FitnessPrograms.enrollModal.form.namePlaceholder')}
                    />
                  </div>
                  
                  <div className="fitness-programs-form-group">
                    <label htmlFor="fitness-email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.FitnessPrograms.enrollModal.form.email')} *
                    </label>
                    <input
                      type="email"
                      id="fitness-email"
                      value={enrollForm.email}
                      onChange={(e) => handleEnrollChange('email', e.target.value)}
                      required
                      placeholder={t('clubs.FitnessPrograms.enrollModal.form.emailPlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="fitness-programs-form-row">
                  <div className="fitness-programs-form-group">
                    <label htmlFor="fitness-phone">
                      <FontAwesomeIcon icon={faMobile} />
                      {t('clubs.FitnessPrograms.enrollModal.form.phone')} *
                    </label>
                    <input
                      type="tel"
                      id="fitness-phone"
                      value={enrollForm.phone}
                      onChange={(e) => handleEnrollChange('phone', e.target.value)}
                      required
                      placeholder={t('clubs.FitnessPrograms.enrollModal.form.phonePlaceholder')}
                    />
                  </div>
                  
                  <div className="fitness-programs-form-group">
                    <label htmlFor="fitness-level">
                      <FontAwesomeIcon icon={faTrophy} />
                      {t('clubs.FitnessPrograms.enrollModal.form.fitnessLevel')}
                    </label>
                    <select
                      id="fitness-level"
                      value={enrollForm.fitnessLevel}
                      onChange={(e) => handleEnrollChange('fitnessLevel', e.target.value)}
                    >
                      {fitnessLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="fitness-programs-form-group">
                  <label htmlFor="fitness-goals">
                    <FontAwesomeIcon icon={faFlag} />
                    {t('clubs.FitnessPrograms.enrollModal.form.goals')}
                  </label>
                  <select
                    id="fitness-goals"
                    value={enrollForm.goals}
                    onChange={(e) => handleEnrollChange('goals', e.target.value)}
                  >
                    {goalOptions.map(goal => (
                      <option key={goal.value} value={goal.value}>
                        {goal.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="fitness-programs-form-group">
                  <label htmlFor="fitness-notes">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    {t('clubs.FitnessPrograms.enrollModal.form.notes')}
                  </label>
                  <textarea
                    id="fitness-notes"
                    value={enrollForm.notes}
                    onChange={(e) => handleEnrollChange('notes', e.target.value)}
                    placeholder={t('clubs.FitnessPrograms.enrollModal.form.notesPlaceholder')}
                    rows="3"
                  />
                </div>
                
                <div className="fitness-programs-form-actions">
                  <button 
                    type="submit" 
                    className="fitness-programs-submit-btn"
                    disabled={enrollStatus === 'sending'}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {enrollStatus === 'sending' ? 
                      t('clubs.FitnessPrograms.enrollModal.form.sending') : 
                      t('clubs.FitnessPrograms.enrollModal.form.submit')}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowEnrollModal(false)}
                    className="fitness-programs-cancel-btn"
                  >
                    {t('clubs.FitnessPrograms.enrollModal.form.cancel')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default FitnessPrograms;