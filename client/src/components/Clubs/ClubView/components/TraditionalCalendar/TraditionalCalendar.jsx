import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt,
  faCalendarDay,
  faChevronLeft,
  faChevronRight,
  faClock,
  faMapMarkerAlt,
  faUsers,
  faTicketAlt,
  faPlane,
  faGraduationCap,
  faMusic,
  faTheaterMasks,
  faTimes,
  faInfoCircle,
  faPhone,
  faEnvelope,
  faShare
} from '@fortawesome/free-solid-svg-icons';
import './traditionalCalendar.css';

export const TraditionalCalendar = ({ club }) => {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('month');

  if (!club?.name) {
    return null;
  }

  const events = club.activities?.events || [];
  const regularActivities = club.activities?.regular || [];
  const trips = club.activities?.trips || [];
  const courses = club.activities?.courses || [];

  const hasCalendarContent = 
    events.length > 0 ||
    regularActivities.length > 0 ||
    trips.length > 0 ||
    courses.length > 0;

  if (!hasCalendarContent) {
    return null;
  }

  const getLocalizedMonthNames = () => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2024, i, 1);
      return date.toLocaleDateString(getLocale(), { month: 'long' });
    });
  };

  const getLocalizedDayNames = () => {
    const locale = getLocale();
    if (i18n.language === 'bg') {
      return ['Нед', 'Пон', 'Вт', 'Ср', 'Чет', 'Пет', 'Съб'];
    }
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(2024, 0, i);
      return date.toLocaleDateString(locale, { weekday: 'short' });
    });
  };

  const getLocale = () => {
    return i18n.language === 'bg' ? 'bg-BG' : 
           i18n.language === 'de' ? 'de-DE' : 'en-US';
  };

  const getDayNameMapping = () => {
    return {
      'понеделник': 1, 'вторник': 2, 'сряда': 3, 'четвъртък': 4, 
      'петък': 5, 'събота': 6, 'неделя': 0
    };
  };

  const getEventTypeLabel = (type) => {
    return t(`clubs.TraditionalCalendar.eventTypes.${type}`, { defaultValue: type });
  };

  const calendarItems = useMemo(() => {
    const items = [];

    events.forEach(event => {
      items.push({
        id: `event-${event.id || Math.random()}`,
        title: event.title,
        date: new Date(event.date),
        time: event.time,
        type: 'event',
        category: event.type || 'general',
        description: event.description,
        participants: event.participants,
        recurring: false,
        details: event
      });
    });

    const dayNames = getDayNameMapping();

    regularActivities.forEach(activity => {
      const dayOfWeek = dayNames[activity.day?.toLowerCase()];
      if (dayOfWeek !== undefined) {
        const today = new Date();
        for (let week = 0; week < 12; week++) {
          const activityDate = new Date(today);
          activityDate.setDate(today.getDate() + (week * 7) + (dayOfWeek - today.getDay() + 7) % 7);
          
          items.push({
            id: `activity-${activity.name}-${week}`,
            title: activity.name,
            date: activityDate,
            time: activity.time,
            type: 'activity',
            category: 'regular',
            description: activity.description,
            participants: activity.participants,
            instructor: activity.instructor,
            recurring: true,
            details: activity
          });
        }
      }
    });

    trips.forEach(trip => {
      items.push({
        id: `trip-${Math.random()}`,
        title: t('clubs.TraditionalCalendar.tripTitle', { destination: trip.destination }),
        date: new Date(trip.date),
        time: '08:00',
        type: 'trip',
        category: 'travel',
        description: trip.description,
        participants: trip.participants,
        price: trip.price,
        destination: trip.destination,
        recurring: false,
        details: trip
      });
    });

    courses.forEach(course => {
      if (course.startDate) {
        items.push({
          id: `course-${Math.random()}`,
          title: course.name,
          date: new Date(course.startDate),
          time: course.time || '14:00',
          type: 'course',
          category: 'education',
          description: course.description,
          duration: course.duration,
          instructor: course.instructor,
          participants: course.participants,
          recurring: false,
          details: course
        });
      }
    });

    return items.sort((a, b) => a.date - b.date);
  }, [events, regularActivities, trips, courses, t]);

  const today = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = getLocalizedMonthNames();
  const dayNames = getLocalizedDayNames();

  const monthEvents = calendarItems.filter(item => {
    const itemDate = item.date;
    return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
  });

  const eventsByDate = monthEvents.reduce((acc, item) => {
    const dateKey = item.date.getDate();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const closeEventModal = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'event': return faCalendarDay;
      case 'activity': return faMusic;
      case 'trip': return faPlane;
      case 'course': return faGraduationCap;
      default: return faCalendarAlt;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'event': return '#3b82f6';
      case 'activity': return '#10b981';
      case 'trip': return '#f59e0b';
      case 'course': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString(getLocale(), { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleShare = (event) => {
    const text = t('clubs.TraditionalCalendar.shareText', {
      title: event.title,
      date: formatDate(event.date),
      time: event.time
    });
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: text,
        url: url
      });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      alert(t('clubs.TraditionalCalendar.messages.shareSuccess'));
    }
  };

  const handleReservation = (event) => {
    const subject = encodeURIComponent(t('clubs.TraditionalCalendar.reservation.subject', { title: event.title }));
    const body = encodeURIComponent(t('clubs.TraditionalCalendar.reservation.body', {
      title: event.title,
      date: formatDate(event.date),
      time: event.time
    }));
    
    const mailtoLink = `mailto:${club.contacts?.email}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };

  const upcomingEvents = calendarItems
    .filter(item => item.date >= today)
    .slice(0, 5);

  return (
    <section id="traditional-calendar" className="traditional-calendar-main-section">
      <div className="traditional-calendar-container">
        
        <div className="traditional-calendar-header">
          <div className="traditional-calendar-badge">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>{t('clubs.TraditionalCalendar.header.badge')}</span>
          </div>
          <h2 className="traditional-calendar-title">{t('clubs.TraditionalCalendar.header.title')}</h2>
          <p className="traditional-calendar-subtitle">
            {t('clubs.TraditionalCalendar.header.subtitle')}
          </p>
        </div>

        <div className="traditional-calendar-main-grid">
          
          <div className="traditional-calendar-section">
            <div className="traditional-calendar-controls">
              <div className="traditional-calendar-navigation">
                <button 
                  className="traditional-calendar-nav-btn"
                  onClick={() => navigateMonth(-1)}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <h3 className="traditional-calendar-month-title">
                  {monthNames[currentMonth]} {currentYear}
                </h3>
                <button 
                  className="traditional-calendar-nav-btn"
                  onClick={() => navigateMonth(1)}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
              <div className="traditional-calendar-actions">
                <button 
                  className="traditional-calendar-today-btn"
                  onClick={goToToday}
                >
                  {t('clubs.TraditionalCalendar.controls.today')}
                </button>
                <div className="traditional-calendar-view-modes">
                  <button 
                    className={`traditional-calendar-view-btn ${viewMode === 'month' ? 'active' : ''}`}
                    onClick={() => setViewMode('month')}
                  >
                    {t('clubs.TraditionalCalendar.controls.month')}
                  </button>
                  <button 
                    className={`traditional-calendar-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    {t('clubs.TraditionalCalendar.controls.list')}
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'month' && (
              <div className="traditional-calendar-grid">
                <div className="traditional-calendar-header-row">
                  {dayNames.map(day => (
                    <div key={day} className="traditional-calendar-day-header">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="traditional-calendar-days">
                  {Array.from({ length: firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 }).map((_, index) => (
                    <div key={`empty-${index}`} className="traditional-calendar-day empty" />
                  ))}
                  
                  {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const dayEvents = eventsByDate[day] || [];
                    const isToday = today.getDate() === day && 
                                   today.getMonth() === currentMonth && 
                                   today.getFullYear() === currentYear;
                    
                    return (
                      <div 
                        key={day} 
                        className={`traditional-calendar-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
                      >
                        <div className="traditional-calendar-day-number">{day}</div>
                        <div className="traditional-calendar-day-events">
                          {dayEvents.slice(0, 3).map((event, eventIndex) => (
                            <div 
                              key={eventIndex}
                              className="traditional-calendar-event-dot"
                              style={{ backgroundColor: getEventColor(event.type) }}
                              title={t('clubs.TraditionalCalendar.eventTooltip', { title: event.title, time: event.time })}
                              onClick={() => handleEventClick(event)}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="traditional-calendar-more-events">
                              +{dayEvents.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {viewMode === 'list' && (
              <div className="traditional-calendar-list">
                {monthEvents.length > 0 ? (
                  monthEvents.map((event, index) => (
                    <div 
                      key={index} 
                      className="traditional-calendar-list-item"
                      onClick={() => handleEventClick(event)}
                    >
                      <div 
                        className="traditional-calendar-list-marker"
                        style={{ backgroundColor: getEventColor(event.type) }}
                      >
                        <FontAwesomeIcon icon={getEventIcon(event.type)} />
                      </div>
                      <div className="traditional-calendar-list-content">
                        <h4>{event.title}</h4>
                        <div className="traditional-calendar-list-date">
                          {t('clubs.TraditionalCalendar.eventDateTime', { date: formatDate(event.date), time: event.time })}
                        </div>
                        {event.description && (
                          <p>{event.description}</p>
                        )}
                        <div className="traditional-calendar-list-meta">
                          <span className="traditional-calendar-list-type">
                            {getEventTypeLabel(event.type)}
                          </span>
                          {event.participants && (
                            <span className="traditional-calendar-list-participants">
                              <FontAwesomeIcon icon={faUsers} />
                              {t('clubs.TraditionalCalendar.participantsCount', { count: event.participants })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="traditional-calendar-no-events">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <p>{t('clubs.TraditionalCalendar.noEvents')}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {upcomingEvents.length > 0 && (
            <div className="traditional-calendar-section">
              <div className="traditional-calendar-section-header">
                <FontAwesomeIcon icon={faCalendarDay} />
                <h3>{t('clubs.TraditionalCalendar.upcoming.title')}</h3>
                <p>{t('clubs.TraditionalCalendar.upcoming.subtitle')}</p>
              </div>
              
              <div className="traditional-calendar-upcoming">
                {upcomingEvents.map((event, index) => (
                  <div 
                    key={index} 
                    className="traditional-calendar-upcoming-item"
                    onClick={() => handleEventClick(event)}
                  >
                    <div 
                      className="traditional-calendar-upcoming-marker"
                      style={{ backgroundColor: getEventColor(event.type) }}
                    >
                      <FontAwesomeIcon icon={getEventIcon(event.type)} />
                    </div>
                    <div className="traditional-calendar-upcoming-content">
                      <h4>{event.title}</h4>
                      <div className="traditional-calendar-upcoming-date">
                        {formatDate(event.date)}
                      </div>
                      <div className="traditional-calendar-upcoming-time">
                        <FontAwesomeIcon icon={faClock} />
                        {event.time}
                      </div>
                      {event.recurring && (
                        <div className="traditional-calendar-recurring-badge">
                          {t('clubs.TraditionalCalendar.recurring')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="traditional-calendar-section">
            <div className="traditional-calendar-section-header">
              <FontAwesomeIcon icon={faInfoCircle} />
              <h3>{t('clubs.TraditionalCalendar.legend.title')}</h3>
              <p>{t('clubs.TraditionalCalendar.legend.subtitle')}</p>
            </div>
            
            <div className="traditional-calendar-legend">
              <div className="traditional-calendar-legend-item">
                <div 
                  className="traditional-calendar-legend-color"
                  style={{ backgroundColor: getEventColor('event') }}
                />
                <span>{t('clubs.TraditionalCalendar.legend.events')}</span>
              </div>
              <div className="traditional-calendar-legend-item">
                <div 
                  className="traditional-calendar-legend-color"
                  style={{ backgroundColor: getEventColor('activity') }}
                />
                <span>{t('clubs.TraditionalCalendar.legend.activities')}</span>
              </div>
              <div className="traditional-calendar-legend-item">
                <div 
                  className="traditional-calendar-legend-color"
                  style={{ backgroundColor: getEventColor('trip') }}
                />
                <span>{t('clubs.TraditionalCalendar.legend.trips')}</span>
              </div>
              <div className="traditional-calendar-legend-item">
                <div 
                  className="traditional-calendar-legend-color"
                  style={{ backgroundColor: getEventColor('course') }}
                />
                <span>{t('clubs.TraditionalCalendar.legend.courses')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEventModalOpen && selectedEvent && (
        <div className="traditional-calendar-event-modal">
          <div className="traditional-calendar-event-modal-overlay" onClick={closeEventModal}></div>
          <div className="traditional-calendar-event-modal-container">
            <button className="traditional-calendar-event-modal-close" onClick={closeEventModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="traditional-calendar-event-modal-header">
              <div 
                className="traditional-calendar-event-modal-icon"
                style={{ backgroundColor: getEventColor(selectedEvent.type) }}
              >
                <FontAwesomeIcon icon={getEventIcon(selectedEvent.type)} />
              </div>
              <div className="traditional-calendar-event-modal-title">
                <h3>{selectedEvent.title}</h3>
                <div className="traditional-calendar-event-modal-type">
                  {getEventTypeLabel(selectedEvent.type)}
                </div>
              </div>
            </div>
            
            <div className="traditional-calendar-event-modal-content">
              <div className="traditional-calendar-event-modal-details">
                <div className="traditional-calendar-event-modal-detail">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <span>{formatDate(selectedEvent.date)}</span>
                </div>
                <div className="traditional-calendar-event-modal-detail">
                  <FontAwesomeIcon icon={faClock} />
                  <span>{selectedEvent.time}</span>
                </div>
                {selectedEvent.participants && (
                  <div className="traditional-calendar-event-modal-detail">
                    <FontAwesomeIcon icon={faUsers} />
                    <span>{t('clubs.TraditionalCalendar.participantsCount', { count: selectedEvent.participants })}</span>
                  </div>
                )}
                {selectedEvent.instructor && (
                  <div className="traditional-calendar-event-modal-detail">
                    <FontAwesomeIcon icon={faTheaterMasks} />
                    <span>{t('clubs.TraditionalCalendar.eventModal.instructor')}: {selectedEvent.instructor}</span>
                  </div>
                )}
                {selectedEvent.destination && (
                  <div className="traditional-calendar-event-modal-detail">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span>{t('clubs.TraditionalCalendar.eventModal.destination')}: {selectedEvent.destination}</span>
                  </div>
                )}
                {selectedEvent.price && (
                  <div className="traditional-calendar-event-modal-detail">
                    <FontAwesomeIcon icon={faTicketAlt} />
                    <span>{t('clubs.TraditionalCalendar.eventModal.price')}: {selectedEvent.price} {t('clubs.TraditionalCalendar.currency')}</span>
                  </div>
                )}
                {selectedEvent.duration && (
                  <div className="traditional-calendar-event-modal-detail">
                    <FontAwesomeIcon icon={faClock} />
                    <span>{t('clubs.TraditionalCalendar.eventModal.duration')}: {selectedEvent.duration}</span>
                  </div>
                )}
              </div>
              
              {selectedEvent.description && (
                <div className="traditional-calendar-event-modal-description">
                  <h4>{t('clubs.TraditionalCalendar.eventModal.description')}</h4>
                  <p>{selectedEvent.description}</p>
                </div>
              )}
              
              <div className="traditional-calendar-event-modal-actions">
                {selectedEvent.type !== 'activity' && (
                  <button 
                    className="traditional-calendar-modal-btn primary"
                    onClick={() => handleReservation(selectedEvent)}
                  >
                    <FontAwesomeIcon icon={faTicketAlt} />
                    {t('clubs.TraditionalCalendar.eventModal.register')}
                  </button>
                )}
                <button 
                  className="traditional-calendar-modal-btn secondary"
                  onClick={() => handleShare(selectedEvent)}
                >
                  <FontAwesomeIcon icon={faShare} />
                  {t('clubs.TraditionalCalendar.eventModal.share')}
                </button>
                {club.contacts?.phone && (
                  <button 
                    className="traditional-calendar-modal-btn secondary"
                    onClick={() => window.open(`tel:${club.contacts.phone}`)}
                  >
                    <FontAwesomeIcon icon={faPhone} />
                    {t('clubs.TraditionalCalendar.eventModal.call')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TraditionalCalendar;