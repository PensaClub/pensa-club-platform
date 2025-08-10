import { useState } from 'react';
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

  // Проверяваме дали има необходимите данни
  if (!club?.activities?.regular?.length && 
      !club?.pensionersSpecific?.ageSpecificNeeds?.lowImpactActivities?.length) {
    return null;
  }

  // Събираме данни
  const activities = club.activities || {};
  const regularActivities = activities.regular || [];
  const pensionersSpecific = club.pensionersSpecific || {};
  const ageSpecificNeeds = pensionersSpecific.ageSpecificNeeds || {};
  const lowImpactActivities = ageSpecificNeeds.lowImpactActivities || [];
  const contacts = club.contacts || {};

  // Комбинираме всички програми
  const allPrograms = [
    ...regularActivities.map(activity => ({
      ...activity,
      type: 'regular',
      intensity: getIntensityFromName(activity.name),
      category: getCategoryFromName(activity.name),
      icon: getActivityIcon(activity.name),
      color: getActivityColor(activity.name),
      suitableFor: [],
      duration: extractDuration(activity.time) || '60 мин'
    })),
    ...lowImpactActivities.map(activity => ({
      name: activity.name,
      intensity: activity.intensity || 'ниска',
      suitableFor: activity.suitableFor || [],
      type: 'low-impact',
      category: 'wellness',
      icon: getActivityIcon(activity.name),
      color: getActivityColor(activity.name),
      description: `Щадяща програма подходяща за ${activity.suitableFor?.join(', ') || 'всички'}`,
      duration: '45 мин',
      participants: 0,
      day: 'Гъвкаво',
      time: 'По договорка'
    }))
  ];

  // Ако няма програми, не показваме компонента
  if (allPrograms.length === 0) {
    return null;
  }

  // Филтри за програмите
  const programFilters = [
    { key: 'all', label: 'Всички програми', icon: faDumbbell, color: '#6b7280' },
    { key: 'fitness', label: 'Фитнес', icon: faDumbbell, color: '#f97316' },
    { key: 'cardio', label: 'Кардио', icon: faHeartbeat, color: '#ef4444' },
    { key: 'wellness', label: 'Уелнес', icon: faLeaf, color: '#22c55e' },
    { key: 'aquatic', label: 'Водни спортове', icon: faSwimmer, color: '#06b6d4' },
    { key: 'dance', label: 'Танци', icon: faFire, color: '#8b5cf6' }
  ];

  // Helper функции
  function getIntensityFromName(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('лека') || lowerName.includes('йога') || lowerName.includes('медитация')) {
      return 'ниска';
    }
    if (lowerName.includes('интензивн') || lowerName.includes('силов') || lowerName.includes('бягане')) {
      return 'висока';
    }
    return 'средна';
  }

  function getCategoryFromName(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('басейн') || lowerName.includes('плуване') || lowerName.includes('аеробика')) {
      return 'aquatic';
    }
    if (lowerName.includes('танц')) {
      return 'dance';
    }
    if (lowerName.includes('йога') || lowerName.includes('медитация') || lowerName.includes('лека')) {
      return 'wellness';
    }
    if (lowerName.includes('бягане') || lowerName.includes('гимнастика')) {
      return 'cardio';
    }
    return 'fitness';
  }

  function getActivityIcon(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('йога') || lowerName.includes('медитация')) return faLeaf;
    if (lowerName.includes('басейн') || lowerName.includes('плуване')) return faSwimmer;
    if (lowerName.includes('силов') || lowerName.includes('фитнес')) return faDumbbell;
    if (lowerName.includes('бягане') || lowerName.includes('гимнастика')) return faHeartbeat;
    if (lowerName.includes('танц')) return faFire;
    if (lowerName.includes('разходки')) return faRunning;
    return faDumbbell;
  }

  function getActivityColor(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('йога') || lowerName.includes('медитация')) return '#22c55e';
    if (lowerName.includes('басейн') || lowerName.includes('плуване')) return '#06b6d4';
    if (lowerName.includes('силов') || lowerName.includes('фитнес')) return '#f97316';
    if (lowerName.includes('бягане') || lowerName.includes('гимнастика')) return '#ef4444';
    if (lowerName.includes('танц')) return '#8b5cf6';
    if (lowerName.includes('разходки')) return '#059669';
    return '#6b7280';
  }

  function getIntensityColor(intensity) {
    switch(intensity) {
      case 'ниска': return '#22c55e';
      case 'средна': return '#f59e0b';
      case 'висока': return '#ef4444';
      default: return '#6b7280';
    }
  }

  function extractDuration(timeString) {
    if (!timeString) return null;
    const match = timeString.match(/(\d+):(\d+)-(\d+):(\d+)/);
    if (match) {
      const startHour = parseInt(match[1]);
      const startMin = parseInt(match[2]);
      const endHour = parseInt(match[3]);
      const endMin = parseInt(match[4]);
      const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
      return `${duration} мин`;
    }
    return null;
  }

  // Филтрираме програмите
  const filteredPrograms = allPrograms.filter(program => {
    return activeFilter === 'all' || program.category === activeFilter;
  });

  // Enroll form handlers
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
      const subject = encodeURIComponent(`Заявка за записване - ${selectedProgram.name}`);
      const body = encodeURIComponent(`
Здравейте,

Получихте нова заявка за записване във фитнес програма:

ПРОГРАМА: ${selectedProgram.name}
Категория: ${programFilters.find(f => f.key === selectedProgram.category)?.label || 'Фитнес'}
Интензивност: ${selectedProgram.intensity}
${selectedProgram.day ? `Ден: ${selectedProgram.day}` : ''}
${selectedProgram.time ? `Час: ${selectedProgram.time}` : ''}
${selectedProgram.instructor ? `Инструктор: ${selectedProgram.instructor}` : ''}

ДАННИ НА КАНДИДАТА:
Име: ${enrollForm.name}
Имейл: ${enrollForm.email}
Телефон: ${enrollForm.phone}
Фитнес ниво: ${enrollForm.fitnessLevel || 'Не е посочено'}
Цели: ${enrollForm.goals || 'Не са посочени'}
Допълнителни бележки: ${enrollForm.notes || 'Няма'}

Моля, свържете се с кандидата за финализиране на записването.

---
Изпратено от сайта на ${club.name}
      `);
      
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

  // Статистики за програмите
  const programStats = programFilters.slice(1).map(filter => ({
    ...filter,
    count: allPrograms.filter(p => p.category === filter.key).length
  })).filter(stat => stat.count > 0);

  return (
    <section id="fitness-programs" className="fitness-programs-section">
      <div className="fitness-programs-container">
        
        {/* Header */}
        <div className="fitness-programs-header">
          <div className="fitness-programs-badge">
            <FontAwesomeIcon icon={faDumbbell} />
            <span>Фитнес програми</span>
          </div>
          <h2 className="fitness-programs-title">
            Тренировки за всяко ниво и възраст
          </h2>
          <p className="fitness-programs-subtitle">
            Открийте перфектната програма за вашите цели и възможности
          </p>
        </div>

        {/* Program Stats */}
        <div className="fitness-programs-stats">
          <div className="fitness-programs-total-stat">
            <div className="fitness-programs-total-icon">
              <FontAwesomeIcon icon={faTrophy} />
            </div>
            <div className="fitness-programs-total-content">
              <div className="fitness-programs-total-number">{allPrograms.length}</div>
              <div className="fitness-programs-total-label">Активни програми</div>
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

        {/* Program Filters */}
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

        {/* Programs Grid */}
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
                          Щадящо
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
                      {program.day && program.day !== 'Гъвкаво' && (
                        <div className="fitness-programs-card-detail">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          <span>{program.day}</span>
                        </div>
                      )}
                      {program.time && program.time !== 'По договорка' && (
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
                          <span>{program.participants} участници</span>
                        </div>
                      )}
                    </div>
                    
                    {program.suitableFor?.length > 0 && (
                      <div className="fitness-programs-card-suitable">
                        <h6>Подходящо за:</h6>
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
                      <span>Запиши се</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="fitness-programs-no-results">
              <FontAwesomeIcon icon={faInfoCircle} />
              <h4>Няма програми в тази категория</h4>
              <p>Изберете друга категория или се свържете с нас за персонализирани програми</p>
            </div>
          )}
        </div>
      </div>

      {/* Enroll Modal */}
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
              <h3>Запишете се за {selectedProgram?.name}</h3>
              <p>Започнете своето фитнес пътуване с нас още днес!</p>
            </div>
            
            {enrollStatus === 'sent' ? (
              <div className="fitness-programs-form-success">
                <FontAwesomeIcon icon={faCheckCircle} />
                <h4>Заявката е изпратена успешно!</h4>
                <p>Благодарим ви! Ще се свържем с вас за първата тренировка.</p>
              </div>
            ) : enrollStatus === 'error' ? (
              <div className="fitness-programs-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>Възникна грешка</h4>
                <p>Моля опитайте отново или се свържете с нас директно.</p>
              </div>
            ) : (
              <form onSubmit={handleEnrollSubmit} className="fitness-programs-form">
                {selectedProgram && (
                  <div className="fitness-programs-selected-program">
                    <h4>Избрана програма:</h4>
                    <div className="fitness-programs-program-summary">
                      <FontAwesomeIcon icon={selectedProgram.icon} />
                      <div>
                        <strong>{selectedProgram.name}</strong>
                        <span>Интензивност: {selectedProgram.intensity}</span>
                        {selectedProgram.day && <span>{selectedProgram.day}</span>}
                        {selectedProgram.time && <span>{selectedProgram.time}</span>}
                        {selectedProgram.duration && <span>Продължителност: {selectedProgram.duration}</span>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="fitness-programs-form-row">
                  <div className="fitness-programs-form-group">
                    <label htmlFor="fitness-name">
                      <FontAwesomeIcon icon={faUser} />
                      Вашето име *
                    </label>
                    <input
                      type="text"
                      id="fitness-name"
                      value={enrollForm.name}
                      onChange={(e) => handleEnrollChange('name', e.target.value)}
                      required
                      placeholder="Въведете вашето име"
                    />
                  </div>
                  
                  <div className="fitness-programs-form-group">
                    <label htmlFor="fitness-email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      Имейл адрес *
                    </label>
                    <input
                      type="email"
                      id="fitness-email"
                      value={enrollForm.email}
                      onChange={(e) => handleEnrollChange('email', e.target.value)}
                      required
                      placeholder="Въведете вашия имейл"
                    />
                  </div>
                </div>
                
                <div className="fitness-programs-form-row">
                  <div className="fitness-programs-form-group">
                    <label htmlFor="fitness-phone">
                      <FontAwesomeIcon icon={faMobile} />
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      id="fitness-phone"
                      value={enrollForm.phone}
                      onChange={(e) => handleEnrollChange('phone', e.target.value)}
                      required
                      placeholder="Въведете вашия телефон"
                    />
                  </div>
                  
                  <div className="fitness-programs-form-group">
                    <label htmlFor="fitness-level">
                      <FontAwesomeIcon icon={faTrophy} />
                      Фитнес ниво
                    </label>
                    <select
                      id="fitness-level"
                      value={enrollForm.fitnessLevel}
                      onChange={(e) => handleEnrollChange('fitnessLevel', e.target.value)}
                    >
                      <option value="">Изберете ниво</option>
                      <option value="Начинаещ">Начинаещ</option>
                      <option value="Средно ниво">Средно ниво</option>
                      <option value="Напреднал">Напреднал</option>
                      <option value="Експерт">Експерт</option>
                    </select>
                  </div>
                </div>
                
                <div className="fitness-programs-form-group">
                  <label htmlFor="fitness-goals">
                    <FontAwesomeIcon icon={faFlag} />
                    Вашите цели
                  </label>
                  <select
                    id="fitness-goals"
                    value={enrollForm.goals}
                    onChange={(e) => handleEnrollChange('goals', e.target.value)}
                  >
                    <option value="">Изберете цел</option>
                    <option value="Отслабване">Отслабване</option>
                    <option value="Покачване на мускулна маса">Покачване на мускулна маса</option>
                    <option value="Подобряване на кондицията">Подобряване на кондицията</option>
                    <option value="Поддържане на здравето">Поддържане на здравето</option>
                    <option value="Релаксация и стрес">Релаксация и стрес</option>
                    <option value="Рехабилитация">Рехабилитация</option>
                    <option value="Социализация">Социализация</option>
                  </select>
                </div>
                
                <div className="fitness-programs-form-group">
                  <label htmlFor="fitness-notes">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Допълнителни бележки
                  </label>
                  <textarea
                    id="fitness-notes"
                    value={enrollForm.notes}
                    onChange={(e) => handleEnrollChange('notes', e.target.value)}
                    placeholder="Споменете ако имате здравословни ограничения или специални изисквания"
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
                    {enrollStatus === 'sending' ? 'Изпраща се...' : 'Изпрати заявката'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowEnrollModal(false)}
                    className="fitness-programs-cancel-btn"
                  >
                    Отказ
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