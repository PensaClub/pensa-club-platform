import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation('clubs');
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

  if (!club?.activities?.regular?.length && 
      !club?.activities?.events?.length && 
      !club?.activities?.trips?.length && 
      !club?.activities?.courses?.length) {
    return null;
  }

  const activities = club.activities || {};
  const regularActivities = activities.regular || [];
  const events = activities.events || [];
  const trips = activities.trips || [];
  const courses = activities.courses || [];
  const contacts = club.contacts || {};
  const pensionersSpecific = club.pensionersSpecific || {};
  const lowImpactActivities = pensionersSpecific.ageSpecificNeeds?.lowImpactActivities || [];

  if (regularActivities.length === 0 && events.length === 0 && trips.length === 0 && courses.length === 0) {
    return null;
  }

  const getWeekDays = () => [
    { key: 'sunday', label: t('clubs.SportsActivities.weekDays.sunday'), short: t('clubs.SportsActivities.weekDaysShort.sunday') },
    { key: 'monday', label: t('clubs.SportsActivities.weekDays.monday'), short: t('clubs.SportsActivities.weekDaysShort.monday') },
    { key: 'tuesday', label: t('clubs.SportsActivities.weekDays.tuesday'), short: t('clubs.SportsActivities.weekDaysShort.tuesday') },
    { key: 'wednesday', label: t('clubs.SportsActivities.weekDays.wednesday'), short: t('clubs.SportsActivities.weekDaysShort.wednesday') },
    { key: 'thursday', label: t('clubs.SportsActivities.weekDays.thursday'), short: t('clubs.SportsActivities.weekDaysShort.thursday') },
    { key: 'friday', label: t('clubs.SportsActivities.weekDays.friday'), short: t('clubs.SportsActivities.weekDaysShort.friday') },
    { key: 'saturday', label: t('clubs.SportsActivities.weekDays.saturday'), short: t('clubs.SportsActivities.weekDaysShort.saturday') }
  ];

  const weekDays = getWeekDays();

  const getDayMapping = () => {
    const mapping = {};
    const dayMappings = t('clubs.SportsActivities.dayMappings', { returnObjects: true });
    
    Object.keys(dayMappings).forEach(localDay => {
      mapping[localDay.toLowerCase()] = dayMappings[localDay];
    });
    
    return mapping;
  };

  const dayMapping = getDayMapping();
  const getActivityIcon = (activityName) => {
    const name = activityName.toLowerCase();
    const iconTerms = t('clubs.SportsActivities.activityIconTerms', { returnObjects: true });
    
    for (const [iconKey, terms] of Object.entries(iconTerms)) {
      if (terms.some(term => name.includes(term))) {
        const iconMap = {
          yoga: faLeaf,
          cardio: faSwimmer,
          strength: faDumbbell,
          running: faRunning,
          dance: faFire,
          gymnastics: faHeartbeat,
          mountain: faMountain
        };
        return iconMap[iconKey] || faUsers;
      }
    }
    return faUsers;
  };
  const activitiesByDay = useMemo(() => {
    const grouped = {};
    weekDays.forEach(day => {
      grouped[day.key] = [];
    });

    regularActivities.forEach(activity => {
      const dayKey = dayMapping[activity.day?.toLowerCase()];
      if (dayKey === 'daily') {
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
  }, [regularActivities, dayMapping, weekDays]);



  const getActivityColor = (activityName) => {
    const name = activityName.toLowerCase();
    const colorTerms = t('clubs.SportsActivities.activityColorTerms', { returnObjects: true });
    
    for (const [colorKey, terms] of Object.entries(colorTerms)) {
      if (terms.some(term => name.includes(term))) {
        const colorMap = {
          yoga: '#22c55e',
          cardio: '#06b6d4',
          strength: '#f97316',
          running: '#ef4444',
          dance: '#8b5cf6',
          gymnastics: '#ec4899'
        };
        return colorMap[colorKey] || '#6b7280';
      }
    }
    return '#6b7280';
  };

  const getIntensityLevel = (activityName) => {
    const name = activityName.toLowerCase();
    const intensityTerms = t('clubs.SportsActivities.intensityTerms', { returnObjects: true });
    
    if (intensityTerms.low.some(term => name.includes(term))) return 'low';
    if (intensityTerms.high.some(term => name.includes(term))) return 'high';
    return 'medium';
  };

  const getIntensityLabel = (level) => {
    return t(`clubs.SportsActivities.intensityLabels.${level}`);
  };

  const getIntensityColor = (level) => {
    const colorMap = {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#ef4444'
    };
    return colorMap[level] || '#6b7280';
  };

  const getExperienceLevels = () => [
    { value: '', label: t('clubs.SportsActivities.experienceLevels.select') },
    { value: 'Начинаещ', label: t('clubs.SportsActivities.experienceLevels.beginner') },
    { value: 'Средно ниво', label: t('clubs.SportsActivities.experienceLevels.intermediate') },
    { value: 'Напреднал', label: t('clubs.SportsActivities.experienceLevels.advanced') },
    { value: 'Експерт', label: t('clubs.SportsActivities.experienceLevels.expert') }
  ];

  const experienceLevels = getExperienceLevels();

  const filteredRegularActivities = regularActivities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const activityIntensity = getIntensityLevel(activity.name);
    const matchesIntensity = intensityFilter === 'all' || activityIntensity === intensityFilter;
    
    return matchesSearch && matchesIntensity;
  });

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
      const subject = encodeURIComponent(t('clubs.SportsActivities.enrollEmail.subject', { 
        activityName: selectedActivity.name 
      }));
      const body = encodeURIComponent(t('clubs.SportsActivities.enrollEmail.body', {
        activityName: selectedActivity.name,
        day: selectedActivity.day || '',
        time: selectedActivity.time || '',
        instructor: selectedActivity.instructor || '',
        name: enrollForm.name,
        email: enrollForm.email,
        phone: enrollForm.phone,
        experience: enrollForm.experience || t('clubs.SportsActivities.enrollEmail.noExperience'),
        notes: enrollForm.notes || t('clubs.SportsActivities.enrollEmail.noNotes'),
        clubName: club.name
      }));
      
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'de' ? 'de-DE' : 'en-US';
    
    return date.toLocaleDateString(locale);
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'de' ? 'de-DE' : 'en-US';
    
    return date.toLocaleDateString(locale, { month: 'short' });
  };

  return (
    <section id="sports-activities" className="sports-activities-section">
      <div className="sports-activities-container">
        
        <div className="sports-activities-header">
          <div className="sports-activities-badge">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>{t('clubs.SportsActivities.header.badge')}</span>
          </div>
          <h2 className="sports-activities-title">
            {t('clubs.SportsActivities.header.title')}
          </h2>
          <p className="sports-activities-subtitle">
            {t('clubs.SportsActivities.header.subtitle')}
          </p>
        </div>

        <div className="sports-activities-nav">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`sports-activities-nav-btn ${activeTab === 'weekly' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>{t('clubs.SportsActivities.tabs.weekly')}</span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`sports-activities-nav-btn ${activeTab === 'all' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faDumbbell} />
            <span>{t('clubs.SportsActivities.tabs.all')}</span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`sports-activities-nav-btn ${activeTab === 'events' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faTrophy} />
            <span>{t('clubs.SportsActivities.tabs.events')}</span>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`sports-activities-nav-btn ${activeTab === 'courses' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faGraduationCap} />
            <span>{t('clubs.SportsActivities.tabs.courses')}</span>
          </button>
        </div>

        <div className="sports-activities-content">
          
          {activeTab === 'weekly' && (
            <div className="sports-activities-weekly">
              <div className="sports-activities-week-header">
                <h3>{t('clubs.SportsActivities.weekly.title')}</h3>
                <p>{t('clubs.SportsActivities.weekly.subtitle')}</p>
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
                          <span>{activity.time || t('clubs.SportsActivities.weekly.flexibleTime')}</span>
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
                            <span>{t('clubs.SportsActivities.actions.enroll')}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="sports-activities-no-activities">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <h5>{t('clubs.SportsActivities.weekly.noActivities')}</h5>
                    <p>{t('clubs.SportsActivities.weekly.noActivitiesDescription')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'all' && (
            <div className="sports-activities-all">
              <div className="sports-activities-filters">
                <div className="sports-activities-search">
                  <FontAwesomeIcon icon={faSearch} />
                  <input
                    type="text"
                    placeholder={t('clubs.SportsActivities.all.searchPlaceholder')}
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
                    <option value="all">{t('clubs.SportsActivities.all.filters.allLevels')}</option>
                    <option value="low">{t('clubs.SportsActivities.all.filters.lowIntensity')}</option>
                    <option value="medium">{t('clubs.SportsActivities.all.filters.mediumIntensity')}</option>
                    <option value="high">{t('clubs.SportsActivities.all.filters.highIntensity')}</option>
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
                            <span>{t('clubs.SportsActivities.all.participants', { count: activity.participants })}</span>
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
                        <span>{t('clubs.SportsActivities.actions.enroll')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredRegularActivities.length === 0 && (
                <div className="sports-activities-no-results">
                  <FontAwesomeIcon icon={faSearch} />
                  <h4>{t('clubs.SportsActivities.all.noResults')}</h4>
                  <p>{t('clubs.SportsActivities.all.noResultsDescription')}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="sports-activities-events">
              <div className="sports-activities-events-header">
                <h3>{t('clubs.SportsActivities.events.title')}</h3>
                <p>{t('clubs.SportsActivities.events.subtitle')}</p>
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
                          {formatDateShort(event.date)}
                        </div>
                      </div>
                      <div className="sports-activities-event-content">
                        <div className="sports-activities-event-type">
                          <FontAwesomeIcon icon={faTrophy} />
                          <span>{event.type || t('clubs.SportsActivities.events.defaultType')}</span>
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
                              {t('clubs.SportsActivities.events.participants', { count: event.participants })}
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
                  <h4>{t('clubs.SportsActivities.events.noEvents')}</h4>
                  <p>{t('clubs.SportsActivities.events.noEventsDescription')}</p>
                </div>
              )}
              
              {trips.length > 0 && (
                <div className="sports-activities-trips">
                  <h4>
                    <FontAwesomeIcon icon={faMountain} />
                    {t('clubs.SportsActivities.events.sportsTrips')}
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
                              {formatDate(trip.date)}
                            </span>
                            <span>
                              <FontAwesomeIcon icon={faUsers} />
                              {t('clubs.SportsActivities.events.participants', { count: trip.participants })}
                            </span>
                            {trip.price && (
                              <span className="sports-activities-trip-price">
                                {trip.price} {t('clubs.SportsActivities.events.currency')}
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

          {activeTab === 'courses' && (
            <div className="sports-activities-courses">
              <div className="sports-activities-courses-header">
                <h3>{t('clubs.SportsActivities.courses.title')}</h3>
                <p>{t('clubs.SportsActivities.courses.subtitle')}</p>
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
                              <span>{t('clubs.SportsActivities.courses.participants', { count: course.participants })}</span>
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => openEnrollModal(course)}
                          className="sports-activities-course-btn"
                        >
                          <FontAwesomeIcon icon={faBook} />
                          <span>{t('clubs.SportsActivities.actions.enroll')}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sports-activities-no-courses">
                  <FontAwesomeIcon icon={faBook} />
                  <h4>{t('clubs.SportsActivities.courses.noCourses')}</h4>
                  <p>{t('clubs.SportsActivities.courses.noCoursesDescription')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
              <h3>{t('clubs.SportsActivities.enrollModal.title', { activityName: selectedActivity?.name })}</h3>
              <p>{t('clubs.SportsActivities.enrollModal.subtitle')}</p>
            </div>
            
            {enrollStatus === 'sent' ? (
              <div className="sports-activities-form-success">
                <FontAwesomeIcon icon={faCheckCircle} />
                <h4>{t('clubs.SportsActivities.enrollModal.success.title')}</h4>
                <p>{t('clubs.SportsActivities.enrollModal.success.message')}</p>
              </div>
            ) : enrollStatus === 'error' ? (
              <div className="sports-activities-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>{t('clubs.SportsActivities.enrollModal.error.title')}</h4>
                <p>{t('clubs.SportsActivities.enrollModal.error.message')}</p>
              </div>
            ) : (
              <form onSubmit={handleEnrollSubmit} className="sports-activities-form">
                {selectedActivity && (
                  <div className="sports-activities-selected-activity">
                    <h4>{t('clubs.SportsActivities.enrollModal.selectedActivity')}:</h4>
                    <div className="sports-activities-activity-summary">
                      <FontAwesomeIcon icon={getActivityIcon(selectedActivity.name)} />
                      <div>
                        <strong>{selectedActivity.name}</strong>
                        {selectedActivity.day && <span>{selectedActivity.day}</span>}
                        {selectedActivity.time && <span>{selectedActivity.time}</span>}
                        {selectedActivity.instructor && <span>{t('clubs.SportsActivities.enrollModal.instructor')}: {selectedActivity.instructor}</span>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="sports-activities-form-row">
                  <div className="sports-activities-form-group">
                    <label htmlFor="enroll-name">
                      <FontAwesomeIcon icon={faUser} />
                      {t('clubs.SportsActivities.enrollModal.form.name')} *
                    </label>
                    <input
                      type="text"
                      id="enroll-name"
                      value={enrollForm.name}
                      onChange={(e) => handleEnrollChange('name', e.target.value)}
                      required
                      placeholder={t('clubs.SportsActivities.enrollModal.form.namePlaceholder')}
                    />
                  </div>
                  
                  <div className="sports-activities-form-group">
                    <label htmlFor="enroll-email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.SportsActivities.enrollModal.form.email')} *
                    </label>
                    <input
                      type="email"
                      id="enroll-email"
                      value={enrollForm.email}
                      onChange={(e) => handleEnrollChange('email', e.target.value)}
                      required
                      placeholder={t('clubs.SportsActivities.enrollModal.form.emailPlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="sports-activities-form-row">
                  <div className="sports-activities-form-group">
                    <label htmlFor="enroll-phone">
                      <FontAwesomeIcon icon={faMobile} />
                      {t('clubs.SportsActivities.enrollModal.form.phone')} *
                    </label>
                    <input
                      type="tel"
                      id="enroll-phone"
                      value={enrollForm.phone}
                      onChange={(e) => handleEnrollChange('phone', e.target.value)}
                      required
                      placeholder={t('clubs.SportsActivities.enrollModal.form.phonePlaceholder')}
                    />
                  </div>
                  
                  <div className="sports-activities-form-group">
                    <label htmlFor="enroll-experience">
                      <FontAwesomeIcon icon={faTrophy} />
                      {t('clubs.SportsActivities.enrollModal.form.experience')}
                    </label>
                    <select
                      id="enroll-experience"
                      value={enrollForm.experience}
                      onChange={(e) => handleEnrollChange('experience', e.target.value)}
                    >
                      {experienceLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="sports-activities-form-group">
                  <label htmlFor="enroll-notes">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    {t('clubs.SportsActivities.enrollModal.form.notes')}
                  </label>
                  <textarea
                    id="enroll-notes"
                    value={enrollForm.notes}
                    onChange={(e) => handleEnrollChange('notes', e.target.value)}
                    placeholder={t('clubs.SportsActivities.enrollModal.form.notesPlaceholder')}
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
                    {enrollStatus === 'sending' ? 
                      t('clubs.SportsActivities.enrollModal.form.sending') : 
                      t('clubs.SportsActivities.enrollModal.form.submit')}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowEnrollModal(false)}
                    className="sports-activities-cancel-btn"
                  >
                    {t('clubs.SportsActivities.enrollModal.form.cancel')}
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