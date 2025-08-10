import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt,
  faMapMarkerAlt,
  faClock,
  faUsers,
  faTicketAlt,
  faMusic,
  faUtensils,
  faMedkit,
  faGraduationCap,
  faGamepad,
  faHeart,
  faHandsHelping,
  faBirthdayCake,
  faTree,
  faTheaterMasks,
  faBookOpen,
  faDumbbell,
  faChevronLeft,
  faChevronRight,
  faFilter,
  faCalendar,
  faListAlt,
  faEye,
  faPhone,
  faEnvelope,
  faInfoCircle,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faUserPlus,
  faShare,
  faUser,
  faTimes,
  faComments
} from '@fortawesome/free-solid-svg-icons';
import './communityEvents.css';

export const CommunityEvents = ({ club }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'calendar'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [contactStatus, setContactStatus] = useState(null);

  // Проверяваме дали има необходимите данни
  if (!club?.events?.upcoming && 
      !club?.events?.recurring && 
      !club?.activities?.regular && 
      !club?.activities?.seasonal) {
    return null;
  }

  // Събираме всички събития
  const upcomingEvents = club.events?.upcoming || [];
  const recurringEvents = club.events?.recurring || [];
  const regularActivities = club.activities?.regular || [];
  const seasonalActivities = club.activities?.seasonal || [];

  // Създаваме обединен списък със събития
  const allEvents = [
    ...upcomingEvents.map(event => ({
      ...event,
      id: `upcoming-${event.name}`,
      type: 'upcoming',
      category: getEventCategory(event.name),
      status: getEventStatus(event.date)
    })),
    ...recurringEvents.map(event => ({
      ...event,
      id: `recurring-${event.name}`,
      type: 'recurring',
      category: getEventCategory(event.name),
      status: 'recurring'
    })),
    ...regularActivities.map(activity => ({
      id: `regular-${activity.name}`,
      name: activity.name,
      description: activity.description,
      schedule: activity.schedule,
      location: activity.location,
      participants: activity.participants,
      type: 'regular',
      category: getEventCategory(activity.name),
      status: 'ongoing'
    })),
    ...seasonalActivities.map(activity => ({
      id: `seasonal-${activity.name}`,
      name: activity.name,
      description: activity.description,
      season: activity.season,
      location: activity.location,
      participants: activity.participants,
      type: 'seasonal',
      category: getEventCategory(activity.name),
      status: getSeasonalStatus(activity.season)
    }))
  ];

  // Ако няма събития, не показваме компонента
  if (allEvents.length === 0) {
    return null;
  }

  // Helper функции
  function getEventCategory(eventName) {
    const name = eventName.toLowerCase();
    if (name.includes('концерт') || name.includes('музик')) return 'music';
    if (name.includes('храна') || name.includes('обяд') || name.includes('кулинар')) return 'food';
    if (name.includes('здрав') || name.includes('лекция') || name.includes('медицин')) return 'health';
    if (name.includes('образование') || name.includes('урок') || name.includes('курс')) return 'education';
    if (name.includes('игр') || name.includes('забавление') || name.includes('конкурс')) return 'entertainment';
    if (name.includes('празник') || name.includes('рожден') || name.includes('тържеств')) return 'celebration';
    if (name.includes('доброволч') || name.includes('помощ') || name.includes('благотворителн')) return 'volunteer';
    if (name.includes('спорт') || name.includes('физическ') || name.includes('упражнения')) return 'sports';
    if (name.includes('изложба') || name.includes('театър') || name.includes('културн')) return 'culture';
    if (name.includes('природа') || name.includes('разходка') || name.includes('екскурзия')) return 'nature';
    return 'general';
  }

  function getEventStatus(eventDate) {
    if (!eventDate) return 'unknown';
    const today = new Date();
    const event = new Date(eventDate);
    
    if (event < today) return 'past';
    if (event.toDateString() === today.toDateString()) return 'today';
    
    const diffTime = event - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return 'soon';
    return 'upcoming';
  }

  function getSeasonalStatus(season) {
    const currentMonth = new Date().getMonth();
    const seasonMonths = {
      'пролет': [2, 3, 4], // март, април, май
      'лято': [5, 6, 7],   // юни, юли, август
      'есен': [8, 9, 10],  // септември, октомври, ноември
      'зима': [11, 0, 1]   // декември, януари, февруари
    };
    
    const months = seasonMonths[season?.toLowerCase()] || [];
    return months.includes(currentMonth) ? 'active' : 'inactive';
  }

  function getCategoryIcon(category) {
    switch(category) {
      case 'music': return faMusic;
      case 'food': return faUtensils;
      case 'health': return faMedkit;
      case 'education': return faGraduationCap;
      case 'entertainment': return faGamepad;
      case 'celebration': return faBirthdayCake;
      case 'volunteer': return faHandsHelping;
      case 'sports': return faDumbbell;
      case 'culture': return faTheaterMasks;
      case 'nature': return faTree;
      default: return faCalendarAlt;
    }
  }

  function getCategoryColor(category) {
    switch(category) {
      case 'music': return '#8b5cf6';
      case 'food': return '#f59e0b';
      case 'health': return '#ef4444';
      case 'education': return '#3b82f6';
      case 'entertainment': return '#10b981';
      case 'celebration': return '#ec4899';
      case 'volunteer': return '#6366f1';
      case 'sports': return '#14b8a6';
      case 'culture': return '#f97316';
      case 'nature': return '#22c55e';
      default: return '#6b7280';
    }
  }

  function getStatusColor(status) {
    switch(status) {
      case 'today': return '#ef4444';
      case 'soon': return '#f59e0b';
      case 'upcoming': return '#3b82f6';
      case 'recurring': return '#8b5cf6';
      case 'ongoing': return '#10b981';
      case 'active': return '#22c55e';
      case 'inactive': return '#6b7280';
      case 'past': return '#94a3b8';
      default: return '#6b7280';
    }
  }

  function getStatusLabel(status) {
    switch(status) {
      case 'today': return 'Днес';
      case 'soon': return 'Скоро';
      case 'upcoming': return 'Предстоящо';
      case 'recurring': return 'Редовно';
      case 'ongoing': return 'Активно';
      case 'active': return 'В сезон';
      case 'inactive': return 'Извън сезон';
      case 'past': return 'Минало';
      default: return 'Неизвестно';
    }
  }

  // Категории за филтриране
  const categories = [
    { key: 'all', label: 'Всички', icon: faCalendarAlt },
    { key: 'music', label: 'Музика', icon: faMusic },
    { key: 'food', label: 'Храна', icon: faUtensils },
    { key: 'health', label: 'Здраве', icon: faMedkit },
    { key: 'education', label: 'Образование', icon: faGraduationCap },
    { key: 'entertainment', label: 'Забавление', icon: faGamepad },
    { key: 'celebration', label: 'Празници', icon: faBirthdayCake },
    { key: 'volunteer', label: 'Доброволчество', icon: faHandsHelping },
    { key: 'sports', label: 'Спорт', icon: faDumbbell },
    { key: 'culture', label: 'Култура', icon: faTheaterMasks },
    { key: 'nature', label: 'Природа', icon: faTree }
  ];

  // Филтриране на събития
  const filteredEvents = allEvents.filter(event => {
    return activeFilter === 'all' || event.category === activeFilter;
  });

  // Сортиране по статус и дата
  const sortedEvents = filteredEvents.sort((a, b) => {
    const statusPriority = {
      'today': 1,
      'soon': 2,
      'upcoming': 3,
      'recurring': 4,
      'ongoing': 5,
      'active': 6,
      'inactive': 7,
      'past': 8
    };
    
    return (statusPriority[a.status] || 9) - (statusPriority[b.status] || 9);
  });

  const openEventModal = (event) => {
    setSelectedEvent(event);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
  };

  // Contact Modal Functions
  const openContactModal = (eventName = '') => {
    setContactForm(prev => ({
      ...prev,
      subject: eventName ? `Интерес към ${eventName}` : 'Въпрос относно събития'
    }));
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setContactForm({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    setContactStatus(null);
  };

  const handleContactChange = (field, value) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactStatus('sending');

    if (club.contacts?.email) {
      const subject = encodeURIComponent(contactForm.subject);
      const body = encodeURIComponent(`
Здравейте,

Получихте ново съобщение от сайта:

Име: ${contactForm.name}
Имейл: ${contactForm.email}
Телефон: ${contactForm.phone}

Тема: ${contactForm.subject}

Съобщение:
${contactForm.message}

---
Изпратено от сайта на ${club.name}
      `);
      
      try {
        window.location.href = `mailto:${club.contacts.email}?subject=${subject}&body=${body}`;
        setContactStatus('sent');
        setTimeout(() => {
          closeContactModal();
        }, 2000);
      } catch (error) {
        setContactStatus('error');
      }
    } else {
      setContactStatus('error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return null;
    return timeString;
  };

  return (
    <section id="community-events" className="community-events-section">
      <div className="community-events-container">
        
        {/* Header */}
        <div className="community-events-header">
          <div className="community-events-header-content">
            <div className="community-events-badge">
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>Събития и дейности</span>
            </div>
            <h2 className="community-events-title">
              Заедно правим всеки ден по-специален
            </h2>
            <p className="community-events-subtitle">
              Открийте всички събития, дейности и програми, които Ви очакват в нашия клуб
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="community-events-stats">
            <div className="community-events-stat">
              <span className="community-events-stat-number">{allEvents.length}</span>
              <span className="community-events-stat-label">Общо събития</span>
            </div>
            <div className="community-events-stat">
              <span className="community-events-stat-number">
                {allEvents.filter(e => e.status === 'today' || e.status === 'soon').length}
              </span>
              <span className="community-events-stat-label">Предстоящи</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="community-events-controls">
          {/* View Mode Toggle */}
          <div className="community-events-view-toggle">
            <button 
              onClick={() => setViewMode('timeline')}
              className={`community-events-view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={faListAlt} />
              <span>Списък</span>
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`community-events-view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={faCalendar} />
              <span>Календар</span>
            </button>
          </div>
          
          {/* Category Filter */}
          <div className="community-events-category-filters">
            {categories.map(category => (
              <button
                key={category.key}
                onClick={() => setActiveFilter(category.key)}
                className={`community-events-category-btn ${activeFilter === category.key ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={category.icon} />
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Events Display */}
        {viewMode === 'timeline' ? (
          <div className="community-events-timeline">
            {sortedEvents.map((event, index) => (
              <div 
                key={event.id}
                className="community-events-timeline-item"
                style={{ '--event-delay': `${index * 0.1}s` }}
                onClick={() => openEventModal(event)}
              >
                <div className="community-events-timeline-marker">
                  <div 
                    className="community-events-timeline-icon"
                    style={{ backgroundColor: getCategoryColor(event.category) }}
                  >
                    <FontAwesomeIcon icon={getCategoryIcon(event.category)} />
                  </div>
                </div>
                
                <div className="community-events-event-card">
                  <div className="community-events-event-header">
                    <div className="community-events-event-title-section">
                      <h3 className="community-events-event-title">{event.name}</h3>
                      <div 
                        className="community-events-event-status"
                        style={{ backgroundColor: getStatusColor(event.status) }}
                      >
                        {getStatusLabel(event.status)}
                      </div>
                    </div>
                    
                    <div className="community-events-event-type">
                      {event.type === 'upcoming' && 'Събитие'}
                      {event.type === 'recurring' && 'Редовно'}
                      {event.type === 'regular' && 'Дейност'}
                      {event.type === 'seasonal' && 'Сезонно'}
                    </div>
                  </div>
                  
                  <p className="community-events-event-description">
                    {event.description}
                  </p>
                  
                  <div className="community-events-event-details">
                    {event.date && (
                      <div className="community-events-event-detail">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>{formatDate(event.date)}</span>
                      </div>
                    )}
                    {event.time && (
                      <div className="community-events-event-detail">
                        <FontAwesomeIcon icon={faClock} />
                        <span>{formatTime(event.time)}</span>
                      </div>
                    )}
                    {event.schedule && (
                      <div className="community-events-event-detail">
                        <FontAwesomeIcon icon={faClock} />
                        <span>{event.schedule}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="community-events-event-detail">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.participants && (
                      <div className="community-events-event-detail">
                        <FontAwesomeIcon icon={faUsers} />
                        <span>{event.participants} участници</span>
                      </div>
                    )}
                    {event.season && (
                      <div className="community-events-event-detail">
                        <FontAwesomeIcon icon={faTree} />
                        <span>{event.season}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="community-events-calendar">
            <div className="community-events-calendar-header">
              <button 
                onClick={() => {
                  const newDate = new Date(selectedYear, selectedMonth - 1);
                  setSelectedMonth(newDate.getMonth());
                  setSelectedYear(newDate.getFullYear());
                }}
                className="community-events-calendar-nav"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              
              <h3 className="community-events-calendar-title">
                {new Date(selectedYear, selectedMonth).toLocaleDateString('bg-BG', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h3>
              
              <button 
                onClick={() => {
                  const newDate = new Date(selectedYear, selectedMonth + 1);
                  setSelectedMonth(newDate.getMonth());
                  setSelectedYear(newDate.getFullYear());
                }}
                className="community-events-calendar-nav"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
            
            <div className="community-events-calendar-grid">
              {/* Calendar implementation would go here */}
              <div className="community-events-calendar-placeholder">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <p>Календарен изглед ще бъде добавен скоро</p>
                <button 
                  onClick={() => setViewMode('timeline')}
                  className="community-events-back-btn"
                >
                  Върни се към списъка
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Events */}
        {filteredEvents.length === 0 && (
          <div className="community-events-no-events">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <h3>Няма събития в тази категория</h3>
            <p>Опитайте с различен филтър или се свържете с нас за предстоящи дейности</p>
            <button 
              onClick={() => setActiveFilter('all')}
              className="community-events-reset-btn"
            >
              Покажи всички събития
            </button>
          </div>
        )}

        {/* Event Modal */}
        {selectedEvent && (
          <div className="community-events-modal" onClick={closeEventModal}>
            <div className="community-events-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="community-events-modal-close" onClick={closeEventModal}>
                ×
              </button>
              
              <div className="community-events-modal-header">
                <div 
                  className="community-events-modal-icon"
                  style={{ backgroundColor: getCategoryColor(selectedEvent.category) }}
                >
                  <FontAwesomeIcon icon={getCategoryIcon(selectedEvent.category)} />
                </div>
                <div className="community-events-modal-title-section">
                  <h3>{selectedEvent.name}</h3>
                  <div 
                    className="community-events-modal-status"
                    style={{ backgroundColor: getStatusColor(selectedEvent.status) }}
                  >
                    {getStatusLabel(selectedEvent.status)}
                  </div>
                </div>
              </div>
              
              <div className="community-events-modal-body">
                <p className="community-events-modal-description">
                  {selectedEvent.description}
                </p>
                
                <div className="community-events-modal-details">
                  {selectedEvent.date && (
                    <div className="community-events-modal-detail">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>{formatDate(selectedEvent.date)}</span>
                    </div>
                  )}
                  {selectedEvent.time && (
                    <div className="community-events-modal-detail">
                      <FontAwesomeIcon icon={faClock} />
                      <span>{formatTime(selectedEvent.time)}</span>
                    </div>
                  )}
                  {selectedEvent.schedule && (
                    <div className="community-events-modal-detail">
                      <FontAwesomeIcon icon={faClock} />
                      <span>{selectedEvent.schedule}</span>
                    </div>
                  )}
                  {selectedEvent.location && (
                    <div className="community-events-modal-detail">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  {selectedEvent.participants && (
                    <div className="community-events-modal-detail">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{selectedEvent.participants} участници</span>
                    </div>
                  )}
                </div>
                
                <div className="community-events-modal-actions">
                  {club.contacts?.phone && (
                    <a 
                      href={`tel:${club.contacts.phone}`}
                      className="community-events-modal-btn primary"
                    >
                      <FontAwesomeIcon icon={faPhone} />
                      <span>Обадете се</span>
                    </a>
                  )}
                  <button 
                    onClick={() => {
                      closeEventModal();
                      openContactModal(selectedEvent.name);
                    }}
                    className="community-events-modal-btn secondary"
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span>Пишете ни</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && (
          <div className="community-events-contact-modal" onClick={closeContactModal}>
            <div className="community-events-contact-content" onClick={(e) => e.stopPropagation()}>
              <button className="community-events-contact-close" onClick={closeContactModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
              
              <div className="community-events-contact-header">
                <FontAwesomeIcon icon={faComments} />
                <h3>Свържете се с нас</h3>
                <p>Имате въпроси за нашите събития? Пишете ни!</p>
              </div>
              
              {contactStatus === 'sent' ? (
                <div className="community-events-contact-success">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <h4>Съобщението е изпратено успешно!</h4>
                  <p>Благодарим ви за интереса! Ще се свържем с вас възможно най-скоро.</p>
                </div>
              ) : contactStatus === 'error' ? (
                <div className="community-events-contact-error">
                  <FontAwesomeIcon icon={faTimes} />
                  <h4>Възникна грешка</h4>
                  <p>Моля опитайте отново или се свържете с нас директно.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="community-events-contact-form">
                  <div className="community-events-form-row">
                    <div className="community-events-form-group">
                      <label htmlFor="contact-name">
                        <FontAwesomeIcon icon={faUser} />
                        Вашето име *
                      </label>
                      <input
                        type="text"
                        id="contact-name"
                        value={contactForm.name}
                        onChange={(e) => handleContactChange('name', e.target.value)}
                        required
                        placeholder="Въведете вашето име"
                      />
                    </div>
                    
                    <div className="community-events-form-group">
                      <label htmlFor="contact-email">
                        <FontAwesomeIcon icon={faEnvelope} />
                        Имейл адрес *
                      </label>
                      <input
                        type="email"
                        id="contact-email"
                        value={contactForm.email}
                        onChange={(e) => handleContactChange('email', e.target.value)}
                        required
                        placeholder="Въведете вашия имейл"
                      />
                    </div>
                  </div>
                  
                  <div className="community-events-form-row">
                    <div className="community-events-form-group">
                      <label htmlFor="contact-phone">
                        <FontAwesomeIcon icon={faPhone} />
                        Телефон
                      </label>
                      <input
                        type="tel"
                        id="contact-phone"
                        value={contactForm.phone}
                        onChange={(e) => handleContactChange('phone', e.target.value)}
                        placeholder="Въведете вашия телефон"
                      />
                    </div>
                    
                    <div className="community-events-form-group">
                      <label htmlFor="contact-subject">
                        <FontAwesomeIcon icon={faInfoCircle} />
                        Тема *
                      </label>
                      <input
                        type="text"
                        id="contact-subject"
                        value={contactForm.subject}
                        onChange={(e) => handleContactChange('subject', e.target.value)}
                        required
                        placeholder="Темата на вашето съобщение"
                      />
                    </div>
                  </div>
                  
                  <div className="community-events-form-group">
                    <label htmlFor="contact-message">
                      <FontAwesomeIcon icon={faComments} />
                      Съобщение *
                    </label>
                    <textarea
                      id="contact-message"
                      value={contactForm.message}
                      onChange={(e) => handleContactChange('message', e.target.value)}
                      required
                      placeholder="Напишете вашето съобщение тук..."
                      rows="5"
                    />
                  </div>
                  
                  <div className="community-events-form-actions">
                    <button 
                      type="submit" 
                      className="community-events-submit-btn"
                      disabled={contactStatus === 'sending'}
                    >
                      <FontAwesomeIcon icon={faEnvelope} />
                      {contactStatus === 'sending' ? 'Изпраща се...' : 'Изпрати съобщението'}
                    </button>
                    <button 
                      type="button" 
                      onClick={closeContactModal}
                      className="community-events-cancel-btn"
                    >
                      Отказ
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CommunityEvents;