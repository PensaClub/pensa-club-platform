import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    if (!dateString) return { 
      day: '—', 
      month: '—', 
      year: '—', 
      fullDate: t('clubs.ClubEvents.date.notSpecified') 
    };
    
    const date = new Date(dateString);
    const currentLang = t('clubs.ClubEvents.date.language');
    
    if (currentLang === 'bg') {
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
    } else if (currentLang === 'en') {
      const months = [
        'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
        'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
      ];
      return {
        day: date.getDate(),
        month: months[date.getMonth()],
        year: date.getFullYear(),
        fullDate: date.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      };
    } else if (currentLang === 'de') {
      const months = [
        'JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN',
        'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'
      ];
      return {
        day: date.getDate(),
        month: months[date.getMonth()],
        year: date.getFullYear(),
        fullDate: date.toLocaleDateString('de-DE', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      };
    }
  };

  const getEventTypeInfo = (type) => {
    return {
      label: t(`clubs.ClubEvents.eventTypes.${type}`, { defaultValue: t('clubs.ClubEvents.eventTypes.default') }),
      color: {
        'cultural': '#8b5cf6',
        'social': '#3b82f6', 
        'traditional': '#ef4444',
        'sports': '#10b981',
        'educational': '#f59e0b',
        'health': '#ec4899'
      }[type] || '#6b7280',
      emoji: {
        'cultural': '🎭',
        'social': '🤝',
        'traditional': '🎪',
        'sports': '⚽',
        'educational': '📚',
        'health': '💊'
      }[type] || '📅'
    };
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
      const subject = encodeURIComponent(t('clubs.ClubEvents.trips.emailSubject', { 
        destination: selectedTrip.destination 
      }));
      
      const body = encodeURIComponent(t('clubs.ClubEvents.trips.emailBody', {
        firstName: registrationForm.firstName,
        lastName: registrationForm.lastName,
        phone: registrationForm.phone,
        email: registrationForm.email,
        destination: selectedTrip.destination,
        date: formatDate(selectedTrip.date).fullDate,
        price: selectedTrip.price,
        notes: registrationForm.notes || t('clubs.ClubEvents.form.none'),
        clubName: club.name
      }));

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
              <span>{event.time || t('clubs.ClubEvents.event.noTime')}</span>
            </div>
            
            <div className="general-event-detail">
              <FontAwesomeIcon icon={faUsers} />
              <span>{event.participants || 0} {t('clubs.ClubEvents.event.participants')}</span>
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
                {t('clubs.ClubEvents.event.details')}
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
      alert(t('clubs.ClubEvents.messages.linkCopied'));
    }
  };

  return (
    <section id="general-events" className="general-events-main">
      <div className="general-events-container">
        
        {/* Header */}
        <div className="general-events-header">
          <div className="general-events-badge">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>{t('clubs.ClubEvents.header.badge')}</span>
          </div>
          <h2 className="general-events-title">{t('clubs.ClubEvents.header.title')}</h2>
          <p className="general-events-subtitle">
            {t('clubs.ClubEvents.header.subtitle')}
          </p>
          
          {/* Stats */}
          <div className="general-events-stats">
            {hasEvents && (
              <div className="general-events-stat">
                <span>{events.length}</span>
                <label>{t('clubs.ClubEvents.stats.events')}</label>
              </div>
            )}
            {hasTrips && (
              <div className="general-events-stat">
                <span>{club.activities.trips.length}</span>
                <label>{t('clubs.ClubEvents.stats.trips')}</label>
              </div>
            )}
            {hasCourses && (
              <div className="general-events-stat">
                <span>{club.activities.courses.length}</span>
                <label>{t('clubs.ClubEvents.stats.courses')}</label>
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
                {t('clubs.ClubEvents.tabs.upcoming')} ({upcomingEvents.length})
              </button>
              <button 
                className={`general-tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                onClick={() => setActiveTab('past')}
              >
                {t('clubs.ClubEvents.tabs.past')} ({pastEvents.length})
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
                      <h3>{t('clubs.ClubEvents.noContent.upcomingTitle')}</h3>
                      <p>{t('clubs.ClubEvents.noContent.upcomingText')}</p>
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
                      <h3>{t('clubs.ClubEvents.noContent.pastTitle')}</h3>
                      <p>{t('clubs.ClubEvents.noContent.pastText')}</p>
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
              {t('clubs.ClubEvents.trips.title')}
            </h3>
            
            <div className="general-trips-grid">
              {club.activities.trips.map((trip, index) => (
                <div key={index} className="general-trip-card">
                  <div className="general-trip-header">
                    <h4 className="general-trip-destination">{trip.destination}</h4>
                    <div className="general-trip-price">{trip.price} {t('clubs.ClubEvents.trips.currency')}</div>
                  </div>
                  
                  <p className="general-trip-description">{trip.description}</p>
                  
                  <div className="general-trip-details">
                    <div className="general-trip-detail">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>{formatDate(trip.date).fullDate}</span>
                    </div>
                    <div className="general-trip-detail">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{trip.participants || 0} {t('clubs.ClubEvents.trips.registered')}</span>
                    </div>
                  </div>

                  <button 
                    className="general-trip-btn"
                    onClick={() => openTripModal(trip)}
                  >
                    <FontAwesomeIcon icon={faUserPlus} />
                    {t('clubs.ClubEvents.trips.register')}
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
              {t('clubs.ClubEvents.courses.title')}
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
                      <span>{course.duration || t('clubs.ClubEvents.courses.noDuration')}</span>
                    </div>
                    <div className="general-course-detail">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{course.participants || 0} {t('clubs.ClubEvents.courses.participants')}</span>
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
                    {t('clubs.ClubEvents.courses.learnMore')}
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
                {t('clubs.ClubEvents.modals.eventDetails.title')}
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
                  <span>{selectedEvent.participants} {t('clubs.ClubEvents.event.participants')}</span>
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
                    <span>{t('clubs.ClubEvents.modals.eventDetails.organizer')}: {selectedEvent.organizer}</span>
                  </div>
                )}
              </div>

              {selectedEvent.highlights && selectedEvent.highlights.length > 0 && (
                <div className="general-event-highlights">
                  <h5>{t('clubs.ClubEvents.modals.eventDetails.highlights')}</h5>
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
                {t('clubs.ClubEvents.modals.tripRegistration.title')}
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
                  <span>💰 {selectedTrip.price} {t('clubs.ClubEvents.trips.currency')}</span>
                  <span>👥 {selectedTrip.participants} {t('clubs.ClubEvents.trips.registered')}</span>
                </div>
              </div>

              <form onSubmit={handleTripRegistration} className="general-registration-form">
                <div className="general-form-row">
                  <div className="general-form-group">
                    <label>{t('clubs.ClubEvents.form.firstName')} *</label>
                    <input
                      type="text"
                      value={registrationForm.firstName}
                      onChange={(e) => handleFormChange('firstName', e.target.value)}
                      placeholder={t('clubs.ClubEvents.form.firstNamePlaceholder')}
                      required
                    />
                  </div>
                  
                  <div className="general-form-group">
                    <label>{t('clubs.ClubEvents.form.lastName')} *</label>
                    <input
                      type="text"
                      value={registrationForm.lastName}
                      onChange={(e) => handleFormChange('lastName', e.target.value)}
                      placeholder={t('clubs.ClubEvents.form.lastNamePlaceholder')}
                      required
                    />
                  </div>
                </div>
                
                <div className="general-form-row">
                  <div className="general-form-group">
                    <label>{t('clubs.ClubEvents.form.phone')} *</label>
                    <input
                      type="tel"
                      value={registrationForm.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder={t('clubs.ClubEvents.form.phonePlaceholder')}
                      required
                    />
                  </div>
                  
                  <div className="general-form-group">
                    <label>{t('clubs.ClubEvents.form.email')}</label>
                    <input
                      type="email"
                      value={registrationForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      placeholder={t('clubs.ClubEvents.form.emailPlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="general-form-group">
                  <label>{t('clubs.ClubEvents.form.notes')}</label>
                  <textarea
                    value={registrationForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder={t('clubs.ClubEvents.form.notesPlaceholder')}
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
                      {t('clubs.ClubEvents.form.sending')}
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} />
                      {t('clubs.ClubEvents.form.submit')}
                    </>
                  )}
                </button>
                
                {formStatus === 'success' && (
                  <div className="general-success-message">
                    <FontAwesomeIcon icon={faCheck} />
                    {t('clubs.ClubEvents.messages.success')}
                  </div>
                )}

                {formStatus === 'error' && (
                  <div className="general-error-message">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    {t('clubs.ClubEvents.messages.error')}
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
                {t('clubs.ClubEvents.modals.courseDetails.title')}
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
                  <span>{selectedCourse.participants} {t('clubs.ClubEvents.courses.participants')}</span>
                </div>
                {selectedCourse.instructor && (
                  <div className="general-modal-detail">
                    <FontAwesomeIcon icon={faUsers} />
                    <span>{t('clubs.ClubEvents.modals.courseDetails.instructor')}: {selectedCourse.instructor}</span>
                  </div>
                )}
              </div>

              <div className="general-contact-info">
                <p>{t('clubs.ClubEvents.contact.forRegistration')}</p>
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