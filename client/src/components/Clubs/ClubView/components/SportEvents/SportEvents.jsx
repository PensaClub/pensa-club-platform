// components/SportEvents/SportEvents.jsx
import { useState } from 'react';
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

  // Проверяваме дали има необходимите данни
  if (!club?.activities?.events?.length && 
      !club?.activities?.trips?.length && 
      !club?.achievements?.awards?.length && 
      !club?.stats?.competitions) {
    return null;
  }

  // Събираме данни
  const activities = club.activities || {};
  const events = activities.events || [];
  const trips = activities.trips || [];
  const stats = club.stats || {};
  const achievements = club.achievements || {};
  const awards = achievements.awards || [];
  const recognitions = achievements.recognitions || [];
  const contacts = club.contacts || {};

  // Ако няма събития и награди, не показваме компонента
  if (events.length === 0 && trips.length === 0 && awards.length === 0) {
    return null;
  }

  // Комбинираме всички събития
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
      title: `Спортна екскурзия до ${trip.destination}`,
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

  // Филтри за събитията
  const eventFilters = [
    { key: 'all', label: 'Всички събития', icon: faTrophy, color: '#6b7280' },
    { key: 'fitness', label: 'Фитнес', icon: faRunning, color: '#ef4444' },
    { key: 'aquatic', label: 'Водни спортове', icon: faSwimmer, color: '#06b6d4' },
    { key: 'team', label: 'Отборни', icon: faUsers, color: '#f97316' },
    { key: 'outdoor', label: 'На открито', icon: faHiking, color: '#059669' },
    { key: 'competition', label: 'Състезания', icon: faMedal, color: '#8b5cf6' },
    { key: 'trip', label: 'Екскурзии', icon: faBicycle, color: '#ec4899' }
  ];

  // Helper функции
  function getSportCategory(eventName) {
    const name = eventName.toLowerCase();
    if (name.includes('плуване') || name.includes('басейн') || name.includes('водн')) return 'aquatic';
    if (name.includes('футбол') || name.includes('волейбол') || name.includes('баскетбол')) return 'team';
    if (name.includes('бягане') || name.includes('фитнес') || name.includes('маратон')) return 'fitness';
    if (name.includes('планина') || name.includes('екскурзия') || name.includes('поход')) return 'outdoor';
    if (name.includes('състезание') || name.includes('турнир') || name.includes('първенство')) return 'competition';
    return 'fitness';
  }

  function getSportIcon(eventName) {
    const name = eventName.toLowerCase();
    if (name.includes('плуване') || name.includes('басейн')) return faSwimmer;
    if (name.includes('футбол')) return faFutbol;
    if (name.includes('волейбол')) return faVolleyballBall;
    if (name.includes('баскетбол')) return faBasketballBall;
    if (name.includes('тенис')) return faTableTennis;
    if (name.includes('боулинг')) return faBowlingBall;
    if (name.includes('бягане') || name.includes('маратон')) return faRunning;
    if (name.includes('велосипед') || name.includes('колоездене')) return faBicycle;
    if (name.includes('планина') || name.includes('поход')) return faHiking;
    if (name.includes('състезание') || name.includes('турнир')) return faMedal;
    return faTrophy;
  }

  function getSportColor(eventName) {
    const name = eventName.toLowerCase();
    if (name.includes('плуване') || name.includes('басейн')) return '#06b6d4';
    if (name.includes('футбол') || name.includes('волейбол')) return '#f97316';
    if (name.includes('бягане') || name.includes('маратон')) return '#ef4444';
    if (name.includes('велосипед')) return '#8b5cf6';
    if (name.includes('планина') || name.includes('поход')) return '#059669';
    if (name.includes('състезание') || name.includes('турнир')) return '#eab308';
    return '#6b7280';
  }

  function formatEventDate(dateString) {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('bg-BG', { month: 'short' }),
      year: date.getFullYear(),
      weekday: date.toLocaleDateString('bg-BG', { weekday: 'short' })
    };
  }

  // Филтрираме събитията
  const filteredEvents = allEvents.filter(event => {
    return activeFilter === 'all' || event.category === activeFilter || event.type === activeFilter;
  });

  // Разделяме на предстоящи и минали
  const upcomingEvents = filteredEvents.filter(event => event.isUpcoming);
  const pastEvents = filteredEvents.filter(event => !event.isUpcoming);

  // Register form handlers
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
      const subject = encodeURIComponent(`Заявка за участие - ${selectedEvent.title}`);
      const body = encodeURIComponent(`
Здравейте,

Получихте нова заявка за участие в спортно събитие:

СЪБИТИЕ: ${selectedEvent.title}
Дата: ${new Date(selectedEvent.date).toLocaleDateString('bg-BG')}
${selectedEvent.time ? `Час: ${selectedEvent.time}` : ''}
Тип: ${eventFilters.find(f => f.key === selectedEvent.category)?.label || 'Спортно събитие'}
${selectedEvent.price ? `Цена: ${selectedEvent.price} лв.` : ''}

ДАННИ НА УЧАСТНИКА:
Име: ${registerForm.name}
Имейл: ${registerForm.email}
Телефон: ${registerForm.phone}
Спортен опит: ${registerForm.experience || 'Не е посочен'}
Категория участие: ${registerForm.category || 'Стандартна'}
Допълнителни бележки: ${registerForm.notes || 'Няма'}

Моля, свържете се с участника за потвърждение на регистрацията.

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

  // Статистики за събитията
  const eventStats = [
    {
      icon: faTrophy,
      value: allEvents.length,
      label: 'Общо събития',
      color: '#f97316'
    },
    {
      icon: faCalendarAlt,
      value: upcomingEvents.length,
      label: 'Предстоящи',
      color: '#22c55e'
    },
    {
      icon: faMedal,
      value: stats.competitions || pastEvents.filter(e => e.category === 'competition').length,
      label: 'Състезания',
      color: '#8b5cf6'
    },
    {
      icon: faAward,
      value: awards.length,
      label: 'Награди',
      color: '#eab308'
    }
  ];

  return (
    <section id="sport-events" className="sport-events-section">
      <div className="sport-events-container">
        
        {/* Header */}
        <div className="sport-events-header">
          <div className="sport-events-badge">
            <FontAwesomeIcon icon={faTrophy} />
            <span>Спортни събития</span>
          </div>
          <h2 className="sport-events-title">
            Състезания, турнири и спортни празници
          </h2>
          <p className="sport-events-subtitle">
            Участвайте в нашите спортни събития и покажете своите умения
          </p>
        </div>

        {/* Event Stats */}
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

        {/* Event Filters */}
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

        {/* Events Content */}
        <div className="sport-events-content">
          
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="sport-events-upcoming">
              <div className="sport-events-section-header">
                <h3>
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  Предстоящи събития
                </h3>
                <p>Регистрирайте се за участие в нашите спортни събития</p>
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
                            Предстоящо
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
                              <span>{event.participants} участници</span>
                            </div>
                          )}
                          {event.price && (
                            <div className="sport-events-card-detail price">
                              <FontAwesomeIcon icon={faTicketAlt} />
                              <span>{event.price} лв.</span>
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
                          <span>Регистрирай се</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Events & Achievements */}
          {(pastEvents.length > 0 || awards.length > 0) && (
            <div className="sport-events-achievements">
              <div className="sport-events-section-header">
                <h3>
                  <FontAwesomeIcon icon={faMedal} />
                  Постижения и награди
                </h3>
                <p>Нашите спортни успехи и признания</p>
              </div>
              
              {/* Awards */}
              {awards.length > 0 && (
                <div className="sport-events-awards">
                  <h4>
                    <FontAwesomeIcon icon={faAward} />
                    Получени награди
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

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <div className="sport-events-past">
                  <h4>
                    <FontAwesomeIcon icon={faClock} />
                    Проведени събития
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
                                  {event.participants} участници
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

              {/* Recognitions */}
              {recognitions.length > 0 && (
                <div className="sport-events-recognitions">
                  <h4>
                    <FontAwesomeIcon icon={faStar} />
                    Признания
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

          {/* No Events */}
          {filteredEvents.length === 0 && (
            <div className="sport-events-no-results">
              <FontAwesomeIcon icon={faInfoCircle} />
              <h4>Няма събития в тази категория</h4>
              <p>Изберете друга категория или следете за нови спортни събития</p>
            </div>
          )}
        </div>
      </div>

      {/* Register Modal */}
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
              <h3>Регистрация за {selectedEvent?.title}</h3>
              <p>Попълнете формата за да се регистрирате за това събитие</p>
            </div>
            
            {registerStatus === 'sent' ? (
              <div className="sport-events-form-success">
                <FontAwesomeIcon icon={faCheckCircle} />
                <h4>Регистрацията е изпратена успешно!</h4>
                <p>Благодарим ви! Ще се свържем с вас за потвърждение на участието.</p>
              </div>
            ) : registerStatus === 'error' ? (
              <div className="sport-events-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>Възникна грешка</h4>
                <p>Моля опитайте отново или се свържете с нас директно.</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="sport-events-form">
                {selectedEvent && (
                  <div className="sport-events-selected-event">
                    <h4>Избрано събитие:</h4>
                    <div className="sport-events-event-summary">
                      <FontAwesomeIcon icon={selectedEvent.icon} />
                      <div>
                        <strong>{selectedEvent.title}</strong>
                        <span>{new Date(selectedEvent.date).toLocaleDateString('bg-BG')}</span>
                        {selectedEvent.time && <span>{selectedEvent.time}</span>}
                        {selectedEvent.price && <span>Цена: {selectedEvent.price} лв.</span>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="sport-events-form-row">
                  <div className="sport-events-form-group">
                    <label htmlFor="register-name">
                      <FontAwesomeIcon icon={faUser} />
                      Вашето име *
                    </label>
                    <input
                      type="text"
                      id="register-name"
                      value={registerForm.name}
                      onChange={(e) => handleRegisterChange('name', e.target.value)}
                      required
                      placeholder="Въведете вашето име"
                    />
                  </div>
                  
                  <div className="sport-events-form-group">
                    <label htmlFor="register-email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      Имейл адрес *
                    </label>
                    <input
                      type="email"
                      id="register-email"
                      value={registerForm.email}
                      onChange={(e) => handleRegisterChange('email', e.target.value)}
                      required
                      placeholder="Въведете вашия имейл"
                    />
                  </div>
                </div>
                
                <div className="sport-events-form-row">
                  <div className="sport-events-form-group">
                    <label htmlFor="register-phone">
                      <FontAwesomeIcon icon={faMobile} />
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      id="register-phone"
                      value={registerForm.phone}
                      onChange={(e) => handleRegisterChange('phone', e.target.value)}
                      required
                      placeholder="Въведете вашия телефон"
                    />
                  </div>
                  
                  <div className="sport-events-form-group">
                    <label htmlFor="register-experience">
                      <FontAwesomeIcon icon={faTrophy} />
                      Спортен опит
                    </label>
                    <select
                      id="register-experience"
                      value={registerForm.experience}
                      onChange={(e) => handleRegisterChange('experience', e.target.value)}
                    >
                      <option value="">Изберете ниво</option>
                      <option value="Начинаещ">Начинаещ</option>
                      <option value="Средно ниво">Средно ниво</option>
                      <option value="Напреднал">Напреднал</option>
                      <option value="Професионален">Професионален</option>
                    </select>
                  </div>
                </div>
                
                <div className="sport-events-form-group">
                  <label htmlFor="register-category">
                    <FontAwesomeIcon icon={faFlag} />
                    Категория участие
                  </label>
                  <select
                    id="register-category"
                    value={registerForm.category}
                    onChange={(e) => handleRegisterChange('category', e.target.value)}
                  >
                    <option value="">Изберете категория</option>
                    <option value="Индивидуално">Индивидуално участие</option>
                    <option value="Отборно">Отборно участие</option>
                    <option value="Семейно">Семейно участие</option>
                    <option value="Приятелско">Приятелско участие</option>
                  </select>
                </div>
                
                <div className="sport-events-form-group">
                  <label htmlFor="register-notes">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Допълнителни бележки
                  </label>
                  <textarea
                    id="register-notes"
                    value={registerForm.notes}
                    onChange={(e) => handleRegisterChange('notes', e.target.value)}
                    placeholder="Споменете ако имате въпроси или специални изисквания"
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
                    {registerStatus === 'sending' ? 'Изпраща се...' : 'Изпрати регистрацията'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowRegisterModal(false)}
                    className="sport-events-cancel-btn"
                  >
                    Отказ
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