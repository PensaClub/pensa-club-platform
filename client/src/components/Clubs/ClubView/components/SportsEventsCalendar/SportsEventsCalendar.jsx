// components/SportsEventsCalendar/SportsEventsCalendar.jsx
import { useState, useMemo } from 'react';
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline', 'grid', 'list'
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

  // Проверяваме дали има данни
  if (!club?.activities && !club?.pensionersSpecific) {
    return null;
  }

  // Събираме данни
  const activities = club.activities || {};
  const regularActivities = activities.regular || [];
  const events = activities.events || [];
  const trips = activities.trips || [];
  const courses = activities.courses || [];
  const pensionersSpecific = club.pensionersSpecific || {};
  const healthLectures = pensionersSpecific.healthServices?.healthLectures || [];
  const contacts = club.contacts || {};

  // Дни от седмицата
  const weekDays = ['Нед', 'Пон', 'Вто', 'Сря', 'Чет', 'Пет', 'Съб'];
  const monthNames = [
    'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
    'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
  ];

  // Мапинг на дни на български към индекси
  const dayMapping = {
    'неделя': 0,
    'понеделник': 1,
    'вторник': 2,
    'сряда': 3,
    'четвъртък': 4,
    'петък': 5,
    'събота': 6
  };

  // Филтри за събития
  const eventFilters = [
    { key: 'all', label: 'Всички', icon: faRocket, color: '#7c3aed', gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
    { key: 'sports', label: 'Спорт', icon: faRunning, color: '#dc2626', gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
    { key: 'cultural', label: 'Култура', icon: faTheaterMasks, color: '#9333ea', gradient: 'linear-gradient(135deg, #9333ea, #a855f7)' },
    { key: 'health', label: 'Здраве', icon: faHeartbeat, color: '#059669', gradient: 'linear-gradient(135deg, #059669, #10b981)' },
    { key: 'education', label: 'Образование', icon: faGraduationCap, color: '#ea580c', gradient: 'linear-gradient(135deg, #ea580c, #f97316)' },
    { key: 'trips', label: 'Екскурзии', icon: faMountain, color: '#0284c7', gradient: 'linear-gradient(135deg, #0284c7, #0ea5e9)' }
  ];

  // Helper функции
  function getEventCategory(activityName, activityType = '') {
    const name = activityName.toLowerCase();
    const type = activityType.toLowerCase();
    
    if (name.includes('спорт') || name.includes('гимнастика') || name.includes('йога') || name.includes('фитнес') || name.includes('бягане') || name.includes('плуване') || name.includes('тренировка')) {
      return 'sports';
    }
    if (name.includes('хор') || name.includes('танц') || name.includes('музика') || name.includes('концерт') || name.includes('представление')) {
      return 'cultural';
    }
    if (name.includes('здрав') || name.includes('лекция') || name.includes('медицин') || name.includes('преглед')) {
      return 'health';
    }
    if (name.includes('курс') || name.includes('обучение') || name.includes('компютър') || name.includes('образован')) {
      return 'education';
    }
    if (name.includes('екскурзия') || name.includes('пътуване') || name.includes('поход')) {
      return 'trips';
    }
    return 'cultural';
  }

  function getEventPriority(activityName) {
    const name = activityName.toLowerCase();
    if (name.includes('специал') || name.includes('турнир') || name.includes('състезание')) return 'high';
    if (name.includes('курс') || name.includes('лекция') || name.includes('екскурзия')) return 'medium';
    return 'normal';
  }

  function getEventIcon(category, activityName = '') {
    const name = activityName.toLowerCase();
    
    if (name.includes('йога')) return faGem;
    if (name.includes('плуване')) return faSwimmer;
    if (name.includes('гимнастика')) return faDumbbell;
    if (name.includes('хор')) return faMusic;
    if (name.includes('танц')) return faFire;
    if (name.includes('екскурзия')) return faMountain;
    
    switch(category) {
      case 'sports': return faRunning;
      case 'cultural': return faTheaterMasks;
      case 'health': return faHeartbeat;
      case 'education': return faGraduationCap;
      case 'trips': return faMountain;
      default: return faCalendarAlt;
    }
  }

  function getEventGradient(category) {
    const filter = eventFilters.find(f => f.key === category);
    return filter ? filter.gradient : 'linear-gradient(135deg, #6b7280, #9ca3af)';
  }

  // Генерираме всички събития за следващите 30 дни
  const allEvents = useMemo(() => {
    const events = [];
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 дни напред

    // Редовни дейности - генерираме за следващите 30 дни
    regularActivities.forEach(activity => {
      const dayKey = activity.day?.toLowerCase();
      
      if (dayKey === 'всеки ден') {
        // Всеки ден
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

    // Специални събития (само бъдещи)
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

    // Екскурзии
    trips.forEach(trip => {
      const tripDate = new Date(trip.date);
      if (tripDate > today) {
        events.push({
          id: `trip-${trip.destination}`,
          title: `Екскурзия: ${trip.destination}`,
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

    // Курсове
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

    // Здравни лекции
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
          description: `Здравна лекция: ${lecture.topic}`,
          icon: faMedkit,
          gradient: getEventGradient('health'),
          isRecurring: false
        });
      }
    });

    return events.sort((a, b) => a.date - b.date);
  }, [regularActivities, activities.events, trips, courses, healthLectures]);

  // Филтрираме събитията
  const filteredEvents = allEvents.filter(event => {
    const matchesFilter = activeFilter === 'all' || event.category === activeFilter;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Групираме по дни за timeline изгледа
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

  // Следващите 7 дни
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

  // Handlers
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
      const subject = encodeURIComponent(`Заявка за записване - ${selectedEvent.title}`);
      const body = encodeURIComponent(`
Здравейте,

Получихте нова заявка за записване:

ДЕЙНОСТ: ${selectedEvent.title}
Дата: ${selectedEvent.date.toLocaleDateString('bg-BG')}
${selectedEvent.time ? `Час: ${selectedEvent.time}` : ''}
${selectedEvent.instructor ? `Инструктор: ${selectedEvent.instructor}` : ''}

ДАННИ НА УЧАСТНИКА:
Име: ${registerForm.name}
Имейл: ${registerForm.email}
Телефон: ${registerForm.phone}
Бележки: ${registerForm.notes || 'Няма'}

---
Изпратено от сайта на ${club.name}
      `);
      
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

  // Ако няма събития, не показваме компонента
  if (allEvents.length === 0) {
    return null;
  }

  return (
    <section id="sports-events-calendar" className="sports-events-calendar-section">
      <div className="sports-events-calendar-container">
        
        {/* Hero Header */}
        <div className="sports-events-calendar-hero">
          <div className="sports-events-calendar-hero-content">
            <div className="sports-events-calendar-hero-badge">
              <FontAwesomeIcon icon={faBolt} />
              <span>Динамичен календар</span>
            </div>
            <h2 className="sports-events-calendar-hero-title">
              Никога не пропускайте важно събитие
            </h2>
            <p className="sports-events-calendar-hero-subtitle">
              Интерактивен календар с всички дейности, събития и възможности за записване
            </p>
          </div>
          
          <div className="sports-events-calendar-hero-stats">
            <div className="sports-events-calendar-stat-card">
              <div className="sports-events-calendar-stat-icon">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <div className="sports-events-calendar-stat-content">
                <span className="sports-events-calendar-stat-number">{allEvents.length}</span>
                <span className="sports-events-calendar-stat-label">Планирани събития</span>
              </div>
            </div>
            <div className="sports-events-calendar-stat-card">
              <div className="sports-events-calendar-stat-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className="sports-events-calendar-stat-content">
                <span className="sports-events-calendar-stat-number">{regularActivities.length}</span>
                <span className="sports-events-calendar-stat-label">Редовни дейности</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="sports-events-calendar-controls">
          <div className="sports-events-calendar-search">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Търсете дейност, инструктор..."
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
              <span>Таймлайн</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`sports-events-calendar-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>Календар</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`sports-events-calendar-view-btn ${viewMode === 'list' ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={faCalendarDay} />
              <span>Списък</span>
            </button>
          </div>
        </div>

        {/* Filters */}
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

        {/* Content */}
        <div className="sports-events-calendar-content">
          
          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <div className="sports-events-calendar-timeline">
              <div className="sports-events-calendar-timeline-header">
                <h3>Следващите 7 дни</h3>
                <p>Преглед на предстоящите дейности</p>
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
                          <span>Днес</span>
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
                          <span>Няма планирани дейности</span>
                        </div>
                      )}
                      
                      {day.events.length > 3 && (
                        <button className="sports-events-calendar-show-more">
                          <FontAwesomeIcon icon={faArrowRight} />
                          <span>+{day.events.length - 3} още</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="sports-events-calendar-grid">
              <div className="sports-events-calendar-grid-header">
                <h3>Месечен календар</h3>
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
                {/* Календарен грид код тук */}
                <p>Календарен изглед в разработка...</p>
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="sports-events-calendar-list">
              <div className="sports-events-calendar-list-header">
                <h3>Всички събития</h3>
                <p>Хронологичен списък с всички планирани дейности</p>
              </div>
              
              <div className="sports-events-calendar-list-content">
                {Object.entries(eventsByDay).slice(0, 10).map(([dateKey, dayEvents]) => (
                  <div key={dateKey} className="sports-events-calendar-list-day">
                    <div className="sports-events-calendar-list-day-header">
                      <div className="sports-events-calendar-list-date">
                        {new Date(dateKey).toLocaleDateString('bg-BG', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </div>
                      <span className="sports-events-calendar-list-count">
                        {dayEvents.length} {dayEvents.length === 1 ? 'събитие' : 'събития'}
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
                                      {event.participants} места
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
                              <span>Запиши се</span>
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

      {/* Register Modal */}
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
              <h3>Запишете се за</h3>
              <h2>{selectedEvent?.title}</h2>
              {selectedEvent?.date && (
                <p>{selectedEvent.date.toLocaleDateString('bg-BG', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}</p>
              )}
            </div>
            
            {registerStatus === 'sent' ? (
              <div className="sports-events-calendar-form-success">
                <FontAwesomeIcon icon={faCheckCircle} />
                <h4>Заявката е изпратена!</h4>
                <p>Ще се свържем с вас за потвърждение</p>
              </div>
            ) : registerStatus === 'error' ? (
              <div className="sports-events-calendar-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>Възникна грешка</h4>
                <p>Моля опитайте отново</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="sports-events-calendar-form">
                <div className="sports-events-calendar-form-group">
                  <label>
                    <FontAwesomeIcon icon={faUser} />
                    Име *
                  </label>
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => handleRegisterChange('name', e.target.value)}
                    required
                    placeholder="Вашето име"
                  />
                </div>
                
                <div className="sports-events-calendar-form-row">
                  <div className="sports-events-calendar-form-group">
                    <label>
                      <FontAwesomeIcon icon={faEnvelope} />
                      Имейл *
                    </label>
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => handleRegisterChange('email', e.target.value)}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div className="sports-events-calendar-form-group">
                    <label>
                      <FontAwesomeIcon icon={faMobile} />
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) => handleRegisterChange('phone', e.target.value)}
                      required
                      placeholder="0888 123 456"
                    />
                  </div>
                </div>
                
                <div className="sports-events-calendar-form-group">
                  <label>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Бележки
                  </label>
                  <textarea
                    value={registerForm.notes}
                    onChange={(e) => handleRegisterChange('notes', e.target.value)}
                    placeholder="Въпроси или специални изисквания..."
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
                    {registerStatus === 'sending' ? 'Изпраща се...' : 'Изпрати заявката'}
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