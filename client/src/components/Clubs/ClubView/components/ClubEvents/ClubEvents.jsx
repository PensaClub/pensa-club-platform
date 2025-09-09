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
import { useClubContext } from '../../../../contexts/ClubContext';

export const ClubEvents = ({ club }) => {
  const { t } = useTranslation();
  const { 
    registerForEvent,
    sendMembershipApplication,
    sendVolunteerApplication
  } = useClubContext();
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    email: '',
    phone: '',
    numberOfParticipants: 1,
    specialRequests: '',
    emergencyContact: '',
    experience: '',
    expectations: ''
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
    setFormStatus(null);
    setRegistrationForm({
      name: '',
      email: '',
      phone: '',
      numberOfParticipants: 1,
      specialRequests: '',
      emergencyContact: '',
      experience: '',
      expectations: ''
    });
  };

  const openTripModal = (trip) => {
    setSelectedTrip(trip);
    setShowTripModal(true);
    setFormStatus(null);
    setRegistrationForm({
      name: '',
      email: '',
      phone: '',
      numberOfParticipants: 1,
      specialRequests: '',
      emergencyContact: '',
      experience: '',
      expectations: ''
    });
  };

  const openCourseModal = (course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
    setFormStatus(null);
    setRegistrationForm({
      name: '',
      email: '',
      phone: '',
      numberOfParticipants: 1,
      specialRequests: '',
      emergencyContact: '',
      experience: '',
      expectations: ''
    });
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

  // Записване за събитие
  const handleEventRegistration = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    
    // Валидация
    if (!registrationForm.name.trim() || !registrationForm.email.trim() || !registrationForm.phone.trim()) {
      alert('Моля, попълнете всички задължителни полета');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registrationForm.email)) {
      alert('Моля, въведете валиден имейл адрес');
      return;
    }
    
    setFormStatus('sending');

    try {
      const success = await registerForEvent(club.id, selectedEvent.id, {
        name: registrationForm.name,
        email: registrationForm.email,
        phone: registrationForm.phone,
        numberOfParticipants: registrationForm.numberOfParticipants || 1,
        specialRequests: registrationForm.specialRequests || ''
      });

      if (success) {
        setFormStatus('success');
        setTimeout(() => {
          closeModals();
        }, 2000);
      } else {
        setFormStatus('error');
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      setFormStatus('error');
    }
    
    if (formStatus === 'error') {
      setTimeout(() => setFormStatus(null), 3000);
    }
  };

  // Записване за екскурзия
  const handleTripRegistration = async (e) => {
    e.preventDefault();
    if (!selectedTrip) return;
    
    // Валидация
    if (!registrationForm.name.trim() || !registrationForm.email.trim() || !registrationForm.phone.trim()) {
      alert('Моля, попълнете всички задължителни полета');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registrationForm.email)) {
      alert('Моля, въведете валиден имейл адрес');
      return;
    }
    
    setFormStatus('sending');

    try {
      // За екскурзии използваме tripRegistrationSchema чрез registerForEvent
      const success = await registerForEvent(club.id, selectedTrip.id || `trip-${selectedTrip.destination}`, {
        name: registrationForm.name,
        email: registrationForm.email,
        phone: registrationForm.phone,
        numberOfParticipants: registrationForm.numberOfParticipants || 1,
        emergencyContact: registrationForm.emergencyContact || '',
        specialRequests: registrationForm.specialRequests || ''
      });

      if (success) {
        setFormStatus('success');
        setTimeout(() => {
          closeModals();
        }, 2000);
      } else {
        setFormStatus('error');
      }
    } catch (error) {
      console.error('Error registering for trip:', error);
      setFormStatus('error');
    }
    
    if (formStatus === 'error') {
      setTimeout(() => setFormStatus(null), 3000);
    }
  };

  // Записване за курс
  const handleCourseRegistration = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    
    // Валидация
    if (!registrationForm.name.trim() || !registrationForm.email.trim() || !registrationForm.phone.trim()) {
      alert('Моля, попълнете всички задължителни полета');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registrationForm.email)) {
      alert('Моля, въведете валиден имейл адрес');
      return;
    }
    
    setFormStatus('sending');

    try {
      // За курсове използваме courseRegistrationSchema чрез registerForEvent
      const success = await registerForEvent(club.id, selectedCourse.id || `course-${selectedCourse.name}`, {
        name: registrationForm.name,
        email: registrationForm.email,
        phone: registrationForm.phone,
        experience: registrationForm.experience || '',
        expectations: registrationForm.expectations || ''
      });

      if (success) {
        setFormStatus('success');
        setTimeout(() => {
          closeModals();
        }, 2000);
      } else {
        setFormStatus('error');
      }
    } catch (error) {
      console.error('Error registering for course:', error);
      setFormStatus('error');
    }
    
    if (formStatus === 'error') {
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

  // Функция за рендериране на различни полета според типа
  const renderRegistrationFields = (type) => {
    const commonFields = (
      <>
        <div className="general-form-group">
          <label>Име *</label>
          <input
            type="text"
            value={registrationForm.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            placeholder="Въведете вашето име"
            required
          />
        </div>
        
        <div className="general-form-row">
          <div className="general-form-group">
            <label>Email *</label>
            <input
              type="email"
              value={registrationForm.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              placeholder="име@email.com"
              required
            />
          </div>
          
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
        </div>
      </>
    );

    if (type === 'event') {
      return (
        <>
          {commonFields}
          <div className="general-form-group">
            <label>Брой участници</label>
            <input
              type="number"
              min="1"
              max="10"
              value={registrationForm.numberOfParticipants}
              onChange={(e) => handleFormChange('numberOfParticipants', parseInt(e.target.value))}
            />
          </div>
          <div className="general-form-group">
            <label>Специални изисквания</label>
            <textarea
              value={registrationForm.specialRequests}
              onChange={(e) => handleFormChange('specialRequests', e.target.value)}
              placeholder="Диетични ограничения, нужда от достъпност и др."
              rows="3"
            />
          </div>
        </>
      );
    } else if (type === 'trip') {
      return (
        <>
          {commonFields}
          <div className="general-form-group">
            <label>Брой участници</label>
            <input
              type="number"
              min="1"
              max="10"
              value={registrationForm.numberOfParticipants}
              onChange={(e) => handleFormChange('numberOfParticipants', parseInt(e.target.value))}
            />
          </div>
          <div className="general-form-group">
            <label>Спешен контакт</label>
            <input
              type="text"
              value={registrationForm.emergencyContact}
              onChange={(e) => handleFormChange('emergencyContact', e.target.value)}
              placeholder="Име и телефон на близък човек"
            />
          </div>
          <div className="general-form-group">
            <label>Специални изисквания</label>
            <textarea
              value={registrationForm.specialRequests}
              onChange={(e) => handleFormChange('specialRequests', e.target.value)}
              placeholder="Медицински условия, диетични ограничения и др."
              rows="3"
            />
          </div>
        </>
      );
    } else if (type === 'course') {
      return (
        <>
          {commonFields}
          <div className="general-form-group">
            <label>Опит</label>
            <select
              value={registrationForm.experience}
              onChange={(e) => handleFormChange('experience', e.target.value)}
            >
              <option value="">Изберете ниво</option>
              <option value="none">Няма опит</option>
              <option value="beginner">Начинаещ</option>
              <option value="intermediate">Среднонапреднал</option>
              <option value="advanced">Напреднал</option>
            </select>
          </div>
          <div className="general-form-group">
            <label>Очаквания от курса</label>
            <textarea
              value={registrationForm.expectations}
              onChange={(e) => handleFormChange('expectations', e.target.value)}
              placeholder="Какво се надявате да научите..."
              rows="3"
            />
          </div>
        </>
      );
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
                    <FontAwesomeIcon icon={faUserPlus} />
                    Записване
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Event Registration Modal */}
      {showEventModal && selectedEvent && (
        <div className="general-modal-overlay" onClick={closeModals}>
          <div className="general-modal" onClick={(e) => e.stopPropagation()}>
            <div className="general-modal-header">
              <h3>
                <FontAwesomeIcon icon={faUserPlus} />
                Записване за {selectedEvent.title}
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
              
              <div className="general-selected-event">
                <h4>{selectedEvent.title}</h4>
                <p>{selectedEvent.description}</p>
                <div className="general-event-info">
                  <span>📅 {formatDate(selectedEvent.date).fullDate}</span>
                  <span>🕐 {selectedEvent.time}</span>
                  {selectedEvent.location && <span>📍 {selectedEvent.location}</span>}
                  {selectedEvent.price && <span>💰 {selectedEvent.price}</span>}
                </div>
              </div>

              <form onSubmit={handleEventRegistration} className="general-registration-form">
                {renderRegistrationFields('event')}
                
                <button 
                  type="submit" 
                  className="general-submit-btn"
                  disabled={formStatus === 'sending'}
                >
                  {formStatus === 'sending' ? (
                    <>
                      <div className="general-spinner"></div>
                      Изпращане...
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
                    Възникна грешка при изпращането!
                  </div>
                )}
              </form>
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
                {renderRegistrationFields('trip')}
                
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

      {/* Course Registration Modal */}
      {showCourseModal && selectedCourse && (
        <div className="general-modal-overlay" onClick={closeModals}>
          <div className="general-modal" onClick={(e) => e.stopPropagation()}>
            <div className="general-modal-header">
              <h3>
                <FontAwesomeIcon icon={faGraduationCap} />
                Записване за {selectedCourse.name}
              </h3>
              <button className="general-modal-close" onClick={closeModals}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="general-modal-content">
              <div className="general-selected-course">
                <h4>{selectedCourse.name}</h4>
                <p>{selectedCourse.description}</p>
                <div className="general-course-info">
                  <span>⏱️ {selectedCourse.duration}</span>
                  <span>👥 {selectedCourse.participants} участници</span>
                  {selectedCourse.instructor && <span>👨‍🏫 {selectedCourse.instructor}</span>}
                </div>
              </div>

              <form onSubmit={handleCourseRegistration} className="general-registration-form">
                {renderRegistrationFields('course')}
                
                <button 
                  type="submit" 
                  className="general-submit-btn"
                  disabled={formStatus === 'sending'}
                >
                  {formStatus === 'sending' ? (
                    <>
                      <div className="general-spinner"></div>
                      Изпращане...
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
                    Възникна грешка при изпращането!
                  </div>
                )}
              </form>

              <div className="general-contact-info">
                <p>Можете да се свържете директно:</p>
                <div className="general-contact-methods">
                  {(club?.clubDetails?.contacts?.phone || club?.contacts?.phone) && (
                    <a href={`tel:${club.clubDetails?.contacts?.phone || club.contacts?.phone}`} className="general-contact-method">
                      <FontAwesomeIcon icon={faPhone} />
                      {club.clubDetails?.contacts?.phone || club.contacts?.phone}
                    </a>
                  )}
                  {(club?.clubDetails?.contacts?.email || club?.contacts?.email) && (
                    <a href={`mailto:${club.clubDetails?.contacts?.email || club.contacts?.email}`} className="general-contact-method">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {club.clubDetails?.contacts?.email || club.contacts?.email}
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