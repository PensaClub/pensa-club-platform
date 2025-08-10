import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTheaterMasks,
  faCalendarAlt,
  faClock,
  faUsers,
  faStar,
  faPlay,
  faTicketAlt,
  faAward,
  faHeart,
  faCrown,
  faGem,
  faMusic,
  faDrum,
  faEye,
  faCamera,
  faVideo,
  faMicrophone,
  faFilm,
  faShare,
  faDownload,
  faTimes,
  faEnvelope,
  faUser,
  faPhone,
  faCalendar
} from '@fortawesome/free-solid-svg-icons';
import './traditionalPerformances.css';

export const TraditionalPerformances = ({ club }) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    email: '',
    phone: '',
    activity: '',
    message: ''
  });

  // Проверяваме дали има необходимите данни
  if (!club?.name) {
    return null;
  }

  // Извличаме данни от клуба
  const allEvents = club.activities?.events || [];
  const regularActivities = club.activities?.regular || [];
  const performanceVideos = club.media?.videos || [];
  const stats = club.stats || {};
  const awards = club.achievements?.awards || [];

  // Филтрираме културни събития
  const performanceEvents = allEvents.filter(event =>
    event.type === 'cultural' || 
    event.type === 'traditional' ||
    event.title?.toLowerCase().includes('концерт') ||
    event.title?.toLowerCase().includes('представление') ||
    event.title?.toLowerCase().includes('фестивал') ||
    event.title?.toLowerCase().includes('танц') ||
    event.title?.toLowerCase().includes('песен')
  );

  // Филтрираме музикални дейности
  const performanceActivities = regularActivities.filter(activity => 
    activity.name?.toLowerCase().includes('хор') ||
    activity.name?.toLowerCase().includes('танци') ||
    activity.name?.toLowerCase().includes('музик') ||
    activity.name?.toLowerCase().includes('песни')
  );

  // Филтрираме награди за представления
  const performanceAwards = awards.filter(award =>
    award.name?.toLowerCase().includes('култур') ||
    award.name?.toLowerCase().includes('представление') ||
    award.name?.toLowerCase().includes('фестивал') ||
    award.name?.toLowerCase().includes('музик') ||
    award.name?.toLowerCase().includes('танц')
  );

  // Проверяваме дали има съдържание за показване
  const hasPerformanceContent = 
    performanceEvents.length > 0 ||
    performanceActivities.length > 0 ||
    performanceVideos.length > 0 ||
    stats.performances > 0 ||
    performanceAwards.length > 0;

  if (!hasPerformanceContent) {
    return null;
  }

  // Разделяме събитията по време
  const now = new Date();
  const upcomingEvents = performanceEvents
    .filter(event => new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastEvents = performanceEvents
    .filter(event => new Date(event.date) < now)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Създаваме календарни данни от всички дейности
  const calendarData = [
    ...performanceEvents.map(event => ({
      title: event.title,
      date: event.date,
      time: event.time,
      type: 'event',
      description: event.description
    })),
    ...performanceActivities.map(activity => ({
      title: activity.name,
      day: activity.day,
      time: activity.time,
      type: 'activity',
      instructor: activity.instructor,
      description: activity.description
    }))
  ];

  // Помощни функции
  const getEventIcon = (type, title) => {
    if (title?.toLowerCase().includes('концерт')) return faMusic;
    if (title?.toLowerCase().includes('танц')) return faTheaterMasks;
    if (title?.toLowerCase().includes('фестивал')) return faStar;
    if (type === 'cultural') return faTheaterMasks;
    if (type === 'traditional') return faCrown;
    return faFilm;
  };

  const getPerformanceIcon = (name) => {
    if (name?.toLowerCase().includes('хор')) return faMusic;
    if (name?.toLowerCase().includes('танци')) return faTheaterMasks;
    if (name?.toLowerCase().includes('музик')) return faDrum;
    return faMicrophone;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDayName = (day) => {
    const days = {
      'понеделник': 'Понеделник',
      'вторник': 'Вторник', 
      'сряда': 'Сряда',
      'четвъртък': 'Четвъртък',
      'петък': 'Петък',
      'събота': 'Събота',
      'неделя': 'Неделя'
    };
    return days[day?.toLowerCase()] || day;
  };

  // Функции за видео
  const handleVideoPlay = (video) => {
    setCurrentVideo(video);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setCurrentVideo(null);
  };

  // ПОПРАВЕНА функция за изтегляне
  const handleVideoDownload = async (video) => {
    if (!video.src) {
      alert('Видеото не е налично за изтегляне');
      return;
    }

    try {
      const response = await fetch(video.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${video.caption || 'video'}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Грешка при изтегляне:', error);
      alert('Възникна грешка при изтеглянето на видеото');
    }
  };

  const handleShare = (item) => {
    const text = item.title || item.caption || 'Споделяне от клуба';
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: text,
        text: item.description || item.alt || '',
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Линкът е копиран в клипборда!');
    }
  };

  const handleReservation = (event) => {
    alert(`Резервация за "${event.title}" на ${formatDate(event.date)} в ${event.time}`);
  };

  // Функции за календар
  const openCalendar = () => {
    setIsCalendarModalOpen(true);
  };

  const closeCalendar = () => {
    setIsCalendarModalOpen(false);
  };

  // Функции за регистрация
  const openRegistration = () => {
    setIsRegistrationModalOpen(true);
  };

  const closeRegistration = () => {
    setIsRegistrationModalOpen(false);
    setRegistrationForm({
      name: '',
      email: '',
      phone: '',
      activity: '',
      message: ''
    });
  };

  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    
    // Създаваме mailto link
    const subject = encodeURIComponent(`Заявка за записване в ${club.name}`);
    const body = encodeURIComponent(`
Здравейте,

Бих искал/а да се запиша в клуба с следните данни:

Име: ${registrationForm.name}
Имейл: ${registrationForm.email}
Телефон: ${registrationForm.phone}
Интересува ме: ${registrationForm.activity}

Съобщение:
${registrationForm.message}

С уважение,
${registrationForm.name}
    `);
    
    const mailtoLink = `mailto:${club.contacts?.email}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
    
    closeRegistration();
    alert('Имейлът е подготвен за изпращане!');
  };

  const handleRegistrationChange = (field, value) => {
    setRegistrationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section id="traditional-performances" className="traditional-performances-main-section">
      <div className="traditional-performances-container">
        
        {/* Header */}
        <div className="traditional-performances-header">
          <div className="traditional-performances-badge">
            <FontAwesomeIcon icon={faFilm} />
            <span>Представления и изпълнения</span>
          </div>
          <h2 className="traditional-performances-title">Нашата сцена и публика</h2>
          <p className="traditional-performances-subtitle">
            Споделяме красотата на българския фолклор чрез автентични представления
          </p>
        </div>

        {/* Performance Stats */}
        {(stats.performances > 0 || stats.totalMembers > 0 || stats.yearsActive > 0) && (
          <div className="traditional-performances-stats">
            <div className="traditional-performances-stats-grid">
              {stats.performances > 0 && (
                <div className="traditional-performances-stat-card">
                  <div className="traditional-performances-stat-icon">
                    <FontAwesomeIcon icon={faTheaterMasks} />
                  </div>
                  <div className="traditional-performances-stat-content">
                    <div className="traditional-performances-stat-value">{stats.performances}+</div>
                    <div className="traditional-performances-stat-label">Представления</div>
                  </div>
                </div>
              )}
              {stats.totalMembers > 0 && (
                <div className="traditional-performances-stat-card">
                  <div className="traditional-performances-stat-icon">
                    <FontAwesomeIcon icon={faUsers} />
                  </div>
                  <div className="traditional-performances-stat-content">
                    <div className="traditional-performances-stat-value">{stats.totalMembers}</div>
                    <div className="traditional-performances-stat-label">Изпълнители</div>
                  </div>
                </div>
              )}
              {stats.yearsActive > 0 && (
                <div className="traditional-performances-stat-card">
                  <div className="traditional-performances-stat-icon">
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                  <div className="traditional-performances-stat-content">
                    <div className="traditional-performances-stat-value">{stats.yearsActive}</div>
                    <div className="traditional-performances-stat-label">Години на сцената</div>
                  </div>
                </div>
              )}
              {performanceEvents.length > 0 && (
                <div className="traditional-performances-stat-card">
                  <div className="traditional-performances-stat-icon">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                  </div>
                  <div className="traditional-performances-stat-content">
                    <div className="traditional-performances-stat-value">{performanceEvents.length}</div>
                    <div className="traditional-performances-stat-label">События тази година</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="traditional-performances-main-grid">
          
          {/* Upcoming Performances */}
          {upcomingEvents.length > 0 && (
            <div className="traditional-performances-section">
              <div className="traditional-performances-section-header">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <h3>Предстоящи представления</h3>
                <p>Не пропускайте нашите бъдещи изпълнения</p>
              </div>
              
              <div className="traditional-performances-events">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="traditional-performances-event-card upcoming">
                    <div className="traditional-performances-event-icon">
                      <FontAwesomeIcon icon={getEventIcon(event.type, event.title)} />
                    </div>
                    <div className="traditional-performances-event-content">
                      <div className="traditional-performances-event-header">
                        <h4>{event.title}</h4>
                        {event.type && (
                          <div className="traditional-performances-event-type">{event.type}</div>
                        )}
                      </div>
                      <div className="traditional-performances-event-details">
                        <div className="traditional-performances-event-date">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        {event.time && (
                          <div className="traditional-performances-event-time">
                            <FontAwesomeIcon icon={faClock} />
                            <span>{event.time}</span>
                          </div>
                        )}
                        {event.participants && (
                          <div className="traditional-performances-event-audience">
                            <FontAwesomeIcon icon={faUsers} />
                            <span>До {event.participants} места</span>
                          </div>
                        )}
                      </div>
                      {event.description && (
                        <p className="traditional-performances-event-description">{event.description}</p>
                      )}
                      <div className="traditional-performances-event-actions">
                        <button 
                          className="traditional-performances-action-btn primary"
                          onClick={() => handleReservation(event)}
                        >
                          <FontAwesomeIcon icon={faTicketAlt} />
                          Резервирайте място
                        </button>
                        <button 
                          className="traditional-performances-action-btn secondary"
                          onClick={() => handleShare(event)}
                        >
                          <FontAwesomeIcon icon={faShare} />
                          Споделете
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Performance Groups */}
          {performanceActivities.length > 0 && (
            <div className="traditional-performances-section">
              <div className="traditional-performances-section-header">
                <FontAwesomeIcon icon={faUsers} />
                <h3>Нашите формации</h3>
                <p>Постоянни състави и групи</p>
              </div>
              
              <div className="traditional-performances-groups">
                {performanceActivities.map((activity, index) => (
                  <div key={index} className="traditional-performances-group-card">
                    <div className="traditional-performances-group-icon">
                      <FontAwesomeIcon icon={getPerformanceIcon(activity.name)} />
                    </div>
                    <div className="traditional-performances-group-content">
                      <h4>{activity.name}</h4>
                      <div className="traditional-performances-group-schedule">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span><strong>{getDayName(activity.day)}</strong> от {activity.time}</span>
                      </div>
                      {activity.description && (
                        <p>{activity.description}</p>
                      )}
                      <div className="traditional-performances-group-details">
                        {activity.instructor && (
                          <div className="traditional-performances-instructor">
                            <FontAwesomeIcon icon={faMicrophone} />
                            <span>Ръководител: {activity.instructor}</span>
                          </div>
                        )}
                        {activity.participants && (
                          <div className="traditional-performances-participants">
                            <FontAwesomeIcon icon={faUsers} />
                            <span>{activity.participants} изпълнители</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Videos */}
          {performanceVideos.length > 0 && (
            <div className="traditional-performances-section">
              <div className="traditional-performances-section-header">
                <FontAwesomeIcon icon={faVideo} />
                <h3>Записи от представления</h3>
                <p>Гледайте нашите изпълнения</p>
              </div>
              
              <div className="traditional-performances-videos">
                {performanceVideos.map((video, index) => (
                  <div key={index} className="traditional-performances-video-card">
                    <div className="traditional-performances-video-thumbnail">
                      <img src={video.thumbnail} alt={video.alt} />
                      <div 
                        className="traditional-performances-play-overlay"
                        onClick={() => handleVideoPlay(video)}
                      >
                        <FontAwesomeIcon icon={faPlay} />
                      </div>
                      {video.duration && (
                        <div className="traditional-performances-duration">{video.duration}</div>
                      )}
                    </div>
                    <div className="traditional-performances-video-info">
                      <h4>{video.caption}</h4>
                      <p>{video.alt}</p>
                      <div className="traditional-performances-video-meta">
                        {video.type && (
                          <span className="traditional-performances-video-type">{video.type}</span>
                        )}
                        <div className="traditional-performances-video-actions">
                          <button 
                            className="traditional-performances-video-btn play"
                            onClick={() => handleVideoPlay(video)}
                          >
                            <FontAwesomeIcon icon={faPlay} />
                            Гледай
                          </button>
                          <button 
                            className="traditional-performances-video-btn download"
                            onClick={() => handleVideoDownload(video)}
                          >
                            <FontAwesomeIcon icon={faDownload} />
                            Изтегли
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Performances */}
          {pastEvents.length > 0 && (
            <div className="traditional-performances-section">
              <div className="traditional-performances-section-header">
                <FontAwesomeIcon icon={faCamera} />
                <h3>Минали представления</h3>
                <p>Нашите успешни изпълнения</p>
              </div>
              
              <div className="traditional-performances-past-events">
                {pastEvents.slice(0, 4).map((event, index) => (
                  <div key={index} className="traditional-performances-past-card">
                    <div className="traditional-performances-past-icon">
                      <FontAwesomeIcon icon={getEventIcon(event.type, event.title)} />
                    </div>
                    <div className="traditional-performances-past-content">
                      <h4>{event.title}</h4>
                      <div className="traditional-performances-past-date">
                        {formatDate(event.date)}
                      </div>
                      {event.description && (
                        <p>{event.description}</p>
                      )}
                      {event.participants && (
                        <div className="traditional-performances-past-audience">
                          <FontAwesomeIcon icon={faEye} />
                          <span>{event.participants} зрители</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Awards */}
          {performanceAwards.length > 0 && (
            <div className="traditional-performances-section">
              <div className="traditional-performances-section-header">
                <FontAwesomeIcon icon={faAward} />
                <h3>Награди за представления</h3>
                <p>Признание за нашите изпълнения</p>
              </div>
              
              <div className="traditional-performances-awards">
                {performanceAwards.map((award, index) => (
                  <div key={index} className="traditional-performances-award-card">
                    <div className="traditional-performances-award-icon">
                      <FontAwesomeIcon icon={faCrown} />
                    </div>
                    <div className="traditional-performances-award-content">
                      <h4>{award.name}</h4>
                      <p>{award.description}</p>
                      <div className="traditional-performances-award-details">
                        <span className="traditional-performances-award-year">{award.year}</span>
                        <span className="traditional-performances-award-by">{award.awardedBy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="traditional-performances-cta">
          <div className="traditional-performances-cta-content">
            <h3>Станете част от представленията</h3>
            <p>Присъединете се към нашите формации и изкуството на българския фолклор</p>
            <div className="traditional-performances-cta-buttons">
              <button 
                className="traditional-performances-cta-primary"
                onClick={openRegistration}
              >
                <FontAwesomeIcon icon={faTheaterMasks} />
                Запишете се
              </button>
              <button 
                className="traditional-performances-cta-secondary"
                onClick={openCalendar}
              >
                <FontAwesomeIcon icon={faCalendarAlt} />
                Вижте програмата
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Pattern */}
        <div className="traditional-performances-decorative">
          <div className="traditional-performances-pattern">
            <FontAwesomeIcon icon={faGem} />
            <FontAwesomeIcon icon={faTheaterMasks} />
            <FontAwesomeIcon icon={faHeart} />
            <FontAwesomeIcon icon={faTheaterMasks} />
            <FontAwesomeIcon icon={faGem} />
          </div>
        </div>
      </div>

      {/* ВИДЕО МОДАЛ */}
      {isVideoModalOpen && currentVideo && (
        <div className="traditional-performances-video-modal">
          <div className="traditional-performances-video-modal-overlay" onClick={closeVideoModal}></div>
          <div className="traditional-performances-video-modal-container">
            <button className="traditional-performances-video-modal-close" onClick={closeVideoModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="traditional-performances-video-player">
              <video 
                controls 
                autoPlay
                width="100%"
                poster={currentVideo.thumbnail}
              >
                <source src={currentVideo.src} type="video/mp4" />
                Вашият браузър не поддържа video елемента.
              </video>
            </div>
            
            <div className="traditional-performances-video-modal-info">
              <h3>{currentVideo.caption}</h3>
              {currentVideo.alt && <p>{currentVideo.alt}</p>}
              <div className="traditional-performances-video-modal-details">
                {currentVideo.duration && (
                  <span className="traditional-performances-video-modal-duration">
                    <FontAwesomeIcon icon={faClock} />
                    Продължителност: {currentVideo.duration}
                  </span>
                )}
                {currentVideo.type && (
                  <span className="traditional-performances-video-modal-type">
                    <FontAwesomeIcon icon={faVideo} />
                    Тип: {currentVideo.type}
                  </span>
                )}
              </div>
              <div className="traditional-performances-video-modal-actions">
                <button 
                  className="traditional-performances-modal-btn primary"
                  onClick={() => handleVideoDownload(currentVideo)}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Изтегли видео
                </button>
                <button 
                  className="traditional-performances-modal-btn secondary"
                  onClick={() => handleShare(currentVideo)}
                >
                  <FontAwesomeIcon icon={faShare} />
                  Сподели
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* КАЛЕНДАР МОДАЛ */}
      {isCalendarModalOpen && (
        <div className="traditional-performances-calendar-modal">
          <div className="traditional-performances-calendar-modal-overlay" onClick={closeCalendar}></div>
          <div className="traditional-performances-calendar-modal-container">
            <button className="traditional-performances-calendar-modal-close" onClick={closeCalendar}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="traditional-performances-calendar-header">
              <FontAwesomeIcon icon={faCalendar} />
              <h3>Програма на {club.name}</h3>
            </div>
            
            <div className="traditional-performances-calendar-content">
              <div className="traditional-performances-calendar-section">
                <h4>Редовни дейности</h4>
                <div className="traditional-performances-calendar-activities">
                  {performanceActivities.map((activity, index) => (
                    <div key={index} className="traditional-performances-calendar-item">
                      <div className="traditional-performances-calendar-day">
                        {getDayName(activity.day)}
                      </div>
                      <div className="traditional-performances-calendar-details">
                        <div className="traditional-performances-calendar-title">{activity.name}</div>
                        <div className="traditional-performances-calendar-time">
                          <FontAwesomeIcon icon={faClock} />
                          {activity.time}
                        </div>
                        {activity.instructor && (
                          <div className="traditional-performances-calendar-instructor">
                            <FontAwesomeIcon icon={faMicrophone} />
                            {activity.instructor}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {upcomingEvents.length > 0 && (
                <div className="traditional-performances-calendar-section">
                  <h4>Предстоящи събития</h4>
                  <div className="traditional-performances-calendar-events">
                    {upcomingEvents.map((event, index) => (
                      <div key={index} className="traditional-performances-calendar-item">
                        <div className="traditional-performances-calendar-date">
                          {formatDate(event.date)}
                        </div>
                        <div className="traditional-performances-calendar-details">
                          <div className="traditional-performances-calendar-title">{event.title}</div>
                          <div className="traditional-performances-calendar-time">
                            <FontAwesomeIcon icon={faClock} />
                            {event.time}
                          </div>
                          {event.description && (
                            <div className="traditional-performances-calendar-description">
                              {event.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* РЕГИСТРАЦИЯ МОДАЛ */}
      {isRegistrationModalOpen && (
        <div className="traditional-performances-registration-modal">
          <div className="traditional-performances-registration-modal-overlay" onClick={closeRegistration}></div>
          <div className="traditional-performances-registration-modal-container">
            <button className="traditional-performances-registration-modal-close" onClick={closeRegistration}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="traditional-performances-registration-header">
              <FontAwesomeIcon icon={faUser} />
              <h3>Запишете се в {club.name}</h3>
              <p>Моля попълнете формата по-долу</p>
            </div>
            
            <form onSubmit={handleRegistrationSubmit} className="traditional-performances-registration-form">
              <div className="traditional-performances-form-group">
                <label htmlFor="name">
                  <FontAwesomeIcon icon={faUser} />
                  Вашето име *
                </label>
                <input
                  type="text"
                  id="name"
                  value={registrationForm.name}
                  onChange={(e) => handleRegistrationChange('name', e.target.value)}
                  required
                  placeholder="Въведете вашето име"
                />
              </div>
              
              <div className="traditional-performances-form-group">
                <label htmlFor="email">
                  <FontAwesomeIcon icon={faEnvelope} />
                  Имейл адрес *
                </label>
                <input
                  type="email"
                  id="email"
                  value={registrationForm.email}
                  onChange={(e) => handleRegistrationChange('email', e.target.value)}
                  required
                  placeholder="Въведете вашия имейл"
                />
              </div>
              
              <div className="traditional-performances-form-group">
                <label htmlFor="phone">
                  <FontAwesomeIcon icon={faPhone} />
                  Телефон
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={registrationForm.phone}
                  onChange={(e) => handleRegistrationChange('phone', e.target.value)}
                  placeholder="Въведете вашия телефон"
                />
              </div>
              
              <div className="traditional-performances-form-group">
                <label htmlFor="activity">
                  <FontAwesomeIcon icon={faTheaterMasks} />
                  Интересува ви
                </label>
                <select
                  id="activity"
                  value={registrationForm.activity}
                  onChange={(e) => handleRegistrationChange('activity', e.target.value)}
                >
                  <option value="">Изберете дейност</option>
                  {performanceActivities.map((activity, index) => (
                    <option key={index} value={activity.name}>
                      {activity.name}
                    </option>
                  ))}
                  <option value="other">Друго</option>
                </select>
              </div>
              
              <div className="traditional-performances-form-group">
                <label htmlFor="message">
                  <FontAwesomeIcon icon={faEnvelope} />
                  Допълнително съобщение
                </label>
                <textarea
                  id="message"
                  value={registrationForm.message}
                  onChange={(e) => handleRegistrationChange('message', e.target.value)}
                  placeholder="Разкажете ни повече за вашия интерес..."
                  rows="4"
                />
              </div>
              
              <div className="traditional-performances-form-actions">
                <button type="submit" className="traditional-performances-submit-btn">
                  <FontAwesomeIcon icon={faEnvelope} />
                  Изпрати заявката
                </button>
                <button type="button" onClick={closeRegistration} className="traditional-performances-cancel-btn">
                  Отказ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default TraditionalPerformances;