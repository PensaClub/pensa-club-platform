import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState('timeline');
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

  if (!club?.events?.upcoming && 
      !club?.events?.recurring && 
      !club?.activities?.regular && 
      !club?.activities?.seasonal) {
    return null;
  }

  const upcomingEvents = club.events?.upcoming || [];
  const recurringEvents = club.events?.recurring || [];
  const regularActivities = club.activities?.regular || [];
  const seasonalActivities = club.activities?.seasonal || [];

  const getEventCategory = (eventName) => {
    const name = eventName.toLowerCase();
    const categories = t('clubs.CommunityEvents.categoryTerms', { returnObjects: true });
    
    for (const [categoryKey, terms] of Object.entries(categories)) {
      if (terms.some(term => name.includes(term.toLowerCase()))) {
        return categoryKey;
      }
    }
    return 'general';
  };

  const getEventStatus = (eventDate) => {
    if (!eventDate) return 'unknown';
    const today = new Date();
    const event = new Date(eventDate);
    
    if (event < today) return 'past';
    if (event.toDateString() === today.toDateString()) return 'today';
    
    const diffTime = event - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return 'soon';
    return 'upcoming';
  };

  const getSeasonalStatus = (season) => {
    const currentMonth = new Date().getMonth();
    const seasonMonths = t('clubs.CommunityEvents.seasonMonths', { returnObjects: true });
    
    const seasonKey = Object.keys(seasonMonths).find(key => 
      season?.toLowerCase().includes(key) || 
      t(`clubs.CommunityEvents.seasons.${key}`).toLowerCase() === season?.toLowerCase()
    );
    
    if (!seasonKey) return 'inactive';
    
    const months = seasonMonths[seasonKey] || [];
    return months.includes(currentMonth) ? 'active' : 'inactive';
  };

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

  if (allEvents.length === 0) {
    return null;
  }

  const getCategoryIcon = (category) => {
    const iconMap = {
      music: faMusic,
      food: faUtensils,
      health: faMedkit,
      education: faGraduationCap,
      entertainment: faGamepad,
      celebration: faBirthdayCake,
      volunteer: faHandsHelping,
      sports: faDumbbell,
      culture: faTheaterMasks,
      nature: faTree,
      general: faCalendarAlt
    };
    return iconMap[category] || faCalendarAlt;
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      music: '#8b5cf6',
      food: '#f59e0b',
      health: '#ef4444',
      education: '#3b82f6',
      entertainment: '#10b981',
      celebration: '#ec4899',
      volunteer: '#6366f1',
      sports: '#14b8a6',
      culture: '#f97316',
      nature: '#22c55e',
      general: '#6b7280'
    };
    return colorMap[category] || '#6b7280';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      today: '#ef4444',
      soon: '#f59e0b',
      upcoming: '#3b82f6',
      recurring: '#8b5cf6',
      ongoing: '#10b981',
      active: '#22c55e',
      inactive: '#6b7280',
      past: '#94a3b8',
      unknown: '#6b7280'
    };
    return colorMap[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    return t(`clubs.CommunityEvents.statuses.${status}`, status);
  };

  const getTypeLabel = (type) => {
    return t(`clubs.CommunityEvents.types.${type}`, type);
  };

  const getCategories = () => [
    { key: 'all', label: t('clubs.CommunityEvents.categories.all'), icon: faCalendarAlt },
    { key: 'music', label: t('clubs.CommunityEvents.categories.music'), icon: faMusic },
    { key: 'food', label: t('clubs.CommunityEvents.categories.food'), icon: faUtensils },
    { key: 'health', label: t('clubs.CommunityEvents.categories.health'), icon: faMedkit },
    { key: 'education', label: t('clubs.CommunityEvents.categories.education'), icon: faGraduationCap },
    { key: 'entertainment', label: t('clubs.CommunityEvents.categories.entertainment'), icon: faGamepad },
    { key: 'celebration', label: t('clubs.CommunityEvents.categories.celebration'), icon: faBirthdayCake },
    { key: 'volunteer', label: t('clubs.CommunityEvents.categories.volunteer'), icon: faHandsHelping },
    { key: 'sports', label: t('clubs.CommunityEvents.categories.sports'), icon: faDumbbell },
    { key: 'culture', label: t('clubs.CommunityEvents.categories.culture'), icon: faTheaterMasks },
    { key: 'nature', label: t('clubs.CommunityEvents.categories.nature'), icon: faTree }
  ];

  const categories = getCategories();

  const filteredEvents = allEvents.filter(event => {
    return activeFilter === 'all' || event.category === activeFilter;
  });

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

  const openContactModal = (eventName = '') => {
    setContactForm(prev => ({
      ...prev,
      subject: eventName ? 
        t('clubs.CommunityEvents.contact.subjectWithEvent', { eventName }) : 
        t('clubs.CommunityEvents.contact.subjectGeneral')
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
      const body = encodeURIComponent(t('clubs.CommunityEvents.contact.emailBody', {
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone,
        subject: contactForm.subject,
        message: contactForm.message,
        clubName: club.name
      }));
      
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
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'de' ? 'de-DE' : 'en-US';
    
    return date.toLocaleDateString(locale, {
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

  const formatCalendarMonth = () => {
    const date = new Date(selectedYear, selectedMonth);
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'de' ? 'de-DE' : 'en-US';
    
    return date.toLocaleDateString(locale, { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedYear, selectedMonth + direction);
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  return (
    <section id="community-events" className="community-events-section">
      <div className="community-events-container">
        
        <div className="community-events-header">
          <div className="community-events-header-content">
            <div className="community-events-badge">
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>{t('clubs.CommunityEvents.header.badge')}</span>
            </div>
            <h2 className="community-events-title">
              {t('clubs.CommunityEvents.header.title')}
            </h2>
            <p className="community-events-subtitle">
              {t('clubs.CommunityEvents.header.subtitle')}
            </p>
          </div>
          
          <div className="community-events-stats">
            <div className="community-events-stat">
              <span className="community-events-stat-number">{allEvents.length}</span>
              <span className="community-events-stat-label">{t('clubs.CommunityEvents.stats.totalEvents')}</span>
            </div>
            <div className="community-events-stat">
              <span className="community-events-stat-number">
                {allEvents.filter(e => e.status === 'today' || e.status === 'soon').length}
              </span>
              <span className="community-events-stat-label">{t('clubs.CommunityEvents.stats.upcoming')}</span>
            </div>
          </div>
        </div>

        <div className="community-events-controls">
          <div className="community-events-view-toggle">
            <button 
              onClick={() => setViewMode('timeline')}
              className={`community-events-view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={faListAlt} />
              <span>{t('clubs.CommunityEvents.viewModes.list')}</span>
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`community-events-view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={faCalendar} />
              <span>{t('clubs.CommunityEvents.viewModes.calendar')}</span>
            </button>
          </div>
          
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
                      {getTypeLabel(event.type)}
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
                        <span>{t('clubs.CommunityEvents.details.participants', { count: event.participants })}</span>
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
                onClick={() => navigateMonth(-1)}
                className="community-events-calendar-nav"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              
              <h3 className="community-events-calendar-title">
                {formatCalendarMonth()}
              </h3>
              
              <button 
                onClick={() => navigateMonth(1)}
                className="community-events-calendar-nav"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
            
            <div className="community-events-calendar-grid">
              <div className="community-events-calendar-placeholder">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <p>{t('clubs.CommunityEvents.calendar.comingSoon')}</p>
                <button 
                  onClick={() => setViewMode('timeline')}
                  className="community-events-back-btn"
                >
                  {t('clubs.CommunityEvents.calendar.backToList')}
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="community-events-no-events">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <h3>{t('clubs.CommunityEvents.noEvents.title')}</h3>
            <p>{t('clubs.CommunityEvents.noEvents.message')}</p>
            <button 
              onClick={() => setActiveFilter('all')}
              className="community-events-reset-btn"
            >
              {t('clubs.CommunityEvents.noEvents.showAll')}
            </button>
          </div>
        )}

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
                      <span>{t('clubs.CommunityEvents.details.participants', { count: selectedEvent.participants })}</span>
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
                      <span>{t('clubs.CommunityEvents.modal.callUs')}</span>
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
                    <span>{t('clubs.CommunityEvents.modal.writeToUs')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showContactModal && (
          <div className="community-events-contact-modal" onClick={closeContactModal}>
            <div className="community-events-contact-content" onClick={(e) => e.stopPropagation()}>
              <button className="community-events-contact-close" onClick={closeContactModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
              
              <div className="community-events-contact-header">
                <FontAwesomeIcon icon={faComments} />
                <h3>{t('clubs.CommunityEvents.contact.title')}</h3>
                <p>{t('clubs.CommunityEvents.contact.subtitle')}</p>
              </div>
              
              {contactStatus === 'sent' ? (
                <div className="community-events-contact-success">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <h4>{t('clubs.CommunityEvents.contact.success.title')}</h4>
                  <p>{t('clubs.CommunityEvents.contact.success.message')}</p>
                </div>
              ) : contactStatus === 'error' ? (
                <div className="community-events-contact-error">
                  <FontAwesomeIcon icon={faTimes} />
                  <h4>{t('clubs.CommunityEvents.contact.error.title')}</h4>
                  <p>{t('clubs.CommunityEvents.contact.error.message')}</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="community-events-contact-form">
                  <div className="community-events-form-row">
                    <div className="community-events-form-group">
                      <label htmlFor="contact-name">
                        <FontAwesomeIcon icon={faUser} />
                        {t('clubs.CommunityEvents.contact.form.name')} *
                      </label>
                      <input
                        type="text"
                        id="contact-name"
                        value={contactForm.name}
                        onChange={(e) => handleContactChange('name', e.target.value)}
                        required
                        placeholder={t('clubs.CommunityEvents.contact.form.namePlaceholder')}
                      />
                    </div>
                    
                    <div className="community-events-form-group">
                      <label htmlFor="contact-email">
                        <FontAwesomeIcon icon={faEnvelope} />
                        {t('clubs.CommunityEvents.contact.form.email')} *
                      </label>
                      <input
                        type="email"
                        id="contact-email"
                        value={contactForm.email}
                        onChange={(e) => handleContactChange('email', e.target.value)}
                        required
                        placeholder={t('clubs.CommunityEvents.contact.form.emailPlaceholder')}
                      />
                    </div>
                  </div>
                  
                  <div className="community-events-form-row">
                    <div className="community-events-form-group">
                      <label htmlFor="contact-phone">
                        <FontAwesomeIcon icon={faPhone} />
                        {t('clubs.CommunityEvents.contact.form.phone')}
                      </label>
                      <input
                        type="tel"
                        id="contact-phone"
                        value={contactForm.phone}
                        onChange={(e) => handleContactChange('phone', e.target.value)}
                        placeholder={t('clubs.CommunityEvents.contact.form.phonePlaceholder')}
                      />
                    </div>
                    
                    <div className="community-events-form-group">
                      <label htmlFor="contact-subject">
                        <FontAwesomeIcon icon={faInfoCircle} />
                        {t('clubs.CommunityEvents.contact.form.subject')} *
                      </label>
                      <input
                        type="text"
                        id="contact-subject"
                        value={contactForm.subject}
                        onChange={(e) => handleContactChange('subject', e.target.value)}
                        required
                        placeholder={t('clubs.CommunityEvents.contact.form.subjectPlaceholder')}
                      />
                    </div>
                  </div>
                  
                  <div className="community-events-form-group">
                    <label htmlFor="contact-message">
                      <FontAwesomeIcon icon={faComments} />
                      {t('clubs.CommunityEvents.contact.form.message')} *
                    </label>
                    <textarea
                      id="contact-message"
                      value={contactForm.message}
                      onChange={(e) => handleContactChange('message', e.target.value)}
                      required
                      placeholder={t('clubs.CommunityEvents.contact.form.messagePlaceholder')}
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
                      {contactStatus === 'sending' ? 
                        t('clubs.CommunityEvents.contact.form.sending') : 
                        t('clubs.CommunityEvents.contact.form.submit')}
                    </button>
                    <button 
                      type="button" 
                      onClick={closeContactModal}
                      className="community-events-cancel-btn"
                    >
                      {t('clubs.CommunityEvents.contact.form.cancel')}
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