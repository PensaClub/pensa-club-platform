import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faClock, 
  faUsers,
  faMapMarkerAlt,
  faTicketAlt,
  faEye,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import './clubEvents.css';

export const ClubEvents = ({ club }) => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = [
      'яну', 'фев', 'мар', 'апр', 'май', 'юни',
      'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'
    ];
    
    return {
      day: date.getDate(),
      month: months[date.getMonth()],
      year: date.getFullYear(),
      fullDate: date.toLocaleDateString('bg-BG')
    };
  };

  const getEventTypeLabel = (type) => {
    const types = {
      'cultural': 'Културно',
      'social': 'Социално', 
      'traditional': 'Традиционно',
      'sports': 'Спортно',
      'educational': 'Образователно',
      'health': 'Здравословно'
    };
    return types[type] || 'Събитие';
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  const upcomingEvents = club.activities.events ? 
    club.activities.events.filter(event => isUpcoming(event.date)) : [];
  
  const pastEvents = club.activities.events ? 
    club.activities.events.filter(event => !isUpcoming(event.date)) : [];

  const renderEventCard = (event, isPast = false) => {
    const dateInfo = formatDate(event.date);
    
    return (
      <div key={event.id} className={`event-card ${isPast ? 'past-event' : ''}`}>
        <div className="event-date-badge">
          <div className="date-day">{dateInfo.day}</div>
          <div className="date-month">{dateInfo.month}</div>
        </div>

        <div className="event-content">
          <div className="event-header">
            <h3 className="event-title">{event.title}</h3>
            <span className={`event-type-badge ${event.type}`}>
              {getEventTypeLabel(event.type)}
            </span>
          </div>

          <p className="event-description">{event.description}</p>

          <div className="event-details">
            <div className="event-detail">
              <FontAwesomeIcon icon={faClock} />
              <span>{event.time}</span>
            </div>
            
            <div className="event-detail">
              <FontAwesomeIcon icon={faUsers} />
              <span>{event.participants} участници</span>
            </div>

            {event.location && (
              <div className="event-detail">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>{event.location}</span>
              </div>
            )}

            {event.price && (
              <div className="event-detail">
                <FontAwesomeIcon icon={faTicketAlt} />
                <span>{event.price} лв.</span>
              </div>
            )}
          </div>

          <div className="event-footer">
            <div className="event-date-full">{dateInfo.fullDate}</div>
            {!isPast && (
              <button className="event-action-btn">
                <FontAwesomeIcon icon={faEye} />
                Подробности
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!club.activities.events || club.activities.events.length === 0) {
    return (
      <section id="club-events" className="club-events">
        <div className="events-container">
          <h2>Събития и мероприятия</h2>
          <div className="no-events">
            <FontAwesomeIcon icon={faCalendarAlt} className="no-events-icon" />
            <p>Все още няма планирани събития</p>
            <span>Следете за нови обяви скоро!</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="club-events" className="club-events">
      <div className="events-container">
        <div className="events-header">
          <h2>Събития и мероприятия</h2>
          <p className="events-subtitle">
            Открийте интересни събития и дейности в нашия клуб
          </p>
        </div>

        {/* Табове */}
        <div className="events-tabs">
          <button 
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Предстоящи ({upcomingEvents.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Минали ({pastEvents.length})
          </button>
        </div>

        {/* Съдържание на табовете */}
        <div className="events-content">
          {activeTab === 'upcoming' && (
            <div className="events-grid">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => renderEventCard(event))
              ) : (
                <div className="no-events-tab">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <p>Няма предстоящи събития</p>
                  <span>Проверете отново скоро</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'past' && (
            <div className="events-grid">
              {pastEvents.length > 0 ? (
                pastEvents.map(event => renderEventCard(event, true))
              ) : (
                <div className="no-events-tab">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <p>Няма минали събития</p>
                  <span>Историята на събитията започва тук</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Екскурзии и пътувания */}
        {club.activities.trips && club.activities.trips.length > 0 && (
          <div className="trips-section">
            <h3>Предстоящи екскурзии</h3>
            <div className="trips-grid">
              {club.activities.trips.map((trip, index) => (
                <div key={index} className="trip-card">
                  <div className="trip-header">
                    <h4 className="trip-destination">{trip.destination}</h4>
                    <div className="trip-price">{trip.price} лв.</div>
                  </div>
                  
                  <p className="trip-description">{trip.description}</p>
                  
                  <div className="trip-details">
                    <div className="trip-detail">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>{formatDate(trip.date).fullDate}</span>
                    </div>
                    <div className="trip-detail">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{trip.participants} записани</span>
                    </div>
                  </div>

                  <button className="trip-action-btn">
                    Запиши се
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Курсове */}
        {club.activities.courses && club.activities.courses.length > 0 && (
          <div className="courses-section">
            <h3>Активни курсове</h3>
            <div className="courses-grid">
              {club.activities.courses.map((course, index) => (
                <div key={index} className="course-card">
                  <h4 className="course-name">{course.name}</h4>
                  <p className="course-description">{course.description}</p>
                  
                  <div className="course-details">
                    <div className="course-detail">
                      <FontAwesomeIcon icon={faClock} />
                      <span>{course.duration}</span>
                    </div>
                    <div className="course-detail">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{course.participants} участници</span>
                    </div>
                    {course.instructor && (
                      <div className="course-detail">
                        <FontAwesomeIcon icon={faUsers} />
                        <span>Инструктор: {course.instructor}</span>
                      </div>
                    )}
                  </div>

                  <button className="course-action-btn">
                    Научи повече
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ClubEvents;