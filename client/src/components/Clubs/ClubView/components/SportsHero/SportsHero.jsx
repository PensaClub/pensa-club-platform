import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRunning,
  faDumbbell,
  faHeartbeat,
  faTrophy,
  faUsers,
  faCalendarAlt,
  faPlay,
  faChartLine,
  faFire,
  faStopwatch,
  faMedal,
  faArrowRight,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faAward,
  faBolt,
  faLeaf,
  faShieldAlt,
  faTimes,
  faUser,
  faCheckCircle,
  faExclamationTriangle,
  faPaperPlane,
  faFlag,
    faUserFriends,
  faIdCard,
  faAddressCard,
  faCopy
} from '@fortawesome/free-solid-svg-icons';
import './sportsHero.css';

export const SportsHero = ({ club }) => {
  const [activeVideo, setActiveVideo] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [enrollForm, setEnrollForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    experience: '',
    healthConditions: ''
  });
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [copiedItems, setCopiedItems] = useState({});
  const [contactStatus, setContactStatus] = useState(null);
  const [enrollStatus, setEnrollStatus] = useState(null);

  // Проверяваме дали има необходимите данни
  if (!club?.name && !club?.shortDescription && !club?.stats && !club?.activities) {
    return null;
  }

  // Събираме спортни данни
  const stats = club.stats || {};
  const activities = club.activities || {};
  const regularActivities = activities.regular || [];
  const contacts = club.contacts || {};
  const achievements = club.achievements || {};
  const media = club.media || {};
  const videos = media.videos || [];
  const location = club.location || {};

  // Ако няма основни данни, не показваме компонента
  if (!club.name && !club.shortDescription) {
    return null;
  }

  // Спортни статистики
  const sportsStats = [
    {
      icon: faUsers,
      value: stats.totalMembers || club.membership?.totalMembers || 0,
      label: 'Активни членове',
      color: '#22c55e'
    },
    {
      icon: faDumbbell,
      value: stats.programs || regularActivities.length || 0,
      label: 'Програми',
      color: '#f97316'
    },
    {
      icon: faTrophy,
      value: stats.competitions || stats.events || 0,
      label: 'Състезания',
      color: '#3b82f6'
    },
    {
      icon: faStopwatch,
      value: stats.avgWeeklyWorkouts || stats.yearsActive || 0,
      label: stats.avgWeeklyWorkouts ? 'Тренировки/седмица' : 'Години активност',
      color: '#8b5cf6'
    }
  ];

  // Highlights на популярни активности
  const popularActivities = regularActivities.slice(0, 3).map(activity => ({
    name: activity.name,
    participants: activity.participants || 0,
    day: activity.day,
    time: activity.time,
    description: activity.description,
    instructor: activity.instructor,
    icon: getActivityIcon(activity.name)
  }));

  // Helper функция за икони на активности
  function getActivityIcon(activityName) {
    const name = activityName.toLowerCase();
    if (name.includes('йога') || name.includes('медитация')) return faLeaf;
    if (name.includes('аеробика') || name.includes('басейн')) return faHeartbeat;
    if (name.includes('силов') || name.includes('фитнес')) return faDumbbell;
    if (name.includes('разходки') || name.includes('бягане')) return faRunning;
    if (name.includes('танц')) return faFire;
    return faFlag;
  }

  // Contact form handlers
  const handleContactChange = (field, value) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactStatus('sending');

    if (contacts.email) {
      const subject = encodeURIComponent(`Запитване от ${contactForm.name} - ${club.name}`);
      const body = encodeURIComponent(`
Здравейте,

Получихте ново съобщение от сайта:

Име: ${contactForm.name}
Имейл: ${contactForm.email}
Телефон: ${contactForm.phone}

Съобщение:
${contactForm.message}

---
Изпратено от сайта на ${club.name}
      `);
      
      try {
        window.location.href = `mailto:${contacts.email}?subject=${subject}&body=${body}`;
        setContactStatus('sent');
        setTimeout(() => {
          setShowContactModal(false);
          setContactStatus(null);
          setContactForm({ name: '', email: '', phone: '', message: '' });
        }, 2000);
      } catch (error) {
        setContactStatus('error');
      }
    } else {
      setContactStatus('error');
    }
  };

  // Enroll form handlers
  const handleEnrollChange = (field, value) => {
    setEnrollForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEnrollSubmit = (e) => {
    e.preventDefault();
    setEnrollStatus('sending');

    if (contacts.email && selectedProgram) {
      const subject = encodeURIComponent(`Заявка за записване - ${selectedProgram.name}`);
      const body = encodeURIComponent(`
Здравейте,

Получихте нова заявка за записване в програма:

ПРОГРАМА: ${selectedProgram.name}
Ден: ${selectedProgram.day}
Час: ${selectedProgram.time}
Инструктор: ${selectedProgram.instructor || 'Не е посочен'}

ДАННИ НА КАНДИДАТА:
Име: ${enrollForm.name}
Имейл: ${enrollForm.email}
Телефон: ${enrollForm.phone}
Възраст: ${enrollForm.age}
Опит в спорта: ${enrollForm.experience}
Здравословни проблеми: ${enrollForm.healthConditions || 'Няма'}

Моля, свържете се с кандидата за финализиране на записването.

---
Изпратено от сайта на ${club.name}
      `);
      
      try {
        window.location.href = `mailto:${contacts.email}?subject=${subject}&body=${body}`;
        setEnrollStatus('sent');
        setTimeout(() => {
          setShowEnrollModal(false);
          setEnrollStatus(null);
          setSelectedProgram(null);
          setEnrollForm({ name: '', email: '', phone: '', age: '', experience: '', healthConditions: '' });
        }, 2000);
      } catch (error) {
        setEnrollStatus('error');
      }
    } else {
      setEnrollStatus('error');
    }
  };

  const openEnrollModal = (program) => {
    setSelectedProgram(program);
    setShowEnrollModal(true);
  };

  const playVideo = (video) => {
    setActiveVideo(video);
  };

  const closeVideo = () => {
    setActiveVideo(null);
  };

const members = club.members || [];
const copyMemberData = async (data, type, memberName) => {
  try {
    await navigator.clipboard.writeText(data);
    setCopiedItems(prev => ({
      ...prev,
      [`${memberName}-${type}`]: true
    }));
    setTimeout(() => {
      setCopiedItems(prev => {
        const newState = { ...prev };
        delete newState[`${memberName}-${type}`];
        return newState;
      });
    }, 2000);
  } catch (error) {
    console.error('Грешка при копиране:', error);
  }
};

  return (
    <section id="sports-hero" className="sports-hero-section">
      <div className="sports-hero-container">
        
        {/* Main Hero Content */}
        <div className="sports-hero-content">
          <div className="sports-hero-text">
            <div className="sports-hero-badge">
              <FontAwesomeIcon icon={faBolt} />
              <span>Активно стареене</span>
            </div>
            
            <h1 className="sports-hero-title">
              {club.name}
            </h1>
            
            <p className="sports-hero-description">
              {club.shortDescription || club.fullDescription}
            </p>

            {/* Action Buttons */}
            <div className="sports-hero-actions">
              <button 
                onClick={() => setShowContactModal(true)}
                className="sports-hero-btn primary"
              >
                <FontAwesomeIcon icon={faEnvelope} />
                <span>Пишете ни</span>
              </button>
              {contacts.phone && (
                <a href={`tel:${contacts.phone}`} className="sports-hero-btn secondary">
                  <FontAwesomeIcon icon={faPhone} />
                  <span>Обади се</span>
                </a>
              )}
            </div>

            {/* Quick Info */}
            <div className="sports-hero-quick-info">
              {location.address && (
                <div className="sports-hero-info-item">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span>{location.address}</span>
                </div>
              )}
              {contacts.workingHours?.monday && (
                <div className="sports-hero-info-item">
                  <FontAwesomeIcon icon={faStopwatch} />
                  <span>Отворено: {contacts.workingHours.monday}</span>
                </div>
              )}
            </div>
          </div>

          {/* Hero Visual */}
          <div className="sports-hero-visual">
            {club.mainImage ? (
              <div className="sports-hero-image-container">
                <img 
                  src={club.mainImage} 
                  alt={club.name}
                  className="sports-hero-image"
                />
                <div className="sports-hero-image-overlay">
                  <div className="sports-hero-achievement">
                    <FontAwesomeIcon icon={faAward} />
                    <span>
                      {achievements.awards?.[0]?.name || 
                       achievements.recognitions?.[0] || 
                       'Сертифициран спортен клуб'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="sports-hero-placeholder">
                <FontAwesomeIcon icon={faRunning} />
                <h3>Спорт за всички</h3>
                <p>Заедно към по-здравословен живот</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        {sportsStats.some(stat => stat.value > 0) && (
          <div className="sports-hero-stats">
            {sportsStats.map((stat, index) => (
              <div 
                key={index}
                className="sports-hero-stat-card"
                style={{ '--stat-color': stat.color, '--stat-delay': `${index * 0.1}s` }}
              >
                <div className="sports-hero-stat-icon">
                  <FontAwesomeIcon icon={stat.icon} />
                </div>
                <div className="sports-hero-stat-content">
                  <div className="sports-hero-stat-value">{stat.value}</div>
                  <div className="sports-hero-stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
{members.length > 0 && (
  <button 
    onClick={() => setShowMembersModal(true)}
    className="sports-hero-btn secondary"
  >
    <FontAwesomeIcon icon={faUserFriends} />
    <span>Членове ({members.length})</span>
  </button>
)}
        {/* Popular Activities */}
        {popularActivities.length > 0 && (
          <div className="sports-hero-activities">
            <h3 className="sports-hero-activities-title">
              <FontAwesomeIcon icon={faFire} />
              Популярни програми
            </h3>
            <div className="sports-hero-activities-grid">
              {popularActivities.map((activity, index) => (
                <div 
                  key={index}
                  className="sports-hero-activity-card"
                  style={{ '--activity-delay': `${index * 0.15}s` }}
                >
                  <div className="sports-hero-activity-icon">
                    <FontAwesomeIcon icon={activity.icon} />
                  </div>
                  <div className="sports-hero-activity-content">
                    <h4 className="sports-hero-activity-name">{activity.name}</h4>
                    <div className="sports-hero-activity-details">
                      <span className="sports-hero-activity-schedule">
                        {activity.day} • {activity.time}
                      </span>
                      <span className="sports-hero-activity-participants">
                        <FontAwesomeIcon icon={faUsers} />
                        {activity.participants} участници
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => openEnrollModal(activity)}
                    className="sports-hero-activity-join"
                    title="Запишете се за тренировка"
                  >
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Section */}
        {videos.length > 0 && (
          <div className="sports-hero-videos">
            <h3 className="sports-hero-videos-title">
              <FontAwesomeIcon icon={faPlay} />
              Вижте нас в действие
            </h3>
            <div className="sports-hero-videos-grid">
              {videos.slice(0, 3).map((video, index) => (
                <div 
                  key={index}
                  className="sports-hero-video-card"
                  onClick={() => playVideo(video)}
                  style={{ '--video-delay': `${index * 0.1}s` }}
                >
                  <div className="sports-hero-video-thumbnail">
                    <img 
                      src={video.thumbnail || club.mainImage} 
                      alt={video.alt || video.caption}
                    />
                    <div className="sports-hero-video-play">
                      <FontAwesomeIcon icon={faPlay} />
                    </div>
                  </div>
                  <div className="sports-hero-video-info">
                    <h4>{video.caption || video.alt}</h4>
                    <span>{video.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact CTA */}
        <div className="sports-hero-cta">
          <div className="sports-hero-cta-content">
            <h3>Готови за промяна?</h3>
            <p>Започнете своето пътуване към по-здравословен и активен живот</p>
            <div className="sports-hero-cta-actions">
              <button 
                onClick={() => setShowContactModal(true)}
                className="sports-hero-cta-btn"
              >
                <FontAwesomeIcon icon={faEnvelope} />
                <span>Пишете ни</span>
              </button>
              <button 
                onClick={() => setShowEnrollModal(true)}
                className="sports-hero-cta-btn outline"
              >
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>Запишете се за тренировка</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="sports-hero-modal" onClick={() => setShowContactModal(false)}>
          <div className="sports-hero-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="sports-hero-modal-close" 
              onClick={() => setShowContactModal(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="sports-hero-modal-header">
              <FontAwesomeIcon icon={faEnvelope} />
              <h3>Свържете се с нас</h3>
              <p>Имате въпроси? Пишете ни и ще ви отговорим възможно най-скоро!</p>
            </div>
            
            {contactStatus === 'sent' ? (
              <div className="sports-hero-form-success">
                <FontAwesomeIcon icon={faCheckCircle} />
                <h4>Съобщението е изпратено успешно!</h4>
                <p>Благодарим ви! Ще се свържем с вас възможно най-скоро.</p>
              </div>
            ) : contactStatus === 'error' ? (
              <div className="sports-hero-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>Възникна грешка</h4>
                <p>Моля опитайте отново или се свържете с нас директно.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="sports-hero-form">
                <div className="sports-hero-form-row">
                  <div className="sports-hero-form-group">
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
                  
                  <div className="sports-hero-form-group">
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
                
                <div className="sports-hero-form-group">
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
                
                <div className="sports-hero-form-group">
                  <label htmlFor="contact-message">
                    <FontAwesomeIcon icon={faEnvelope} />
                    Съобщение *
                  </label>
                  <textarea
                    id="contact-message"
                    value={contactForm.message}
                    onChange={(e) => handleContactChange('message', e.target.value)}
                    required
                    placeholder="Напишете вашето съобщение тук..."
                    rows="4"
                  />
                </div>
                
                <div className="sports-hero-form-actions">
                  <button 
                    type="submit" 
                    className="sports-hero-submit-btn"
                    disabled={contactStatus === 'sending'}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {contactStatus === 'sending' ? 'Изпраща се...' : 'Изпрати съобщението'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowContactModal(false)}
                    className="sports-hero-cancel-btn"
                  >
                    Отказ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="sports-hero-modal" onClick={() => setShowEnrollModal(false)}>
          <div className="sports-hero-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="sports-hero-modal-close" 
              onClick={() => setShowEnrollModal(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="sports-hero-modal-header">
              <FontAwesomeIcon icon={faRunning} />
              <h3>Запишете се за тренировка</h3>
              {selectedProgram ? (
                <p>Заявка за записване в <strong>{selectedProgram.name}</strong></p>
              ) : (
                <p>Изберете програма и попълнете формата за записване</p>
              )}
            </div>
            
            {enrollStatus === 'sent' ? (
              <div className="sports-hero-form-success">
                <FontAwesomeIcon icon={faCheckCircle} />
                <h4>Заявката е изпратена успешно!</h4>
                <p>Благодарим ви! Ще се свържем с вас за потвърждение на записването.</p>
              </div>
            ) : enrollStatus === 'error' ? (
              <div className="sports-hero-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>Възникна грешка</h4>
                <p>Моля опитайте отново или се свържете с нас директно.</p>
              </div>
            ) : (
              <form onSubmit={handleEnrollSubmit} className="sports-hero-form">
                {!selectedProgram && (
                  <div className="sports-hero-program-selection">
                    <h4>Изберете програма:</h4>
                    <div className="sports-hero-program-options">
                      {popularActivities.map((activity, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedProgram(activity)}
                          className="sports-hero-program-option"
                        >
                          <FontAwesomeIcon icon={activity.icon} />
                          <div>
                            <strong>{activity.name}</strong>
                            <span>{activity.day} • {activity.time}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProgram && (
                  <div className="sports-hero-selected-program">
                    <h4>Избрана програма:</h4>
                    <div className="sports-hero-program-details">
                      <FontAwesomeIcon icon={selectedProgram.icon} />
                      <div>
                        <strong>{selectedProgram.name}</strong>
                        <span>{selectedProgram.day} • {selectedProgram.time}</span>
                        {selectedProgram.instructor && <span>Инструктор: {selectedProgram.instructor}</span>}
                      </div>
                      <button 
                        type="button"
                        onClick={() => setSelectedProgram(null)}
                        className="sports-hero-change-program"
                      >
                        Промени
                      </button>
                    </div>
                  </div>
                )}

                <div className="sports-hero-form-row">
                  <div className="sports-hero-form-group">
                    <label htmlFor="enroll-name">
                      <FontAwesomeIcon icon={faUser} />
                      Вашето име *
                    </label>
                    <input
                      type="text"
                      id="enroll-name"
                      value={enrollForm.name}
                      onChange={(e) => handleEnrollChange('name', e.target.value)}
                      required
                      placeholder="Въведете вашето име"
                    />
                  </div>
                  
                  <div className="sports-hero-form-group">
                    <label htmlFor="enroll-email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      Имейл адрес *
                    </label>
                    <input
                      type="email"
                      id="enroll-email"
                      value={enrollForm.email}
                      onChange={(e) => handleEnrollChange('email', e.target.value)}
                      required
                      placeholder="Въведете вашия имейл"
                    />
                  </div>
                </div>
                
                <div className="sports-hero-form-row">
                  <div className="sports-hero-form-group">
                    <label htmlFor="enroll-phone">
                      <FontAwesomeIcon icon={faPhone} />
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      id="enroll-phone"
                      value={enrollForm.phone}
                      onChange={(e) => handleEnrollChange('phone', e.target.value)}
                      required
                      placeholder="Въведете вашия телефон"
                    />
                  </div>
                  
                  <div className="sports-hero-form-group">
                    <label htmlFor="enroll-age">
                      <FontAwesomeIcon icon={faUser} />
                      Възраст
                    </label>
                    <input
                      type="number"
                      id="enroll-age"
                      value={enrollForm.age}
                      onChange={(e) => handleEnrollChange('age', e.target.value)}
                      placeholder="Вашата възраст"
                      min="18"
                      max="120"
                    />
                  </div>
                </div>
                
                <div className="sports-hero-form-group">
                  <label htmlFor="enroll-experience">
                    <FontAwesomeIcon icon={faTrophy} />
                    Опит в спорта
                  </label>
                  <select
                    id="enroll-experience"
                    value={enrollForm.experience}
                    onChange={(e) => handleEnrollChange('experience', e.target.value)}
                  >
                    <option value="">Изберете ниво</option>
                    <option value="Начинаещ">Начинаещ</option>
                    <option value="Средно ниво">Средно ниво</option>
                    <option value="Напреднал">Напреднал</option>
                    <option value="Експерт">Експерт</option>
                  </select>
                </div>
                
                <div className="sports-hero-form-group">
                  <label htmlFor="enroll-health">
                    <FontAwesomeIcon icon={faHeartbeat} />
                    Здравословни ограничения
                  </label>
                  <textarea
                    id="enroll-health"
                    value={enrollForm.healthConditions}
                    onChange={(e) => handleEnrollChange('healthConditions', e.target.value)}
                    placeholder="Споменете ако имате здравословни проблеми или ограничения (незадължително)"
                    rows="3"
                  />
                </div>
                
                <div className="sports-hero-form-actions">
                  <button 
                    type="submit" 
                    className="sports-hero-submit-btn"
                    disabled={enrollStatus === 'sending' || !selectedProgram}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {enrollStatus === 'sending' ? 'Изпраща се...' : 'Изпрати заявката'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowEnrollModal(false)}
                    className="sports-hero-cancel-btn"
                  >
                    Отказ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Video Modal */}
      {activeVideo && (
        <div className="sports-hero-video-modal" onClick={closeVideo}>
          <div className="sports-hero-video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="sports-hero-video-close" onClick={closeVideo}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <video 
              src={activeVideo.src} 
              controls 
              autoPlay
              className="sports-hero-video-player"
            />
            <div className="sports-hero-video-modal-info">
              <h4>{activeVideo.caption || activeVideo.alt}</h4>
              {activeVideo.description && <p>{activeVideo.description}</p>}
            </div>
          </div>
        </div>
      )}
      {/* Members Modal */}
{showMembersModal && (
  <div className="sports-hero-modal" onClick={() => setShowMembersModal(false)}>
    <div className="sports-hero-modal-content sports-hero-members-modal" onClick={(e) => e.stopPropagation()}>
      <button 
        className="sports-hero-modal-close" 
        onClick={() => setShowMembersModal(false)}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      
      <div className="sports-hero-modal-header">
        <FontAwesomeIcon icon={faUserFriends} />
        <h3>Членове на клуба</h3>
        <p>Общо {members.length} {members.length === 1 ? 'член' : 'членове'}</p>
      </div>
      
      <div className="sports-hero-members-container">
        <div className="sports-hero-members-grid">
          {members.map((member) => (
            <div key={member.id} className="sports-hero-member-card">
              <div className="sports-hero-member-photo">
                {member.photo ? (
                  <img 
                    src={member.photo.src} 
                    alt={member.photo.alt}
                    className="sports-hero-member-image"
                  />
                ) : (
                  <div className="sports-hero-member-placeholder">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                )}
                {member.role && member.role !== 'член' && (
                  <div className="sports-hero-member-role">
                    <FontAwesomeIcon icon={faAward} />
                    <span>{member.role}</span>
                  </div>
                )}
              </div>
              
              <div className="sports-hero-member-info">
                <div className="sports-hero-member-name">
                  <h4>{member.firstName} {member.lastName}</h4>
                  <button
                    className={`sports-hero-copy-icon ${copiedItems[`${member.id}-name`] ? 'copied' : ''}`}
                    onClick={() => copyMemberData(`${member.firstName} ${member.lastName}`, 'name', member.id)}
                    title="Копирай името"
                  >
                    <FontAwesomeIcon icon={copiedItems[`${member.id}-name`] ? faCheckCircle : faCopy} />
                  </button>
                </div>
                
                <div className="sports-hero-member-details">
                  {member.phone && (
                    <div className="sports-hero-member-detail">
                      <FontAwesomeIcon icon={faPhone} />
                      <span>{member.phone}</span>
                      <button
                        className={`sports-hero-copy-icon ${copiedItems[`${member.id}-phone`] ? 'copied' : ''}`}
                        onClick={() => copyMemberData(member.phone, 'phone', member.id)}
                        title="Копирай телефона"
                      >
                        <FontAwesomeIcon icon={copiedItems[`${member.id}-phone`] ? faCheckCircle : faCopy} />
                      </button>
                    </div>
                  )}
                  
                  {member.email && (
                    <div className="sports-hero-member-detail">
                      <FontAwesomeIcon icon={faEnvelope} />
                      <span>{member.email}</span>
                      <button
                        className={`sports-hero-copy-icon ${copiedItems[`${member.id}-email`] ? 'copied' : ''}`}
                        onClick={() => copyMemberData(member.email, 'email', member.id)}
                        title="Копирай имейла"
                      >
                        <FontAwesomeIcon icon={copiedItems[`${member.id}-email`] ? faCheckCircle : faCopy} />
                      </button>
                    </div>
                  )}
                  
                  {member.address && (
                    <div className="sports-hero-member-detail">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      <span>{member.address}</span>
                      <button
                        className={`sports-hero-copy-icon ${copiedItems[`${member.id}-address`] ? 'copied' : ''}`}
                        onClick={() => copyMemberData(member.address, 'address', member.id)}
                        title="Копирай адреса"
                      >
                        <FontAwesomeIcon icon={copiedItems[`${member.id}-address`] ? faCheckCircle : faCopy} />
                      </button>
                    </div>
                  )}
                  
                  {member.joinDate && (
                    <div className="sports-hero-member-detail">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>Член от {new Date(member.joinDate).toLocaleDateString('bg-BG')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}
    </section>
  );
};

export default SportsHero;