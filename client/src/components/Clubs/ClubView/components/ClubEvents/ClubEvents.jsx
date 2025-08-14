import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faClock, 
  faUsers,
  faMapMarkerAlt,
  faTicketAlt,
  faEye,
  faTimes,
  faUserPlus,
  faPhone,
  faEnvelope,
  faCheck,
  faExclamationTriangle,
  faImage,
  faVideo,
  faPlay,
  faInfoCircle,
  faStar,
  faHeart,
  faShare,
  faRoute,
  faGraduationCap,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import './clubEvents.css';

export const ClubEvents = ({ club }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [registrationForm, setRegistrationForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [formStatus, setFormStatus] = useState(null);

  // ПРОВЕРКА ЗА ДАННИ - ако няма събития, не показваме компонента
  const hasEvents = club?.activities?.events && club.activities.events.length > 0;
  const hasTrips = club?.activities?.trips && club.activities.trips.length > 0;
  const hasCourses = club?.activities?.courses && club.activities.courses.length > 0;

  if (!hasEvents && !hasTrips && !hasCourses) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return { day: '—', month: '—', year: '—', fullDate: 'Дата не е посочена' };
    
    const date = new Date(dateString);
    const months = [
      'ЯНУ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ЮНИ',
      'ЮЛИ', 'АВГ', 'СЕП', 'ОКТ', 'НОЕ', 'ДЕК'
    ];
    
    return {
      day: date.getDate(),
      month: months[date.getMonth()],
      year: date.getFullYear(),
      fullDate: date.toLocaleDateString('bg-BG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    };
  };

  const getEventTypeInfo = (type) => {
    const types = {
      'cultural': { label: 'Културно', color: '#8b5cf6', emoji: '🎭' },
      'social': { label: 'Социално', color: '#3b82f6', emoji: '🤝' }, 
      'traditional': { label: 'Традиционно', color: '#ef4444', emoji: '🎪' },
      'sports': { label: 'Спортно', color: '#10b981', emoji: '⚽' },
      'educational': { label: 'Образователно', color: '#f59e0b', emoji: '📚' },
      'health': { label: 'Здравословно', color: '#ec4899', emoji: '💊' }
    };
    return types[type] || { label: 'Събитие', color: '#6b7280', emoji: '📅' };
  };

  const isUpcoming = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) > new Date();
  };

  const events = hasEvents ? club.activities.events.filter(event => event && event.title) : [];
  const upcomingEvents = events.filter(event => isUpcoming(event.date));
  const pastEvents = events.filter(event => !isUpcoming(event.date));

  // Отваряне на модали
  const openEventModal = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const openTripModal = (trip) => {
    setSelectedTrip(trip);
    setShowTripModal(true);
    setFormStatus(null);
    setRegistrationForm({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      notes: ''
    });
  };

  const openCourseModal = (course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  const closeModals = () => {
    setShowEventModal(false);
    setShowTripModal(false);
    setShowCourseModal(false);
    setSelectedEvent(null);
    setSelectedTrip(null);
    setSelectedCourse(null);
    setFormStatus(null);
  };

  // Обработка на форма за записване
  const handleFormChange = (field, value) => {
    setRegistrationForm(prev => ({ ...prev, [field]: value }));
  };

  const handleTripRegistration = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    const recipientEmail = club.contacts?.email;
    
    if (recipientEmail) {
      const subject = encodeURIComponent(`Заявка за екскурзия - ${selectedTrip.destination}`);
      const body = encodeURIComponent(`
Заявка за записване в екскурзия

Име: ${registrationForm.firstName} ${registrationForm.lastName}
Телефон: ${registrationForm.phone}
Email: ${registrationForm.email}

Екскурзия: ${selectedTrip.destination}
Дата: ${formatDate(selectedTrip.date).fullDate}
Цена: ${selectedTrip.price} лв.

Допълнителни бележки: ${registrationForm.notes || 'Няма'}

---
Изпратено от ${club.name}
      `);

      try {
        window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
        setFormStatus('success');
        
        setTimeout(() => {
          closeModals();
        }, 2000);
      } catch (error) {
        setFormStatus('error');
        setTimeout(() => setFormStatus(null), 3000);
      }
    } else {
      setFormStatus('error');
      setTimeout(() => setFormStatus(null), 3000);
    }
  };

  const renderEventCard = (event, isPast = false) => {
    const dateInfo = formatDate(event.date);
    const typeInfo = getEventTypeInfo(event.type);
    
    return (
      <div key={event.id} className={`general-event-card ${isPast ? 'past' : ''}`}>
        <div className="general-event-image">
          {event.images && event.images.length > 0 ? (
            <img src={event.images[0].src} alt={event.title} />
          ) : (
            <div className="general-event-placeholder">
              <span className="general-event-emoji">{typeInfo.emoji}</span>
            </div>
          )}
          
          <div className="general-event-date-overlay">
            <div className="general-date-day">{dateInfo.day}</div>
            <div className="general-date-month">{dateInfo.month}</div>
          </div>

          {event.featured && (
            <div className="general-event-featured">
              <FontAwesomeIcon icon={faStar} />
            </div>
          )}
        </div>

        <div className="general-event-content">
          <div className="general-event-header">
            <span 
              className="general-event-type"
              style={{ backgroundColor: typeInfo.color }}
            >
              {typeInfo.label}
            </span>
            <div className="general-event-actions">
              <button className="general-action-icon" onClick={() => handleShare(event)}>
                <FontAwesomeIcon icon={faShare} />
              </button>
              <button className="general-action-icon">
                <FontAwesomeIcon icon={faHeart} />
              </button>
            </div>
          </div>

          <h3 className="general-event-title">{event.title}</h3>
          <p className="general-event-description">{event.description}</p>

          <div className="general-event-details">
            <div className="general-event-detail">
              <FontAwesomeIcon icon={faClock} />
              <span>{event.time || 'Час не е посочен'}</span>
            </div>
            
            <div className="general-event-detail">
              <FontAwesomeIcon icon={faUsers} />
              <span>{event.participants || 0} участници</span>
            </div>

            {event.location && (
              <div className="general-event-detail">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>{event.location}</span>
              </div>
            )}

            {event.price && (
              <div className="general-event-detail">
                <FontAwesomeIcon icon={faTicketAlt} />
                <span>{event.price}</span>
              </div>
            )}
          </div>

          <div className="general-event-footer">
            <span className="general-event-date">{dateInfo.fullDate}</span>
            {!isPast && (
              <button 
                className="general-event-btn"
                onClick={() => openEventModal(event)}
              >
                <FontAwesomeIcon icon={faEye} />
                Подробности
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleShare = (event) => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${event.title} - ${window.location.href}`);
      alert('Линкът е копиран в клипборда!');
    }
  };

  return (
    <section id="general-events" className="general-events-main">
      <div className="general-events-container">
        
        {/* Header */}
        <div className="general-events-header">
          <div className="general-events-badge">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>Събития и мероприятия</span>
          </div>
          <h2 className="general-events-title">Нашите събития</h2>
          <p className="general-events-subtitle">
            Открийте интересни събития, екскурзии и курсове в нашия клуб
          </p>
          
          {/* Stats */}
          <div className="general-events-stats">
            {hasEvents && (
              <div className="general-events-stat">
                <span>{events.length}</span>
                <label>събития</label>
              </div>
            )}
            {hasTrips && (
              <div className="general-events-stat">
                <span>{club.activities.trips.length}</span>
                <label>екскурзии</label>
              </div>
            )}
            {hasCourses && (
              <div className="general-events-stat">
                <span>{club.activities.courses.length}</span>
                <label>курсове</label>
              </div>
            )}
          </div>
        </div>

        {/* Events Section */}
        {hasEvents && (
          <div className="general-events-section">
            <div className="general-events-tabs">
              <button 
                className={`general-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Предстоящи ({upcomingEvents.length})
              </button>
              <button 
                className={`general-tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                onClick={() => setActiveTab('past')}
              >
                Минали ({pastEvents.length})
              </button>
            </div>

            <div className="general-events-content">
              {activeTab === 'upcoming' && (
                <div className="general-events-grid">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map(event => renderEventCard(event))
                  ) : (
                    <div className="general-no-content">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <h3>Няма предстоящи събития</h3>
                      <p>Проверете отново скоро за нови обяви</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'past' && (
                <div className="general-events-grid">
                  {pastEvents.length > 0 ? (
                    pastEvents.map(event => renderEventCard(event, true))
                  ) : (
                    <div className="general-no-content">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <h3>Няма минали събития</h3>
                      <p>Историята на събитията започва тук</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trips Section */}
        {hasTrips && (
          <div className="general-trips-section">
            <h3>
              <FontAwesomeIcon icon={faRoute} />
              Предстоящи екскурзии
            </h3>
            
            <div className="general-trips-grid">
              {club.activities.trips.map((trip, index) => (
                <div key={index} className="general-trip-card">
                  <div className="general-trip-header">
                    <h4 className="general-trip-destination">{trip.destination}</h4>
                    <div className="general-trip-price">{trip.price} лв.</div>
                  </div>
                  
                  <p className="general-trip-description">{trip.description}</p>
                  
                  <div className="general-trip-details">
                    <div className="general-trip-detail">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>{formatDate(trip.date).fullDate}</span>
                    </div>
                    <div className="general-trip-detail">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{trip.participants || 0} записани</span>
                    </div>
                  </div>

                  <button 
                    className="general-trip-btn"
                    onClick={() => openTripModal(trip)}
                  >
                    <FontAwesomeIcon icon={faUserPlus} />
                    Запиши се
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courses Section */}
        {hasCourses && (
          <div className="general-courses-section">
            <h3>
              <FontAwesomeIcon icon={faGraduationCap} />
              Активни курсове
            </h3>
            
            <div className="general-courses-grid">
              {club.activities.courses.map((course, index) => (
                <div key={index} className="general-course-card">
                  <div className="general-course-icon">
                    <FontAwesomeIcon icon={faGraduationCap} />
                  </div>
                  
                  <h4 className="general-course-name">{course.name}</h4>
                  <p className="general-course-description">{course.description}</p>
                  
                  <div className="general-course-details">
                    <div className="general-course-detail">
                      <FontAwesomeIcon icon={faClock} />
                      <span>{course.duration || 'Продължителност не е посочена'}</span>
                    </div>
                    <div className="general-course-detail">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{course.participants || 0} участници</span>
                    </div>
                    {course.instructor && (
                      <div className="general-course-detail">
                        <FontAwesomeIcon icon={faUsers} />
                        <span>{course.instructor}</span>
                      </div>
                    )}
                  </div>

                  <button 
                    className="general-course-btn"
                    onClick={() => openCourseModal(course)}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Научи повече
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="general-modal-overlay" onClick={closeModals}>
          <div className="general-modal" onClick={(e) => e.stopPropagation()}>
            <div className="general-modal-header">
              <h3>
                <FontAwesomeIcon icon={faEye} />
                Детайли за събитието
              </h3>
              <button className="general-modal-close" onClick={closeModals}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="general-modal-content">
              {selectedEvent.images && selectedEvent.images.length > 0 && (
                <div className="general-event-images">
                  <img src={selectedEvent.images[0].src} alt={selectedEvent.title} />
                </div>
              )}
              
              <h4>{selectedEvent.title}</h4>
              <p>{selectedEvent.description}</p>
              
              <div className="general-modal-details">
                <div className="general-modal-detail">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <span>{formatDate(selectedEvent.date).fullDate}</span>
                </div>
                <div className="general-modal-detail">
                  <FontAwesomeIcon icon={faClock} />
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="general-modal-detail">
                  <FontAwesomeIcon icon={faUsers} />
                  <span>{selectedEvent.participants} участници</span>
                </div>
                {selectedEvent.location && (
                  <div className="general-modal-detail">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                {selectedEvent.organizer && (
                  <div className="general-modal-detail">
                    <FontAwesomeIcon icon={faUsers} />
                    <span>Организатор: {selectedEvent.organizer}</span>
                  </div>
                )}
              </div>

              {selectedEvent.highlights && selectedEvent.highlights.length > 0 && (
                <div className="general-event-highlights">
                  <h5>Акценти</h5>
                  <ul>
                    {selectedEvent.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trip Registration Modal */}
      {showTripModal && selectedTrip && (
        <div className="general-modal-overlay" onClick={closeModals}>
          <div className="general-modal" onClick={(e) => e.stopPropagation()}>
            <div className="general-modal-header">
              <h3>
                <FontAwesomeIcon icon={faRoute} />
                Записване за екскурзия
              </h3>
              <button className="general-modal-close" onClick={closeModals}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="general-modal-content">
              <div className="general-selected-trip">
                <h4>{selectedTrip.destination}</h4>
                <p>{selectedTrip.description}</p>
                <div className="general-trip-info">
                  <span>📅 {formatDate(selectedTrip.date).fullDate}</span>
                  <span>💰 {selectedTrip.price} лв.</span>
                  <span>👥 {selectedTrip.participants} записани</span>
                </div>
              </div>

              <form onSubmit={handleTripRegistration} className="general-registration-form">
                <div className="general-form-row">
                  <div className="general-form-group">
                    <label>Име *</label>
                    <input
                      type="text"
                      value={registrationForm.firstName}
                      onChange={(e) => handleFormChange('firstName', e.target.value)}
                      placeholder="Вашето име"
                      required
                    />
                  </div>
                  
                  <div className="general-form-group">
                    <label>Фамилия *</label>
                    <input
                      type="text"
                      value={registrationForm.lastName}
                      onChange={(e) => handleFormChange('lastName', e.target.value)}
                      placeholder="Вашата фамилия"
                      required
                    />
                  </div>
                </div>
                
                <div className="general-form-row">
                  <div className="general-form-group">
                    <label>Телефон *</label>
                    <input
                      type="tel"
                      value={registrationForm.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder="0888 123 456"
                      required
                    />
                  </div>
                  
                  <div className="general-form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={registrationForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                
                <div className="general-form-group">
                  <label>Бележки</label>
                  <textarea
                    value={registrationForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="Допълнителни бележки или въпроси"
                    rows="3"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="general-submit-btn"
                  disabled={formStatus === 'sending'}
                >
                  {formStatus === 'sending' ? (
                    <>
                      <div className="general-spinner"></div>
                      Изпращам...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} />
                      Изпрати заявка
                    </>
                  )}
                </button>
                
                {formStatus === 'success' && (
                  <div className="general-success-message">
                    <FontAwesomeIcon icon={faCheck} />
                    Заявката е изпратена успешно!
                  </div>
                )}

                {formStatus === 'error' && (
                  <div className="general-error-message">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    Възникна грешка. Моля опитайте отново.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Course Details Modal */}
      {showCourseModal && selectedCourse && (
        <div className="general-modal-overlay" onClick={closeModals}>
          <div className="general-modal" onClick={(e) => e.stopPropagation()}>
            <div className="general-modal-header">
              <h3>
                <FontAwesomeIcon icon={faGraduationCap} />
                Информация за курса
              </h3>
              <button className="general-modal-close" onClick={closeModals}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="general-modal-content">
              <h4>{selectedCourse.name}</h4>
              <p>{selectedCourse.description}</p>
              
              <div className="general-modal-details">
                <div className="general-modal-detail">
                  <FontAwesomeIcon icon={faClock} />
                  <span>{selectedCourse.duration}</span>
                </div>
                <div className="general-modal-detail">
                  <FontAwesomeIcon icon={faUsers} />
                  <span>{selectedCourse.participants} участници</span>
                </div>
                {selectedCourse.instructor && (
                  <div className="general-modal-detail">
                    <FontAwesomeIcon icon={faUsers} />
                    <span>Инструктор: {selectedCourse.instructor}</span>
                  </div>
                )}
              </div>

              <div className="general-contact-info">
                <p>За записване се свържете с нас:</p>
                <div className="general-contact-methods">
                  {club.contacts?.phone && (
                    <a href={`tel:${club.contacts.phone}`} className="general-contact-method">
                      <FontAwesomeIcon icon={faPhone} />
                      {club.contacts.phone}
                    </a>
                  )}
                  {club.contacts?.email && (
                    <a href={`mailto:${club.contacts.email}`} className="general-contact-method">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {club.contacts.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ClubEvents;