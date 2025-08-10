import { useState, useMemo } from 'react';
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'list'

  // Проверяваме дали има необходимите данни
  if (!club?.name) {
    return null;
  }

  // Извличаме САМО реални данни от клуба
  const events = club.activities?.events || [];
  const regularActivities = club.activities?.regular || [];
  const trips = club.activities?.trips || [];
  const courses = club.activities?.courses || [];

  // Проверяваме дали има РЕАЛНО съдържание за показване
  const hasCalendarContent = 
    events.length > 0 ||
    regularActivities.length > 0 ||
    trips.length > 0 ||
    courses.length > 0;

  if (!hasCalendarContent) {
    return null;
  }

  // Подготвяме всички календарни елементи
  const calendarItems = useMemo(() => {
    const items = [];

    // Добавяме еднократни събития
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

    // Добавяме редовни дейности (генерираме дати за следващите 3 месеца)
    const dayNames = {
      'понеделник': 1, 'вторник': 2, 'сряда': 3, 'четвъртък': 4, 
      'петък': 5, 'събота': 6, 'неделя': 0
    };

    regularActivities.forEach(activity => {
      const dayOfWeek = dayNames[activity.day?.toLowerCase()];
      if (dayOfWeek !== undefined) {
        // Генерираме дати за следващите 12 седмици
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

    // Добавяме екскурзии
    trips.forEach(trip => {
      items.push({
        id: `trip-${Math.random()}`,
        title: `Екскурзия до ${trip.destination}`,
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

    // Добавяме курсове (ако имат дати)
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
  }, [events, regularActivities, trips, courses]);

  // Календарни функции
  const today = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
    'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
  ];

  const dayNames = ['Нед', 'Пон', 'Вт', 'Ср', 'Чет', 'Пет', 'Съб'];

  // Филтрираме събития за текущия месец
  const monthEvents = calendarItems.filter(item => {
    const itemDate = item.date;
    return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
  });

  // Групираме събития по дата
  const eventsByDate = monthEvents.reduce((acc, item) => {
    const dateKey = item.date.getDate();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  // Навигация
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Event handlers
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
    return date.toLocaleDateString('bg-BG', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleShare = (event) => {
    const text = `${event.title} - ${formatDate(event.date)} в ${event.time}`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: text,
        url: url
      });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      alert('Информацията е копирана в клипборда!');
    }
  };

  const handleReservation = (event) => {
    const subject = encodeURIComponent(`Записване за ${event.title}`);
    const body = encodeURIComponent(`
Здравейте,

Бих искал/а да се запиша за "${event.title}" на ${formatDate(event.date)} в ${event.time}.

Моля потвърдете записването ми.

С уважение
    `);
    
    const mailtoLink = `mailto:${club.contacts?.email}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };

  // Upcoming events (следващи 5 събития)
  const upcomingEvents = calendarItems
    .filter(item => item.date >= today)
    .slice(0, 5);

  return (
    <section id="traditional-calendar" className="traditional-calendar-main-section">
      <div className="traditional-calendar-container">
        
        {/* Header */}
        <div className="traditional-calendar-header">
          <div className="traditional-calendar-badge">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>Календар с дейности</span>
          </div>
          <h2 className="traditional-calendar-title">Нашата програма</h2>
          <p className="traditional-calendar-subtitle">
            Следете всички предстоящи събития и редовни дейности
          </p>
        </div>

        <div className="traditional-calendar-main-grid">
          
          {/* Calendar Controls */}
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
                  Днес
                </button>
                <div className="traditional-calendar-view-modes">
                  <button 
                    className={`traditional-calendar-view-btn ${viewMode === 'month' ? 'active' : ''}`}
                    onClick={() => setViewMode('month')}
                  >
                    Месец
                  </button>
                  <button 
                    className={`traditional-calendar-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    Списък
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid View */}
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
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 }).map((_, index) => (
                    <div key={`empty-${index}`} className="traditional-calendar-day empty" />
                  ))}
                  
                  {/* Days of the month */}
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
                              title={`${event.title} в ${event.time}`}
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

            {/* List View */}
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
                          {formatDate(event.date)} в {event.time}
                        </div>
                        {event.description && (
                          <p>{event.description}</p>
                        )}
                        <div className="traditional-calendar-list-meta">
                          <span className="traditional-calendar-list-type">
                            {event.type === 'event' ? 'Събитие' :
                             event.type === 'activity' ? 'Дейност' :
                             event.type === 'trip' ? 'Екскурзия' :
                             event.type === 'course' ? 'Курс' : event.type}
                          </span>
                          {event.participants && (
                            <span className="traditional-calendar-list-participants">
                              <FontAwesomeIcon icon={faUsers} />
                              {event.participants} участници
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="traditional-calendar-no-events">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <p>Няма събития за този месец</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upcoming Events - показва се САМО ако има предстоящи събития */}
          {upcomingEvents.length > 0 && (
            <div className="traditional-calendar-section">
              <div className="traditional-calendar-section-header">
                <FontAwesomeIcon icon={faCalendarDay} />
                <h3>Предстоящи събития</h3>
                <p>Най-близките дейности и мероприятия</p>
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
                          Редовна дейност
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="traditional-calendar-section">
            <div className="traditional-calendar-section-header">
              <FontAwesomeIcon icon={faInfoCircle} />
              <h3>Легенда</h3>
              <p>Видове дейности в календара</p>
            </div>
            
            <div className="traditional-calendar-legend">
              <div className="traditional-calendar-legend-item">
                <div 
                  className="traditional-calendar-legend-color"
                  style={{ backgroundColor: getEventColor('event') }}
                />
                <span>Специални събития</span>
              </div>
              <div className="traditional-calendar-legend-item">
                <div 
                  className="traditional-calendar-legend-color"
                  style={{ backgroundColor: getEventColor('activity') }}
                />
                <span>Редовни дейности</span>
              </div>
              <div className="traditional-calendar-legend-item">
                <div 
                  className="traditional-calendar-legend-color"
                  style={{ backgroundColor: getEventColor('trip') }}
                />
                <span>Екскурзии</span>
              </div>
              <div className="traditional-calendar-legend-item">
                <div 
                  className="traditional-calendar-legend-color"
                  style={{ backgroundColor: getEventColor('course') }}
                />
                <span>Курсове</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EVENT DETAILS MODAL */}
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
                  {selectedEvent.type === 'event' ? 'Събитие' :
                   selectedEvent.type === 'activity' ? 'Редовна дейност' :
                   selectedEvent.type === 'trip' ? 'Екскурзия' :
                   selectedEvent.type === 'course' ? 'Курс' : selectedEvent.type}
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
                    <span>{selectedEvent.participants} участници</span>
                  </div>
                )}
                {selectedEvent.instructor && (
                  <div className="traditional-calendar-event-modal-detail">
                    <FontAwesomeIcon icon={faTheaterMasks} />
                    <span>Ръководител: {selectedEvent.instructor}</span>
                  </div>
                )}
                {selectedEvent.destination && (
                  <div className="traditional-calendar-event-modal-detail">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span>Дестинация: {selectedEvent.destination}</span>
                  </div>
                )}
                {selectedEvent.price && (
                  <div className="traditional-calendar-event-modal-detail">
                    <FontAwesomeIcon icon={faTicketAlt} />
                    <span>Цена: {selectedEvent.price} лв.</span>
                  </div>
                )}
                {selectedEvent.duration && (
                  <div className="traditional-calendar-event-modal-detail">
                    <FontAwesomeIcon icon={faClock} />
                    <span>Продължителност: {selectedEvent.duration}</span>
                  </div>
                )}
              </div>
              
              {selectedEvent.description && (
                <div className="traditional-calendar-event-modal-description">
                  <h4>Описание</h4>
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
                    Запишете се
                  </button>
                )}
                <button 
                  className="traditional-calendar-modal-btn secondary"
                  onClick={() => handleShare(selectedEvent)}
                >
                  <FontAwesomeIcon icon={faShare} />
                  Споделете
                </button>
                {club.contacts?.phone && (
                  <button 
                    className="traditional-calendar-modal-btn secondary"
                    onClick={() => window.open(`tel:${club.contacts.phone}`)}
                  >
                    <FontAwesomeIcon icon={faPhone} />
                    Обадете се
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