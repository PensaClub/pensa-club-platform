import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrophy,
  faCalendarAlt,
  faMapMarkerAlt,
  faUsers,
  faClock,
  faAward,
  faMedal,
  faFire,
  faRunning,
  faSwimmer,
  faBicycle,
  faHiking,
  faFutbol,
  faTableTennis,
  faVolleyballBall,
  faBasketballBall,
  faBowlingBall,
  faCheckCircle,
  faExclamationTriangle,
  faPaperPlane,
  faEnvelope,
  faMobile,
  faUser,
  faTimes,
  faPlus,
  faEye,
  faFilter,
  faChevronLeft,
  faChevronRight,
  faStar,
  faFlag,
  faCrown,
  faGift,
  faInfoCircle,
  faTicketAlt,
  faHandPaper
} from '@fortawesome/free-solid-svg-icons';
import './sportEvents.css';

export const SportEvents = ({ club }) => {
  const { t, i18n } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    category: '',
    notes: ''
  });
  const [registerStatus, setRegisterStatus] = useState(null);

  if (!club?.activities?.events?.length && 
      !club?.activities?.trips?.length && 
      !club?.achievements?.awards?.length && 
      !club?.stats?.competitions) {
    return null;
  }

  const activities = club.activities || {};
  const events = activities.events || [];
  const trips = activities.trips || [];
  const stats = club.stats || {};
  const achievements = club.achievements || {};
  const awards = achievements.awards || [];
  const recognitions = achievements.recognitions || [];
  const contacts = club.contacts || {};

  if (events.length === 0 && trips.length === 0 && awards.length === 0) {
    return null;
  }

  const getSportCategory = (eventName) => {
    const name = eventName.toLowerCase();
    const categoryTerms = t('clubs.SportEvents.categoryTerms', { returnObjects: true });
    
    for (const [categoryKey, terms] of Object.entries(categoryTerms)) {
      if (terms.some(term => name.includes(term))) {
        return categoryKey;
      }
    }
    return 'fitness';
  };

  const getSportIcon = (eventName) => {
    const name = eventName.toLowerCase();
    const iconTerms = t('clubs.SportEvents.iconTerms', { returnObjects: true });
    
    for (const [iconKey, terms] of Object.entries(iconTerms)) {
      if (terms.some(term => name.includes(term))) {
        const iconMap = {
          swimming: faSwimmer,
          football: faFutbol,
          volleyball: faVolleyballBall,
          basketball: faBasketballBall,
          tennis: faTableTennis,
          bowling: faBowlingBall,
          running: faRunning,
          cycling: faBicycle,
          hiking: faHiking,
          competition: faMedal
        };
        return iconMap[iconKey] || faTrophy;
      }
    }
    return faTrophy;
  };

  const getSportColor = (eventName) => {
    const name = eventName.toLowerCase();
    const colorTerms = t('clubs.SportEvents.colorTerms', { returnObjects: true });
    
    for (const [colorKey, terms] of Object.entries(colorTerms)) {
      if (terms.some(term => name.includes(term))) {
        const colorMap = {
          aquatic: '#06b6d4',
          team: '#f97316',
          running: '#ef4444',
          cycling: '#8b5cf6',
          outdoor: '#059669',
          competition: '#eab308'
        };
        return colorMap[colorKey] || '#6b7280';
      }
    }
    return '#6b7280';
  };

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'de' ? 'de-DE' : 'en-US';
    
    return {
      day: date.getDate(),
      month: date.toLocaleDateString(locale, { month: 'short' }),
      year: date.getFullYear(),
      weekday: date.toLocaleDateString(locale, { weekday: 'short' })
    };
  };

  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'de' ? 'de-DE' : 'en-US';
    
    return date.toLocaleDateString(locale);
  };

  const allEvents = [
    ...events.map(event => ({
      ...event,
      type: 'competition',
      category: getSportCategory(event.title || event.type),
      icon: getSportIcon(event.title || event.type),
      color: getSportColor(event.title || event.type),
      isUpcoming: new Date(event.date) > new Date()
    })),
    ...trips.map(trip => ({
      id: `trip-${trip.destination}`,
      title: t('clubs.SportEvents.tripTitle', { destination: trip.destination }),
      date: trip.date,
      description: trip.description,
      participants: trip.participants,
      price: trip.price,
      type: 'trip',
      category: 'outdoor',
      icon: faHiking,
      color: '#059669',
      isUpcoming: new Date(trip.date) > new Date()
    }))
  ];

  const getEventFilters = () => [
    { key: 'all', label: t('clubs.SportEvents.filters.all'), icon: faTrophy, color: '#6b7280' },
    { key: 'fitness', label: t('clubs.SportEvents.filters.fitness'), icon: faRunning, color: '#ef4444' },
    { key: 'aquatic', label: t('clubs.SportEvents.filters.aquatic'), icon: faSwimmer, color: '#06b6d4' },
    { key: 'team', label: t('clubs.SportEvents.filters.team'), icon: faUsers, color: '#f97316' },
    { key: 'outdoor', label: t('clubs.SportEvents.filters.outdoor'), icon: faHiking, color: '#059669' },
    { key: 'competition', label: t('clubs.SportEvents.filters.competition'), icon: faMedal, color: '#8b5cf6' },
    { key: 'trip', label: t('clubs.SportEvents.filters.trip'), icon: faBicycle, color: '#ec4899' }
  ];

  const eventFilters = getEventFilters();

  const filteredEvents = allEvents.filter(event => {
    return activeFilter === 'all' || event.category === activeFilter || event.type === activeFilter;
  });

  const upcomingEvents = filteredEvents.filter(event => event.isUpcoming);
  const pastEvents = filteredEvents.filter(event => !event.isUpcoming);

  const getExperienceLevels = () => [
    { value: '', label: t('clubs.SportEvents.experienceLevels.select') },
    { value: 'Начинаещ', label: t('clubs.SportEvents.experienceLevels.beginner') },
    { value: 'Средно ниво', label: t('clubs.SportEvents.experienceLevels.intermediate') },
    { value: 'Напреднал', label: t('clubs.SportEvents.experienceLevels.advanced') },
    { value: 'Професионален', label: t('clubs.SportEvents.experienceLevels.professional') }
  ];

  const getParticipationCategories = () => [
    { value: '', label: t('clubs.SportEvents.participationCategories.select') },
    { value: 'Индивидуално', label: t('clubs.SportEvents.participationCategories.individual') },
    { value: 'Отборно', label: t('clubs.SportEvents.participationCategories.team') },
    { value: 'Семейно', label: t('clubs.SportEvents.participationCategories.family') },
    { value: 'Приятелско', label: t('clubs.SportEvents.participationCategories.friends') }
  ];

  const experienceLevels = getExperienceLevels();
  const participationCategories = getParticipationCategories();

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
      const categoryLabel = eventFilters.find(f => f.key === selectedEvent.category)?.label || t('clubs.SportEvents.defaultEventType');
      const subject = encodeURIComponent(t('clubs.SportEvents.registerEmail.subject', { 
        eventTitle: selectedEvent.title 
      }));
      const body = encodeURIComponent(t('clubs.SportEvents.registerEmail.body', {
        eventTitle: selectedEvent.title,
        date: formatFullDate(selectedEvent.date),
        time: selectedEvent.time || '',
        type: categoryLabel,
        price: selectedEvent.price || '',
        currency: t('clubs.SportEvents.currency'),
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone,
        experience: registerForm.experience || t('clubs.SportEvents.registerEmail.notSpecified'),
        category: registerForm.category || t('clubs.SportEvents.registerEmail.standard'),
        notes: registerForm.notes || t('clubs.SportEvents.registerEmail.none'),
        clubName: club.name
      }));
      
      try {
        window.location.href = `mailto:${contacts.email}?subject=${subject}&body=${body}`;
        setRegisterStatus('sent');
        setTimeout(() => {
          setShowRegisterModal(false);
          setRegisterStatus(null);
          setSelectedEvent(null);
          setRegisterForm({ name: '', email: '', phone: '', experience: '', category: '', notes: '' });
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

  const eventStats = [
    {
      icon: faTrophy,
      value: allEvents.length,
      label: t('clubs.SportEvents.stats.totalEvents'),
      color: '#f97316'
    },
    {
      icon: faCalendarAlt,
      value: upcomingEvents.length,
      label: t('clubs.SportEvents.stats.upcoming'),
      color: '#22c55e'
    },
    {
      icon: faMedal,
      value: stats.competitions || pastEvents.filter(e => e.category === 'competition').length,
      label: t('clubs.SportEvents.stats.competitions'),
      color: '#8b5cf6'
    },
    {
      icon: faAward,
      value: awards.length,
      label: t('clubs.SportEvents.stats.awards'),
      color: '#eab308'
    }
  ];

  return (
    <section id="sport-events" className="sport-events-section">
      <div className="sport-events-container">
        
        <div className="sport-events-header">
          <div className="sport-events-badge">
            <FontAwesomeIcon icon={faTrophy} />
            <span>{t('clubs.SportEvents.header.badge')}</span>
          </div>
          <h2 className="sport-events-title">
            {t('clubs.SportEvents.header.title')}
          </h2>
          <p className="sport-events-subtitle">
            {t('clubs.SportEvents.header.subtitle')}
          </p>
        </div>

        <div className="sport-events-stats">
          {eventStats.map((stat, index) => (
            <div 
              key={index}
              className="sport-events-stat-card"
              style={{ '--stat-color': stat.color, '--stat-delay': `${index * 0.1}s` }}
            >
              <div className="sport-events-stat-icon">
                <FontAwesomeIcon icon={stat.icon} />
              </div>
              <div className="sport-events-stat-content">
                <div className="sport-events-stat-value">{stat.value}</div>
                <div className="sport-events-stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="sport-events-filters">
          {eventFilters.map(filter => {
            const count = filter.key === 'all' ? allEvents.length : 
                         allEvents.filter(e => e.category === filter.key || e.type === filter.key).length;
            
            return count > 0 && (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`sport-events-filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
                style={{ '--filter-color': filter.color }}
              >
                <FontAwesomeIcon icon={filter.icon} />
                <span>{filter.label}</span>
                <div className="sport-events-filter-count">{count}</div>
              </button>
            );
          })}
        </div>

        <div className="sport-events-content">
          
          {upcomingEvents.length > 0 && (
            <div className="sport-events-upcoming">
              <div className="sport-events-section-header">
                <h3>
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  {t('clubs.SportEvents.upcomingEvents.title')}
                </h3>
                <p>{t('clubs.SportEvents.upcomingEvents.subtitle')}</p>
              </div>
              
              <div className="sport-events-grid">
                {upcomingEvents.map((event, index) => {
                  const eventDate = formatEventDate(event.date);
                  return (
                    <div 
                      key={event.id || index} 
                      className="sport-events-card upcoming"
                      style={{ 
                        '--event-color': event.color,
                        '--event-delay': `${index * 0.1}s` 
                      }}
                    >
                      <div className="sport-events-card-header">
                        <div className="sport-events-card-date">
                          <div className="sport-events-date-day">{eventDate.day}</div>
                          <div className="sport-events-date-month">{eventDate.month}</div>
                          <div className="sport-events-date-year">{eventDate.year}</div>
                        </div>
                        <div className="sport-events-card-icon">
                          <FontAwesomeIcon icon={event.icon} />
                        </div>
                        <div className="sport-events-card-status">
                          <span className="sport-events-upcoming-badge">
                            {t('clubs.SportEvents.badges.upcoming')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="sport-events-card-content">
                        <h4>{event.title}</h4>
                        {event.description && (
                          <p className="sport-events-card-description">
                            {event.description}
                          </p>
                        )}
                        
                        <div className="sport-events-card-details">
                          {event.time && (
                            <div className="sport-events-card-detail">
                              <FontAwesomeIcon icon={faClock} />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {event.participants && (
                            <div className="sport-events-card-detail">
                              <FontAwesomeIcon icon={faUsers} />
                              <span>{t('clubs.SportEvents.participants', { count: event.participants })}</span>
                            </div>
                          )}
                          {event.price && (
                            <div className="sport-events-card-detail price">
                              <FontAwesomeIcon icon={faTicketAlt} />
                              <span>{event.price} {t('clubs.SportEvents.currency')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="sport-events-card-footer">
                        <button 
                          onClick={() => openRegisterModal(event)}
                          className="sport-events-register-btn"
                        >
                          <FontAwesomeIcon icon={faHandPaper} />
                          <span>{t('clubs.SportEvents.actions.register')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(pastEvents.length > 0 || awards.length > 0) && (
            <div className="sport-events-achievements">
              <div className="sport-events-section-header">
                <h3>
                  <FontAwesomeIcon icon={faMedal} />
                  {t('clubs.SportEvents.achievements.title')}
                </h3>
                <p>{t('clubs.SportEvents.achievements.subtitle')}</p>
              </div>
              
              {awards.length > 0 && (
                <div className="sport-events-awards">
                  <h4>
                    <FontAwesomeIcon icon={faAward} />
                    {t('clubs.SportEvents.achievements.awardsReceived')}
                  </h4>
                  <div className="sport-events-awards-grid">
                    {awards.map((award, index) => (
                      <div 
                        key={index} 
                        className="sport-events-award-card"
                        style={{ '--award-delay': `${index * 0.1}s` }}
                      >
                        <div className="sport-events-award-icon">
                          <FontAwesomeIcon icon={faCrown} />
                        </div>
                        <div className="sport-events-award-content">
                          <h5>{award.name}</h5>
                          <div className="sport-events-award-details">
                            <span className="sport-events-award-year">{award.year}</span>
                            <span className="sport-events-award-by">{award.awardedBy}</span>
                          </div>
                          {award.description && (
                            <p>{award.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pastEvents.length > 0 && (
                <div className="sport-events-past">
                  <h4>
                    <FontAwesomeIcon icon={faClock} />
                    {t('clubs.SportEvents.achievements.pastEvents')}
                  </h4>
                  <div className="sport-events-past-list">
                    {pastEvents.slice(0, 6).map((event, index) => {
                      const eventDate = formatEventDate(event.date);
                      return (
                        <div 
                          key={event.id || index} 
                          className="sport-events-past-item"
                          style={{ '--past-delay': `${index * 0.05}s` }}
                        >
                          <div className="sport-events-past-icon">
                            <FontAwesomeIcon icon={event.icon} />
                          </div>
                          <div className="sport-events-past-content">
                            <h6>{event.title}</h6>
                            <div className="sport-events-past-meta">
                              <span>{eventDate.day} {eventDate.month} {eventDate.year}</span>
                              {event.participants && (
                                <span>
                                  <FontAwesomeIcon icon={faUsers} />
                                  {t('clubs.SportEvents.participants', { count: event.participants })}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="sport-events-past-status">
                            <FontAwesomeIcon icon={faCheckCircle} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {recognitions.length > 0 && (
                <div className="sport-events-recognitions">
                  <h4>
                    <FontAwesomeIcon icon={faStar} />
                    {t('clubs.SportEvents.achievements.recognitions')}
                  </h4>
                  <div className="sport-events-recognitions-list">
                    {recognitions.map((recognition, index) => (
                      <div 
                        key={index} 
                        className="sport-events-recognition-item"
                        style={{ '--recognition-delay': `${index * 0.1}s` }}
                      >
                        <FontAwesomeIcon icon={faGift} />
                        <span>{recognition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {filteredEvents.length === 0 && (
            <div className="sport-events-no-results">
              <FontAwesomeIcon icon={faInfoCircle} />
              <h4>{t('clubs.SportEvents.noResults.title')}</h4>
              <p>{t('clubs.SportEvents.noResults.message')}</p>
            </div>
          )}
        </div>
      </div>

      {showRegisterModal && (
        <div className="sport-events-modal" onClick={() => setShowRegisterModal(false)}>
          <div className="sport-events-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="sport-events-modal-close" 
              onClick={() => setShowRegisterModal(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="sport-events-modal-header">
              <FontAwesomeIcon icon={faTrophy} />
              <h3>{t('clubs.SportEvents.registerModal.title', { eventTitle: selectedEvent?.title })}</h3>
              <p>{t('clubs.SportEvents.registerModal.subtitle')}</p>
            </div>
            
            {registerStatus === 'sent' ? (
              <div className="sport-events-form-success">
                <FontAwesomeIcon icon={faCheckCircle} />
                <h4>{t('clubs.SportEvents.registerModal.success.title')}</h4>
                <p>{t('clubs.SportEvents.registerModal.success.message')}</p>
              </div>
            ) : registerStatus === 'error' ? (
              <div className="sport-events-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>{t('clubs.SportEvents.registerModal.error.title')}</h4>
                <p>{t('clubs.SportEvents.registerModal.error.message')}</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="sport-events-form">
                {selectedEvent && (
                  <div className="sport-events-selected-event">
                    <h4>{t('clubs.SportEvents.registerModal.selectedEvent')}:</h4>
                    <div className="sport-events-event-summary">
                      <FontAwesomeIcon icon={selectedEvent.icon} />
                      <div>
                        <strong>{selectedEvent.title}</strong>
                        <span>{formatFullDate(selectedEvent.date)}</span>
                        {selectedEvent.time && <span>{selectedEvent.time}</span>}
                        {selectedEvent.price && <span>{t('clubs.SportEvents.registerModal.price')}: {selectedEvent.price} {t('clubs.SportEvents.currency')}</span>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="sport-events-form-row">
                  <div className="sport-events-form-group">
                    <label htmlFor="register-name">
                      <FontAwesomeIcon icon={faUser} />
                      {t('clubs.SportEvents.registerModal.form.name')} *
                    </label>
                    <input
                      type="text"
                      id="register-name"
                      value={registerForm.name}
                      onChange={(e) => handleRegisterChange('name', e.target.value)}
                      required
                      placeholder={t('clubs.SportEvents.registerModal.form.namePlaceholder')}
                    />
                  </div>
                  
                  <div className="sport-events-form-group">
                    <label htmlFor="register-email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.SportEvents.registerModal.form.email')} *
                    </label>
                    <input
                      type="email"
                      id="register-email"
                      value={registerForm.email}
                      onChange={(e) => handleRegisterChange('email', e.target.value)}
                      required
                      placeholder={t('clubs.SportEvents.registerModal.form.emailPlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="sport-events-form-row">
                  <div className="sport-events-form-group">
                    <label htmlFor="register-phone">
                      <FontAwesomeIcon icon={faMobile} />
                      {t('clubs.SportEvents.registerModal.form.phone')} *
                    </label>
                    <input
                      type="tel"
                      id="register-phone"
                      value={registerForm.phone}
                      onChange={(e) => handleRegisterChange('phone', e.target.value)}
                      required
                      placeholder={t('clubs.SportEvents.registerModal.form.phonePlaceholder')}
                    />
                  </div>
                  
                  <div className="sport-events-form-group">
                    <label htmlFor="register-experience">
                      <FontAwesomeIcon icon={faTrophy} />
                      {t('clubs.SportEvents.registerModal.form.experience')}
                    </label>
                    <select
                      id="register-experience"
                      value={registerForm.experience}
                      onChange={(e) => handleRegisterChange('experience', e.target.value)}
                    >
                      {experienceLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="sport-events-form-group">
                  <label htmlFor="register-category">
                    <FontAwesomeIcon icon={faFlag} />
                    {t('clubs.SportEvents.registerModal.form.category')}
                  </label>
                  <select
                    id="register-category"
                    value={registerForm.category}
                    onChange={(e) => handleRegisterChange('category', e.target.value)}
                  >
                    {participationCategories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="sport-events-form-group">
                  <label htmlFor="register-notes">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    {t('clubs.SportEvents.registerModal.form.notes')}
                  </label>
                  <textarea
                    id="register-notes"
                    value={registerForm.notes}
                    onChange={(e) => handleRegisterChange('notes', e.target.value)}
                    placeholder={t('clubs.SportEvents.registerModal.form.notesPlaceholder')}
                    rows="3"
                  />
                </div>
                
                <div className="sport-events-form-actions">
                  <button 
                    type="submit" 
                    className="sport-events-submit-btn"
                    disabled={registerStatus === 'sending'}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {registerStatus === 'sending' ? 
                      t('clubs.SportEvents.registerModal.form.sending') : 
                      t('clubs.SportEvents.registerModal.form.submit')}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowRegisterModal(false)}
                    className="sport-events-cancel-btn"
                  >
                    {t('clubs.SportEvents.registerModal.form.cancel')}
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

export default SportEvents;