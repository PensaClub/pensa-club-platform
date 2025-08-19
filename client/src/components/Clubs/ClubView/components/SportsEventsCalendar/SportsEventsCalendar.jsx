import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt,
  faChevronLeft,
  faChevronRight,
  faClock,
  faUser,
  faUsers,
  faTicketAlt,
  faMusic,
  faTheaterMasks,
  faHeartbeat,
  faGraduationCap,
  faDumbbell,
  faRunning,
  faSwimmer,
  faMountain,
  faMedkit,
  faCheckCircle,
  faExclamationTriangle,
  faPaperPlane,
  faEnvelope,
  faMobile,
  faTimes,
  faPlus,
  faInfoCircle,
  faStar,
  faFlag,
  faCircle,
  faCalendarWeek,
  faCalendarDay,
  faFilter,
  faSearch,
  faBookmark,
  faHeart,
  faShare,
  faDownload,
  faBell,
  faEye,
  faArrowRight,
  faMapMarkerAlt,
  faBolt,
  faFire,
  faGem,
  faCrown,
  faRocket
} from '@fortawesome/free-solid-svg-icons';
import './sportsEventsCalendar.css';

export const SportsEventsCalendar = ({ club }) => {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('timeline');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [favoriteEvents, setFavoriteEvents] = useState(new Set());
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [registerStatus, setRegisterStatus] = useState(null);

  if (!club?.activities && !club?.pensionersSpecific) {
    return null;
  }

  const activities = club.activities || {};
  const regularActivities = activities.regular || [];
  const events = activities.events || [];
  const trips = activities.trips || [];
  const courses = activities.courses || [];
  const pensionersSpecific = club.pensionersSpecific || {};
  const healthLectures = pensionersSpecific.healthServices?.healthLectures || [];
  const contacts = club.contacts || {};

  const getWeekDays = () => {
    return t('clubs.SportsEventsCalendar.weekDaysShort', { returnObjects: true });
  };

  const getMonthNames = () => {
    return t('clubs.SportsEventsCalendar.monthNames', { returnObjects: true });
  };

  const getDayMapping = () => {
    return t('clubs.SportsEventsCalendar.dayMapping', { returnObjects: true });
  };

  const weekDays = getWeekDays();
  const monthNames = getMonthNames();
  const dayMapping = getDayMapping();

  const getEventFilters = () => [
    { key: 'all', label: t('clubs.SportsEventsCalendar.filters.all'), icon: faRocket, color: '#7c3aed', gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
    { key: 'sports', label: t('clubs.SportsEventsCalendar.filters.sports'), icon: faRunning, color: '#dc2626', gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
    { key: 'cultural', label: t('clubs.SportsEventsCalendar.filters.cultural'), icon: faTheaterMasks, color: '#9333ea', gradient: 'linear-gradient(135deg, #9333ea, #a855f7)' },
    { key: 'health', label: t('clubs.SportsEventsCalendar.filters.health'), icon: faHeartbeat, color: '#059669', gradient: 'linear-gradient(135deg, #059669, #10b981)' },
    { key: 'education', label: t('clubs.SportsEventsCalendar.filters.education'), icon: faGraduationCap, color: '#ea580c', gradient: 'linear-gradient(135deg, #ea580c, #f97316)' },
    { key: 'trips', label: t('clubs.SportsEventsCalendar.filters.trips'), icon: faMountain, color: '#0284c7', gradient: 'linear-gradient(135deg, #0284c7, #0ea5e9)' }
  ];

  const eventFilters = getEventFilters();

  const getEventCategory = (activityName, activityType = '') => {
    const name = activityName.toLowerCase();
    const categoryTerms = t('clubs.SportsEventsCalendar.categoryTerms', { returnObjects: true });
    
    for (const [categoryKey, terms] of Object.entries(categoryTerms)) {
      if (terms.some(term => name.includes(term))) {
        return categoryKey;
      }
    }
    return 'cultural';
  };

  const getEventPriority = (activityName) => {
    const name = activityName.toLowerCase();
    const priorityTerms = t('clubs.SportsEventsCalendar.priorityTerms', { returnObjects: true });
    
    if (priorityTerms.high.some(term => name.includes(term))) return 'high';
    if (priorityTerms.medium.some(term => name.includes(term))) return 'medium';
    return 'normal';
  };

  const getEventIcon = (category, activityName = '') => {
    const name = activityName.toLowerCase();
    const iconTerms = t('clubs.SportsEventsCalendar.iconTerms', { returnObjects: true });
    
    for (const [iconKey, terms] of Object.entries(iconTerms)) {
      if (terms.some(term => name.includes(term))) {
        const iconMap = {
          yoga: faGem,
          swimming: faSwimmer,
          gymnastics: faDumbbell,
          choir: faMusic,
          dance: faFire,
          trip: faMountain
        };
        if (iconMap[iconKey]) return iconMap[iconKey];
      }
    }
    
    const categoryIconMap = {
      sports: faRunning,
      cultural: faTheaterMasks,
      health: faHeartbeat,
      education: faGraduationCap,
      trips: faMountain
    };
    
    return categoryIconMap[category] || faCalendarAlt;
  };

  const getEventGradient = (category) => {
    const filter = eventFilters.find(f => f.key === category);
    return filter ? filter.gradient : 'linear-gradient(135deg, #6b7280, #9ca3af)';
  };

  const formatDate = (date, options = {}) => {
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'de' ? 'de-DE' : 'en-US';
    return date.toLocaleDateString(locale, options);
  };

  const formatFullDate = (date) => {
    return formatDate(date, { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const allEvents = useMemo(() => {
    const events = [];
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    regularActivities.forEach(activity => {
      const dayKey = activity.day?.toLowerCase();
      
      if (dayKey === t('clubs.SportsEventsCalendar.everyDay').toLowerCase()) {
        for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
          events.push({
            id: `regular-${activity.name}-${d.toISOString().split('T')[0]}`,
            title: activity.name,
            date: new Date(d),
            time: activity.time,
            type: 'regular',
            category: getEventCategory(activity.name),
            priority: 'normal',
            instructor: activity.instructor,
            participants: activity.participants,
            description: activity.description,
            icon: getEventIcon(getEventCategory(activity.name), activity.name),
            gradient: getEventGradient(getEventCategory(activity.name)),
            isRecurring: true
          });
        }
      } else {
        const dayIndex = dayMapping[dayKey];
        if (dayIndex !== undefined) {
          for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (d.getDay() === dayIndex) {
              events.push({
                id: `regular-${activity.name}-${d.toISOString().split('T')[0]}`,
                title: activity.name,
                date: new Date(d),
                time: activity.time,
                type: 'regular',
                category: getEventCategory(activity.name),
                priority: 'normal',
                instructor: activity.instructor,
                participants: activity.participants,
                description: activity.description,
                icon: getEventIcon(getEventCategory(activity.name), activity.name),
                gradient: getEventGradient(getEventCategory(activity.name)),
                isRecurring: true
              });
            }
          }
        }
      }
    });

    activities.events?.forEach(event => {
      const eventDate = new Date(event.date);
      if (eventDate > today) {
        events.push({
          id: `event-${event.id || event.title}`,
          title: event.title,
          date: eventDate,
          time: event.time,
          type: 'special',
          category: getEventCategory(event.title, event.type),
          priority: getEventPriority(event.title),
          participants: event.participants,
          description: event.description,
          icon: getEventIcon(getEventCategory(event.title, event.type), event.title),
          gradient: getEventGradient(getEventCategory(event.title, event.type)),
          isRecurring: false,
          isSpecial: true
        });
      }
    });

    trips.forEach(trip => {
      const tripDate = new Date(trip.date);
      if (tripDate > today) {
        events.push({
          id: `trip-${trip.destination}`,
          title: t('clubs.SportsEventsCalendar.tripTitle', { destination: trip.destination }),
          date: tripDate,
          type: 'trip',
          category: 'trips',
          priority: 'high',
          participants: trip.participants,
          price: trip.price,
          description: trip.description,
          icon: faMountain,
          gradient: getEventGradient('trips'),
          isRecurring: false,
          isSpecial: true
        });
      }
    });

    courses.forEach(course => {
      const courseStart = new Date(today);
      courseStart.setDate(courseStart.getDate() + 7);
      
      events.push({
        id: `course-${course.name}`,
        title: course.name,
        date: courseStart,
        type: 'course',
        category: 'education',
        priority: 'medium',
        instructor: course.instructor,
        participants: course.participants,
        description: course.description,
        duration: course.duration,
        icon: getEventIcon('education', course.name),
        gradient: getEventGradient('education'),
        isRecurring: false
      });
    });

    healthLectures.forEach(lecture => {
      const lectureDate = lecture.nextDate ? new Date(lecture.nextDate) : new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);
      
      if (lectureDate > today) {
        events.push({
          id: `health-${lecture.topic}`,
          title: lecture.topic,
          date: lectureDate,
          type: 'health',
          category: 'health',
          priority: 'medium',
          instructor: lecture.lecturer,
          duration: lecture.duration,
          description: t('clubs.SportsEventsCalendar.healthLectureDescription', { topic: lecture.topic }),
          icon: faMedkit,
          gradient: getEventGradient('health'),
          isRecurring: false
        });
      }
    });

    return events.sort((a, b) => a.date - b.date);
  }, [regularActivities, activities.events, trips, courses, healthLectures, t, dayMapping]);

  const filteredEvents = allEvents.filter(event => {
    const matchesFilter = activeFilter === 'all' || event.category === activeFilter;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const eventsByDay = useMemo(() => {
    const grouped = {};
    filteredEvents.forEach(event => {
      const dateKey = event.date.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [filteredEvents]);

  const nextWeekDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const eventsForDay = filteredEvents.filter(event => 
        event.date.toDateString() === date.toDateString()
      );
      days.push({
        date,
        events: eventsForDay,
        isToday: i === 0
      });
    }
    return days;
  }, [filteredEvents]);

  const toggleFavorite = (eventId) => {
    const newFavorites = new Set(favoriteEvents);
    if (newFavorites.has(eventId)) {
      newFavorites.delete(eventId);
    } else {
      newFavorites.add(eventId);
    }
    setFavoriteEvents(newFavorites);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleRegisterChange = (field, value) => {
    setRegisterForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegisterStatus('sending');

    if (contacts.email && selectedEvent) {
      const subject = encodeURIComponent(t('clubs.SportsEventsCalendar.registerEmail.subject', { 
        eventTitle: selectedEvent.title 
      }));
      const body = encodeURIComponent(t('clubs.SportsEventsCalendar.registerEmail.body', {
        eventTitle: selectedEvent.title,
        date: formatDate(selectedEvent.date),
        time: selectedEvent.time || '',
        instructor: selectedEvent.instructor || '',
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone,
        notes: registerForm.notes || t('clubs.SportsEventsCalendar.registerEmail.noNotes'),
        clubName: club.name
      }));
      
      try {
        window.location.href = `mailto:${contacts.email}?subject=${subject}&body=${body}`;
        setRegisterStatus('sent');
        setTimeout(() => {
          setShowRegisterModal(false);
          setRegisterStatus(null);
          setSelectedEvent(null);
          setRegisterForm({ name: '', email: '', phone: '', notes: '' });
        }, 2000);
      } catch (error) {
        setRegisterStatus('error');
      }
    } else {
      setRegisterStatus('error');
    }
  };

  const openRegisterModal = (event) => {
    setSelectedEvent(event);
    setShowRegisterModal(true);
  };

  if (allEvents.length === 0) {
    return null;
  }

  return (
    <section id="sports-events-calendar" className="sports-events-calendar-section">
      <div className="sports-events-calendar-container">
        
        <div className="sports-events-calendar-hero">
          <div className="sports-events-calendar-hero-content">
            <div className="sports-events-calendar-hero-badge">
              <FontAwesomeIcon icon={faBolt} />
              <span>{t('clubs.SportsEventsCalendar.header.badge')}</span>
            </div>
            <h2 className="sports-events-calendar-hero-title">
              {t('clubs.SportsEventsCalendar.header.title')}
            </h2>
            <p className="sports-events-calendar-hero-subtitle">
              {t('clubs.SportsEventsCalendar.header.subtitle')}
            </p>
          </div>
          
          <div className="sports-events-calendar-hero-stats">
            <div className="sports-events-calendar-stat-card">
              <div className="sports-events-calendar-stat-icon">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <div className="sports-events-calendar-stat-content">
                <span className="sports-events-calendar-stat-number">{allEvents.length}</span>
                <span className="sports-events-calendar-stat-label">{t('clubs.SportsEventsCalendar.stats.plannedEvents')}</span>
              </div>
            </div>
            <div className="sports-events-calendar-stat-card">
              <div className="sports-events-calendar-stat-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className="sports-events-calendar-stat-content">
                <span className="sports-events-calendar-stat-number">{regularActivities.length}</span>
                <span className="sports-events-calendar-stat-label">{t('clubs.SportsEventsCalendar.stats.regularActivities')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sports-events-calendar-controls">
          <div className="sports-events-calendar-search">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder={t('clubs.SportsEventsCalendar.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="sports-events-calendar-view-modes">
            <button
              onClick={() => setViewMode('timeline')}
              className={`sports-events-calendar-view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={faCalendarWeek} />
              <span>{t('clubs.SportsEventsCalendar.viewModes.timeline')}</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`sports-events-calendar-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>{t('clubs.SportsEventsCalendar.viewModes.grid')}</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`sports-events-calendar-view-btn ${viewMode === 'list' ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={faCalendarDay} />
              <span>{t('clubs.SportsEventsCalendar.viewModes.list')}</span>
            </button>
          </div>
        </div>

        <div className="sports-events-calendar-filters">
          {eventFilters.map(filter => {
            const count = filter.key === 'all' ? allEvents.length : 
                         allEvents.filter(e => e.category === filter.key).length;
            
            return count > 0 && (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`sports-events-calendar-filter-chip ${activeFilter === filter.key ? 'active' : ''}`}
                style={{ '--filter-gradient': filter.gradient }}
              >
                <FontAwesomeIcon icon={filter.icon} />
                <span>{filter.label}</span>
                <span className="sports-events-calendar-filter-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="sports-events-calendar-content">
          
          {viewMode === 'timeline' && (
            <div className="sports-events-calendar-timeline">
              <div className="sports-events-calendar-timeline-header">
                <h3>{t('clubs.SportsEventsCalendar.timeline.title')}</h3>
                <p>{t('clubs.SportsEventsCalendar.timeline.subtitle')}</p>
              </div>
              
              <div className="sports-events-calendar-timeline-days">
                {nextWeekDays.map((day, dayIndex) => (
                  <div 
                    key={dayIndex}
                    className={`sports-events-calendar-timeline-day ${day.isToday ? 'today' : ''}`}
                  >
                    <div className="sports-events-calendar-timeline-day-header">
                      <div className="sports-events-calendar-timeline-date">
                        <span className="sports-events-calendar-timeline-weekday">
                          {weekDays[day.date.getDay()]}
                        </span>
                        <span className="sports-events-calendar-timeline-day-number">
                          {day.date.getDate()}
                        </span>
                        <span className="sports-events-calendar-timeline-month">
                          {monthNames[day.date.getMonth()].substring(0, 3)}
                        </span>
                      </div>
                      {day.isToday && (
                        <div className="sports-events-calendar-today-badge">
                          <FontAwesomeIcon icon={faBolt} />
                          <span>{t('clubs.SportsEventsCalendar.timeline.today')}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="sports-events-calendar-timeline-events">
                      {day.events.length > 0 ? (
                        day.events.slice(0, 3).map((event, eventIndex) => (
                          <div 
                            key={event.id}
                            className="sports-events-calendar-timeline-event"
                            style={{ '--event-gradient': event.gradient }}
                          >
                            <div className="sports-events-calendar-event-header">
                              <div className="sports-events-calendar-event-icon">
                                <FontAwesomeIcon icon={event.icon} />
                              </div>
                              <div className="sports-events-calendar-event-badges">
                                {event.isSpecial && (
                                  <span className="sports-events-calendar-event-badge special">
                                    <FontAwesomeIcon icon={faStar} />
                                  </span>
                                )}
                                {event.priority === 'high' && (
                                  <span className="sports-events-calendar-event-badge priority">
                                    <FontAwesomeIcon icon={faCrown} />
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="sports-events-calendar-event-content">
                              <h4>{event.title}</h4>
                              {event.time && (
                                <div className="sports-events-calendar-event-time">
                                  <FontAwesomeIcon icon={faClock} />
                                  <span>{event.time}</span>
                                </div>
                              )}
                              {event.instructor && (
                                <div className="sports-events-calendar-event-instructor">
                                  <FontAwesomeIcon icon={faUser} />
                                  <span>{event.instructor}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="sports-events-calendar-event-actions">
                              <button
                                onClick={() => toggleFavorite(event.id)}
                                className={`sports-events-calendar-event-action ${favoriteEvents.has(event.id) ? 'active' : ''}`}
                              >
                                <FontAwesomeIcon icon={faHeart} />
                              </button>
                              <button
                                onClick={() => openRegisterModal(event)}
                                className="sports-events-calendar-event-action register"
                              >
                                <FontAwesomeIcon icon={faPlus} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="sports-events-calendar-no-events">
                          <FontAwesomeIcon icon={faCalendarDay} />
                          <span>{t('clubs.SportsEventsCalendar.timeline.noEvents')}</span>
                        </div>
                      )}
                      
                      {day.events.length > 3 && (
                        <button className="sports-events-calendar-show-more">
                          <FontAwesomeIcon icon={faArrowRight} />
                          <span>{t('clubs.SportsEventsCalendar.timeline.showMore', { count: day.events.length - 3 })}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="sports-events-calendar-grid">
              <div className="sports-events-calendar-grid-header">
                <h3>{t('clubs.SportsEventsCalendar.grid.title')}</h3>
                <div className="sports-events-calendar-navigation">
                  <button onClick={() => navigateMonth(-1)}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                  <button onClick={() => navigateMonth(1)}>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              </div>
              
              <div className="sports-events-calendar-grid-content">
                <p>{t('clubs.SportsEventsCalendar.grid.inDevelopment')}</p>
              </div>
            </div>
          )}

          {viewMode === 'list' && (
            <div className="sports-events-calendar-list">
              <div className="sports-events-calendar-list-header">
                <h3>{t('clubs.SportsEventsCalendar.list.title')}</h3>
                <p>{t('clubs.SportsEventsCalendar.list.subtitle')}</p>
              </div>
              
              <div className="sports-events-calendar-list-content">
                {Object.entries(eventsByDay).slice(0, 10).map(([dateKey, dayEvents]) => (
                  <div key={dateKey} className="sports-events-calendar-list-day">
                    <div className="sports-events-calendar-list-day-header">
                      <div className="sports-events-calendar-list-date">
                        {formatFullDate(new Date(dateKey))}
                      </div>
                      <span className="sports-events-calendar-list-count">
                        {dayEvents.length} {dayEvents.length === 1 ? 
                          t('clubs.SportsEventsCalendar.list.eventSingle') : 
                          t('clubs.SportsEventsCalendar.list.eventPlural')}
                      </span>
                    </div>
                    
                    <div className="sports-events-calendar-list-events">
                      {dayEvents.map(event => (
                        <div 
                          key={event.id}
                          className="sports-events-calendar-list-event"
                          style={{ '--event-gradient': event.gradient }}
                        >
                          <div className="sports-events-calendar-list-event-content">
                            <div className="sports-events-calendar-list-event-header">
                              <div className="sports-events-calendar-list-event-icon">
                                <FontAwesomeIcon icon={event.icon} />
                              </div>
                              <div className="sports-events-calendar-list-event-info">
                                <h4>{event.title}</h4>
                                <div className="sports-events-calendar-list-event-meta">
                                  {event.time && (
                                    <span>
                                      <FontAwesomeIcon icon={faClock} />
                                      {event.time}
                                    </span>
                                  )}
                                  {event.instructor && (
                                    <span>
                                      <FontAwesomeIcon icon={faUser} />
                                      {event.instructor}
                                    </span>
                                  )}
                                  {event.participants && (
                                    <span>
                                      <FontAwesomeIcon icon={faUsers} />
                                      {t('clubs.SportsEventsCalendar.list.participants', { count: event.participants })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {event.description && (
                              <p className="sports-events-calendar-list-event-description">
                                {event.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="sports-events-calendar-list-event-actions">
                            <button
                              onClick={() => toggleFavorite(event.id)}
                              className={`sports-events-calendar-action-btn ${favoriteEvents.has(event.id) ? 'active' : ''}`}
                            >
                              <FontAwesomeIcon icon={faHeart} />
                            </button>
                            <button
                              onClick={() => openRegisterModal(event)}
                              className="sports-events-calendar-action-btn primary"
                            >
                              <FontAwesomeIcon icon={faPlus} />
                              <span>{t('clubs.SportsEventsCalendar.actions.register')}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showRegisterModal && (
        <div className="sports-events-calendar-modal-overlay" onClick={() => setShowRegisterModal(false)}>
          <div className="sports-events-calendar-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="sports-events-calendar-modal-close" 
              onClick={() => setShowRegisterModal(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="sports-events-calendar-modal-header">
              <div className="sports-events-calendar-modal-icon">
                <FontAwesomeIcon icon={selectedEvent?.icon || faCalendarAlt} />
              </div>
              <h3>{t('clubs.SportsEventsCalendar.modal.registerFor')}</h3>
              <h2>{selectedEvent?.title}</h2>
              {selectedEvent?.date && (
                <p>{formatFullDate(selectedEvent.date)}</p>
              )}
            </div>
            
            {registerStatus === 'sent' ? (
              <div className="sports-events-calendar-form-success">
                <FontAwesomeIcon icon={faCheckCircle} />
                <h4>{t('clubs.SportsEventsCalendar.modal.success.title')}</h4>
                <p>{t('clubs.SportsEventsCalendar.modal.success.message')}</p>
              </div>
            ) : registerStatus === 'error' ? (
              <div className="sports-events-calendar-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>{t('clubs.SportsEventsCalendar.modal.error.title')}</h4>
                <p>{t('clubs.SportsEventsCalendar.modal.error.message')}</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="sports-events-calendar-form">
                <div className="sports-events-calendar-form-group">
                  <label>
                    <FontAwesomeIcon icon={faUser} />
                    {t('clubs.SportsEventsCalendar.modal.form.name')} *
                  </label>
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => handleRegisterChange('name', e.target.value)}
                    required
                    placeholder={t('clubs.SportsEventsCalendar.modal.form.namePlaceholder')}
                  />
                </div>
                
                <div className="sports-events-calendar-form-row">
                  <div className="sports-events-calendar-form-group">
                    <label>
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.SportsEventsCalendar.modal.form.email')} *
                    </label>
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => handleRegisterChange('email', e.target.value)}
                      required
                      placeholder={t('clubs.SportsEventsCalendar.modal.form.emailPlaceholder')}
                    />
                  </div>
                  
                  <div className="sports-events-calendar-form-group">
                    <label>
                      <FontAwesomeIcon icon={faMobile} />
                      {t('clubs.SportsEventsCalendar.modal.form.phone')} *
                    </label>
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) => handleRegisterChange('phone', e.target.value)}
                      required
                      placeholder={t('clubs.SportsEventsCalendar.modal.form.phonePlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="sports-events-calendar-form-group">
                  <label>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    {t('clubs.SportsEventsCalendar.modal.form.notes')}
                  </label>
                  <textarea
                    value={registerForm.notes}
                    onChange={(e) => handleRegisterChange('notes', e.target.value)}
                    placeholder={t('clubs.SportsEventsCalendar.modal.form.notesPlaceholder')}
                    rows="3"
                  />
                </div>
                
                <div className="sports-events-calendar-form-actions">
                  <button 
                    type="submit" 
                    className="sports-events-calendar-btn-primary"
                    disabled={registerStatus === 'sending'}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {registerStatus === 'sending' ? 
                      t('clubs.SportsEventsCalendar.modal.form.sending') : 
                      t('clubs.SportsEventsCalendar.modal.form.submit')}
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

export default SportsEventsCalendar;