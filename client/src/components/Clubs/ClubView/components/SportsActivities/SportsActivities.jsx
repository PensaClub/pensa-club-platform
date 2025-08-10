import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt,
  faDumbbell,
  faRunning,
  faHeartbeat,
  faUsers,
  faStopwatch,
  faClock,
  faMapMarkerAlt,
  faUser,
  faFire,
  faLeaf,
  faSwimmer,
  faWalking,
  faMountain,
  faBook,
  faGraduationCap,
  faTrophy,
  faPlay,
  faPause,
  faForward,
  faBackward,
  faSearch,
  faFilter,
  faTimes,
  faCheckCircle,
  faExclamationTriangle,
  faPaperPlane,
  faEnvelope,
  faMobile,
  faChevronLeft,
  faChevronRight,
  faStar,
  faInfoCircle,
  faPlus,
  faMinus
} from '@fortawesome/free-solid-svg-icons';
import './sportsActivities.css';

export const SportsActivities = ({ club }) => {
  const [activeTab, setActiveTab] = useState('weekly');
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [searchTerm, setSearchTerm] = useState('');
  const [intensityFilter, setIntensityFilter] = useState('all');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [enrollForm, setEnrollForm] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    notes: ''
  });
  const [enrollStatus, setEnrollStatus] = useState(null);

  // Проверяваме дали има необходимите данни
  if (!club?.activities?.regular?.length && 
      !club?.activities?.events?.length && 
      !club?.activities?.trips?.length && 
      !club?.activities?.courses?.length) {
    return null;
  }

  // Събираме данни
  const activities = club.activities || {};
  const regularActivities = activities.regular || [];
  const events = activities.events || [];
  const trips = activities.trips || [];
  const courses = activities.courses || [];
  const contacts = club.contacts || {};
  const pensionersSpecific = club.pensionersSpecific || {};
  const lowImpactActivities = pensionersSpecific.ageSpecificNeeds?.lowImpactActivities || [];

  // Ако няма активности, не показваме компонента
  if (regularActivities.length === 0 && events.length === 0 && trips.length === 0 && courses.length === 0) {
    return null;
  }

  // Дни от седмицата
  const weekDays = [
    { key: 'sunday', label: 'Неделя', short: 'Нед' },
    { key: 'monday', label: 'Понеделник', short: 'Пон' },
    { key: 'tuesday', label: 'Вторник', short: 'Вто' },
    { key: 'wednesday', label: 'Сряда', short: 'Сря' },
    { key: 'thursday', label: 'Четвъртък', short: 'Чет' },
    { key: 'friday', label: 'Петък', short: 'Пет' },
    { key: 'saturday', label: 'Събота', short: 'Съб' }
  ];

  // Mapваме дните на български
  const dayMapping = {
    'понеделник': 'monday',
    'вторник': 'tuesday', 
    'сряда': 'wednesday',
    'четвъртък': 'thursday',
    'петък': 'friday',
    'събота': 'saturday',
    'неделя': 'sunday',
    'всеки ден': 'daily'
  };

  // Групираме активностите по дни
  const activitiesByDay = useMemo(() => {
    const grouped = {};
    weekDays.forEach(day => {
      grouped[day.key] = [];
    });

    regularActivities.forEach(activity => {
      const dayKey = dayMapping[activity.day?.toLowerCase()];
      if (dayKey === 'daily') {
        // Добавяме във всички дни
        weekDays.forEach(day => {
          grouped[day.key].push({
            ...activity,
            type: 'regular',
            icon: getActivityIcon(activity.name)
          });
        });
      } else if (dayKey && grouped[dayKey]) {
        grouped[dayKey].push({
          ...activity,
          type: 'regular',
          icon: getActivityIcon(activity.name)
        });
      }
    });

    return grouped;
  }, [regularActivities]);

  // Helper функции
  function getActivityIcon(activityName) {
    const name = activityName.toLowerCase();
    if (name.includes('йога') || name.includes('медитация')) return faLeaf;
    if (name.includes('аеробика') || name.includes('басейн') || name.includes('плуване')) return faSwimmer;
    if (name.includes('силов') || name.includes('фитнес') || name.includes('тренажор')) return faDumbbell;
    if (name.includes('разходки') || name.includes('бягане') || name.includes('маратон')) return faRunning;
    if (name.includes('танц')) return faFire;
    if (name.includes('гимнастика')) return faHeartbeat;
    if (name.includes('планина') || name.includes('туризъм')) return faMountain;
    return faUsers;
  }

  function getActivityColor(activityName) {
    const name = activityName.toLowerCase();
    if (name.includes('йога') || name.includes('медитация')) return '#22c55e';
    if (name.includes('аеробика') || name.includes('басейн')) return '#06b6d4';
    if (name.includes('силов') || name.includes('фитнес')) return '#f97316';
    if (name.includes('разходки') || name.includes('бягане')) return '#ef4444';
    if (name.includes('танц')) return '#8b5cf6';
    if (name.includes('гимнастика')) return '#ec4899';
    return '#6b7280';
  }

  function getIntensityLevel(activityName) {
    const name = activityName.toLowerCase();
    if (name.includes('йога') || name.includes('медитация') || name.includes('лека')) return 'low';
    if (name.includes('силов') || name.includes('бягане') || name.includes('интензивн')) return 'high';
    return 'medium';
  }

  function getIntensityLabel(level) {
    switch(level) {
      case 'low': return 'Ниска';
      case 'medium': return 'Средна';
      case 'high': return 'Висока';
      default: return 'Средна';
    }
  }

  function getIntensityColor(level) {
    switch(level) {
      case 'low': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  }

  // Филтрираме активностите
  const filteredRegularActivities = regularActivities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const activityIntensity = getIntensityLevel(activity.name);
    const matchesIntensity = intensityFilter === 'all' || activityIntensity === intensityFilter;
    
    return matchesSearch && matchesIntensity;
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

    if (contacts.email && selectedActivity) {
      const subject = encodeURIComponent(`Заявка за записване - ${selectedActivity.name}`);
      const body = encodeURIComponent(`
Здравейте,

Получихте нова заявка за записване в активност:

АКТИВНОСТ: ${selectedActivity.name}
${selectedActivity.day ? `Ден: ${selectedActivity.day}` : ''}
${selectedActivity.time ? `Час: ${selectedActivity.time}` : ''}
${selectedActivity.instructor ? `Инструктор: ${selectedActivity.instructor}` : ''}

ДАННИ НА КАНДИДАТА:
Име: ${enrollForm.name}
Имейл: ${enrollForm.email}
Телефон: ${enrollForm.phone}
Опит: ${enrollForm.experience || 'Не е посочен'}
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
          setSelectedActivity(null);
          setEnrollForm({ name: '', email: '', phone: '', experience: '', notes: '' });
        }, 2000);
      } catch (error) {
        setEnrollStatus('error');
      }
    } else {
      setEnrollStatus('error');
    }
  };

  const openEnrollModal = (activity) => {
    setSelectedActivity(activity);
    setShowEnrollModal(true);
  };

  return (
    <section id="sports-activities" className="sports-activities-section">
      <div className="sports-activities-container">
        
        {/* Header */}
        <div className="sports-activities-header">
          <div className="sports-activities-badge">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>Програми и активности</span>
          </div>
          <h2 className="sports-activities-title">
            Разнообразни програми за всички нива
          </h2>
          <p className="sports-activities-subtitle">
            Открийте активностите, които ви подхождат и започнете тренировките си днес
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="sports-activities-nav">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`sports-activities-nav-btn ${activeTab === 'weekly' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>Седмичен график</span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`sports-activities-nav-btn ${activeTab === 'all' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faDumbbell} />
            <span>Всички програми</span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`sports-activities-nav-btn ${activeTab === 'events' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faTrophy} />
            <span>Събития</span>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`sports-activities-nav-btn ${activeTab === 'courses' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faGraduationCap} />
            <span>Курсове</span>
          </button>
        </div>

        {/* Content */}
        <div className="sports-activities-content">
          
          {/* Weekly Schedule */}
          {activeTab === 'weekly' && (
            <div className="sports-activities-weekly">
              <div className="sports-activities-week-header">
                <h3>Седмичен график на тренировките</h3>
                <p>Изберете ден за да видите активностите</p>
              </div>
              
              <div className="sports-activities-week-navigation">
                {weekDays.map((day, index) => (
                  <button
                    key={day.key}
                    onClick={() => setSelectedDay(index)}
                    className={`sports-activities-day-btn ${selectedDay === index ? 'active' : ''}`}
                  >
                    <span className="sports-activities-day-short">{day.short}</span>
                    <span className="sports-activities-day-full">{day.label}</span>
                    <span className="sports-activities-day-count">
                      {activitiesByDay[day.key]?.length || 0}
                    </span>
                  </button>
                ))}
              </div>

              <div className="sports-activities-day-schedule">
                <h4>{weekDays[selectedDay]?.label}</h4>
                {activitiesByDay[weekDays[selectedDay]?.key]?.length > 0 ? (
                  <div className="sports-activities-timeline">
                    {activitiesByDay[weekDays[selectedDay]?.key]
                      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                      .map((activity, index) => (
                      <div 
                        key={index} 
                        className="sports-activities-timeline-item"
                        style={{ '--activity-color': getActivityColor(activity.name) }}
                      >
                        <div className="sports-activities-timeline-time">
                          <FontAwesomeIcon icon={faClock} />
                          <span>{activity.time || 'Гъвкаво време'}</span>
                        </div>
                        <div className="sports-activities-timeline-content">
                          <div className="sports-activities-timeline-header">
                            <div className="sports-activities-timeline-icon">
                              <FontAwesomeIcon icon={activity.icon} />
                            </div>
                            <div className="sports-activities-timeline-info">
                              <h5>{activity.name}</h5>
                              {activity.instructor && (
                                <span className="sports-activities-instructor">
                                  <FontAwesomeIcon icon={faUser} />
                                  {activity.instructor}
                                </span>
                              )}
                            </div>
                            <div className="sports-activities-timeline-meta">
                              <div className="sports-activities-intensity" 
                                   style={{ '--intensity-color': getIntensityColor(getIntensityLevel(activity.name)) }}>
                                {getIntensityLabel(getIntensityLevel(activity.name))}
                              </div>
                              {activity.participants && (
                                <div className="sports-activities-participants">
                                  <FontAwesomeIcon icon={faUsers} />
                                  <span>{activity.participants}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {activity.description && (
                            <p className="sports-activities-description">{activity.description}</p>
                          )}
                          <button 
                            onClick={() => openEnrollModal(activity)}
                            className="sports-activities-enroll-btn"
                          >
                            <FontAwesomeIcon icon={faPlus} />
                            <span>Запиши се</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="sports-activities-no-activities">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <h5>Няма планирани активности</h5>
                    <p>В този ден няма тренировки или те са с гъвкаво време</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Programs */}
          {activeTab === 'all' && (
            <div className="sports-activities-all">
              <div className="sports-activities-filters">
                <div className="sports-activities-search">
                  <FontAwesomeIcon icon={faSearch} />
                  <input
                    type="text"
                    placeholder="Търсете активност, инструктор..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
                
                <div className="sports-activities-intensity-filter">
                  <FontAwesomeIcon icon={faFilter} />
                  <select 
                    value={intensityFilter} 
                    onChange={(e) => setIntensityFilter(e.target.value)}
                  >
                    <option value="all">Всички нива</option>
                    <option value="low">Ниска интензивност</option>
                    <option value="medium">Средна интензивност</option>
                    <option value="high">Висока интензивност</option>
                  </select>
                </div>
              </div>

              <div className="sports-activities-grid">
                {filteredRegularActivities.map((activity, index) => (
                  <div 
                    key={index} 
                    className="sports-activities-program-card"
                    style={{ '--program-color': getActivityColor(activity.name) }}
                  >
                    <div className="sports-activities-program-header">
                      <div className="sports-activities-program-icon">
                        <FontAwesomeIcon icon={getActivityIcon(activity.name)} />
                      </div>
                      <div className="sports-activities-program-badges">
                        <span 
                          className="sports-activities-intensity-badge"
                          style={{ '--intensity-color': getIntensityColor(getIntensityLevel(activity.name)) }}
                        >
                          {getIntensityLabel(getIntensityLevel(activity.name))}
                        </span>
                      </div>
                    </div>
                    
                    <div className="sports-activities-program-content">
                      <h4>{activity.name}</h4>
                      {activity.description && (
                        <p>{activity.description}</p>
                      )}
                      
                      <div className="sports-activities-program-details">
                        {activity.day && (
                          <div className="sports-activities-program-detail">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            <span>{activity.day}</span>
                          </div>
                        )}
                        {activity.time && (
                          <div className="sports-activities-program-detail">
                            <FontAwesomeIcon icon={faClock} />
                            <span>{activity.time}</span>
                          </div>
                        )}
                        {activity.instructor && (
                          <div className="sports-activities-program-detail">
                            <FontAwesomeIcon icon={faUser} />
                            <span>{activity.instructor}</span>
                          </div>
                        )}
                        {activity.participants && (
                          <div className="sports-activities-program-detail">
                            <FontAwesomeIcon icon={faUsers} />
                            <span>{activity.participants} участници</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="sports-activities-program-footer">
                      <button 
                        onClick={() => openEnrollModal(activity)}
                        className="sports-activities-program-btn"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                        <span>Запиши се</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredRegularActivities.length === 0 && (
                <div className="sports-activities-no-results">
                  <FontAwesomeIcon icon={faSearch} />
                  <h4>Няма намерени програми</h4>
                  <p>Опитайте с различни критерии за търсене</p>
                </div>
              )}
            </div>
          )}

          {/* Events */}
          {activeTab === 'events' && (
            <div className="sports-activities-events">
              <div className="sports-activities-events-header">
                <h3>Предстоящи събития</h3>
                <p>Специални активности и състезания</p>
              </div>
              
              {events.length > 0 ? (
                <div className="sports-activities-events-grid">
                  {events.map((event, index) => (
                    <div key={index} className="sports-activities-event-card">
                      <div className="sports-activities-event-date">
                        <div className="sports-activities-event-day">
                          {new Date(event.date).getDate()}
                        </div>
                        <div className="sports-activities-event-month">
                          {new Date(event.date).toLocaleDateString('bg-BG', { month: 'short' })}
                        </div>
                      </div>
                      <div className="sports-activities-event-content">
                        <div className="sports-activities-event-type">
                          <FontAwesomeIcon icon={faTrophy} />
                          <span>{event.type || 'Събитие'}</span>
                        </div>
                        <h4>{event.title}</h4>
                        {event.description && <p>{event.description}</p>}
                        <div className="sports-activities-event-details">
                          {event.time && (
                            <span>
                              <FontAwesomeIcon icon={faClock} />
                              {event.time}
                            </span>
                          )}
                          {event.participants && (
                            <span>
                              <FontAwesomeIcon icon={faUsers} />
                              {event.participants} участници
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sports-activities-no-events">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <h4>Няма планирани събития</h4>
                  <p>Следете за нови спортни събития и състезания</p>
                </div>
              )}
              
              {trips.length > 0 && (
                <div className="sports-activities-trips">
                  <h4>
                    <FontAwesomeIcon icon={faMountain} />
                    Спортни екскурзии
                  </h4>
                  <div className="sports-activities-trips-list">
                    {trips.map((trip, index) => (
                      <div key={index} className="sports-activities-trip-card">
                        <div className="sports-activities-trip-info">
                          <h5>{trip.destination}</h5>
                          <p>{trip.description}</p>
                          <div className="sports-activities-trip-details">
                            <span>
                              <FontAwesomeIcon icon={faCalendarAlt} />
                              {new Date(trip.date).toLocaleDateString('bg-BG')}
                            </span>
                            <span>
                              <FontAwesomeIcon icon={faUsers} />
                              {trip.participants} участници
                            </span>
                            {trip.price && (
                              <span className="sports-activities-trip-price">
                                {trip.price} лв.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Courses */}
          {activeTab === 'courses' && (
            <div className="sports-activities-courses">
              <div className="sports-activities-courses-header">
                <h3>Специализирани курсове</h3>
                <p>Обучения и образователни програми</p>
              </div>
              
              {courses.length > 0 ? (
                <div className="sports-activities-courses-grid">
                  {courses.map((course, index) => (
                    <div key={index} className="sports-activities-course-card">
                      <div className="sports-activities-course-header">
                        <div className="sports-activities-course-icon">
                          <FontAwesomeIcon icon={faGraduationCap} />
                        </div>
                        <div className="sports-activities-course-duration">
                          {course.duration}
                        </div>
                      </div>
                      <div className="sports-activities-course-content">
                        <h4>{course.name}</h4>
                        {course.description && <p>{course.description}</p>}
                        <div className="sports-activities-course-details">
                          {course.instructor && (
                            <div className="sports-activities-course-detail">
                              <FontAwesomeIcon icon={faUser} />
                              <span>{course.instructor}</span>
                            </div>
                          )}
                          {course.participants && (
                            <div className="sports-activities-course-detail">
                              <FontAwesomeIcon icon={faUsers} />
                              <span>{course.participants} участници</span>
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => openEnrollModal(course)}
                          className="sports-activities-course-btn"
                        >
                          <FontAwesomeIcon icon={faBook} />
                          <span>Запиши се</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sports-activities-no-courses">
                  <FontAwesomeIcon icon={faBook} />
                  <h4>Няма активни курсове</h4>
                  <p>Следете за нови образователни програми</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="sports-activities-modal" onClick={() => setShowEnrollModal(false)}>
          <div className="sports-activities-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="sports-activities-modal-close" 
              onClick={() => setShowEnrollModal(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="sports-activities-modal-header">
              <FontAwesomeIcon icon={faUsers} />
              <h3>Запишете се за {selectedActivity?.name}</h3>
              <p>Попълнете формата за да се запишете за тази активност</p>
            </div>
            
            {enrollStatus === 'sent' ? (
              <div className="sports-activities-form-success">
                <FontAwesomeIcon icon={faCheckCircle} />
                <h4>Заявката е изпратена успешно!</h4>
                <p>Благодарим ви! Ще се свържем с вас за потвърждение на записването.</p>
              </div>
            ) : enrollStatus === 'error' ? (
              <div className="sports-activities-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>Възникна грешка</h4>
                <p>Моля опитайте отново или се свържете с нас директно.</p>
              </div>
            ) : (
              <form onSubmit={handleEnrollSubmit} className="sports-activities-form">
                {selectedActivity && (
                  <div className="sports-activities-selected-activity">
                    <h4>Избрана активност:</h4>
                    <div className="sports-activities-activity-summary">
                      <FontAwesomeIcon icon={getActivityIcon(selectedActivity.name)} />
                      <div>
                        <strong>{selectedActivity.name}</strong>
                        {selectedActivity.day && <span>{selectedActivity.day}</span>}
                        {selectedActivity.time && <span>{selectedActivity.time}</span>}
                        {selectedActivity.instructor && <span>Инструктор: {selectedActivity.instructor}</span>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="sports-activities-form-row">
                  <div className="sports-activities-form-group">
                    <label htmlFor="enroll-name">
                      <FontAwesomeIcon icon={faUser} />
                      Вашето име *
                    </label>
                    <input
                      type="text"
                      id="enroll-name"
                      value={enrollForm.name}
                      onChange={(e) => handleEnrollChange('name', e.target.value)}
                      required
                      placeholder="Въведете вашето име"
                    />
                  </div>
                  
                  <div className="sports-activities-form-group">
                    <label htmlFor="enroll-email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      Имейл адрес *
                    </label>
                    <input
                      type="email"
                      id="enroll-email"
                      value={enrollForm.email}
                      onChange={(e) => handleEnrollChange('email', e.target.value)}
                      required
                      placeholder="Въведете вашия имейл"
                    />
                  </div>
                </div>
                
                <div className="sports-activities-form-row">
                  <div className="sports-activities-form-group">
                    <label htmlFor="enroll-phone">
                      <FontAwesomeIcon icon={faMobile} />
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      id="enroll-phone"
                      value={enrollForm.phone}
                      onChange={(e) => handleEnrollChange('phone', e.target.value)}
                      required
                      placeholder="Въведете вашия телефон"
                    />
                  </div>
                  
                  <div className="sports-activities-form-group">
                    <label htmlFor="enroll-experience">
                      <FontAwesomeIcon icon={faTrophy} />
                      Опит в спорта
                    </label>
                    <select
                      id="enroll-experience"
                      value={enrollForm.experience}
                      onChange={(e) => handleEnrollChange('experience', e.target.value)}
                    >
                      <option value="">Изберете ниво</option>
                      <option value="Начинаещ">Начинаещ</option>
                      <option value="Средно ниво">Средно ниво</option>
                      <option value="Напреднал">Напреднал</option>
                      <option value="Експерт">Експерт</option>
                    </select>
                  </div>
                </div>
                
                <div className="sports-activities-form-group">
                  <label htmlFor="enroll-notes">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Допълнителни бележки
                  </label>
                  <textarea
                    id="enroll-notes"
                    value={enrollForm.notes}
                    onChange={(e) => handleEnrollChange('notes', e.target.value)}
                    placeholder="Споменете ако имате въпроси или специални изисквания"
                    rows="3"
                  />
                </div>
                
                <div className="sports-activities-form-actions">
                  <button 
                    type="submit" 
                    className="sports-activities-submit-btn"
                    disabled={enrollStatus === 'sending'}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {enrollStatus === 'sending' ? 'Изпраща се...' : 'Изпрати заявката'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowEnrollModal(false)}
                    className="sports-activities-cancel-btn"
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

export default SportsActivities;