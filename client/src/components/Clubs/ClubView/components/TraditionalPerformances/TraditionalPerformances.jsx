import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
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

  if (!club?.name) {
    return null;
  }

  const allEvents = club.activities?.events || [];
  const regularActivities = club.activities?.regular || [];
  const performanceVideos = club.media?.videos || [];
  const stats = club.stats || {};
  const awards = club.achievements?.awards || [];

  const performanceEvents = allEvents.filter(event =>
    event.type === 'cultural' || 
    event.type === 'traditional' ||
    event.title?.toLowerCase().includes('концерт') ||
    event.title?.toLowerCase().includes('представление') ||
    event.title?.toLowerCase().includes('фестивал') ||
    event.title?.toLowerCase().includes('танц') ||
    event.title?.toLowerCase().includes('песен')
  );

  const performanceActivities = regularActivities.filter(activity => 
    activity.name?.toLowerCase().includes('хор') ||
    activity.name?.toLowerCase().includes('танци') ||
    activity.name?.toLowerCase().includes('музик') ||
    activity.name?.toLowerCase().includes('песни')
  );

  const performanceAwards = awards.filter(award =>
    award.name?.toLowerCase().includes('култур') ||
    award.name?.toLowerCase().includes('представление') ||
    award.name?.toLowerCase().includes('фестивал') ||
    award.name?.toLowerCase().includes('музик') ||
    award.name?.toLowerCase().includes('танц')
  );

  const hasPerformanceContent = 
    performanceEvents.length > 0 ||
    performanceActivities.length > 0 ||
    performanceVideos.length > 0 ||
    stats.performances > 0 ||
    performanceAwards.length > 0;

  if (!hasPerformanceContent) {
    return null;
  }

  const now = new Date();
  const upcomingEvents = performanceEvents
    .filter(event => new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastEvents = performanceEvents
    .filter(event => new Date(event.date) < now)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

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
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'de' ? 'de-DE' : 'en-US';
    return date.toLocaleDateString(locale, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDayName = (day) => {
    const dayKey = day?.toLowerCase();
    return t(`clubs.TraditionalPerformances.days.${dayKey}`, { defaultValue: day });
  };

  const getActivityOptions = () => {
    const options = [
      { value: '', label: t('clubs.TraditionalPerformances.registrationModal.form.selectActivity') },
      ...performanceActivities.map((activity) => ({
        value: activity.name,
        label: activity.name
      })),
      { value: 'other', label: t('clubs.TraditionalPerformances.registrationModal.form.other') }
    ];
    return options;
  };

  const handleVideoPlay = (video) => {
    setCurrentVideo(video);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setCurrentVideo(null);
  };

  const handleVideoDownload = async (video) => {
    if (!video.src) {
      alert(t('clubs.TraditionalPerformances.messages.videoNotAvailable'));
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
      console.error('Download error:', error);
      alert(t('clubs.TraditionalPerformances.messages.downloadError'));
    }
  };

  const handleShare = (item) => {
    const text = item.title || item.caption || t('clubs.TraditionalPerformances.messages.shareDefault');
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: text,
        text: item.description || item.alt || '',
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert(t('clubs.TraditionalPerformances.messages.linkCopied'));
    }
  };

  const handleReservation = (event) => {
    alert(t('clubs.TraditionalPerformances.messages.reservation', {
      title: event.title,
      date: formatDate(event.date),
      time: event.time
    }));
  };

  const openCalendar = () => {
    setIsCalendarModalOpen(true);
  };

  const closeCalendar = () => {
    setIsCalendarModalOpen(false);
  };

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
    
    const subject = encodeURIComponent(t('clubs.TraditionalPerformances.registrationModal.emailSubject', { clubName: club.name }));
    const body = encodeURIComponent(t('clubs.TraditionalPerformances.registrationModal.emailBody', {
      name: registrationForm.name,
      email: registrationForm.email,
      phone: registrationForm.phone,
      activity: registrationForm.activity,
      message: registrationForm.message
    }));
    
    const mailtoLink = `mailto:${club.contacts?.email}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
    
    closeRegistration();
    alert(t('clubs.TraditionalPerformances.messages.emailPrepared'));
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
        
        <div className="traditional-performances-header">
          <div className="traditional-performances-badge">
            <FontAwesomeIcon icon={faFilm} />
            <span>{t('clubs.TraditionalPerformances.header.badge')}</span>
          </div>
          <h2 className="traditional-performances-title">{t('clubs.TraditionalPerformances.header.title')}</h2>
          <p className="traditional-performances-subtitle">
            {t('clubs.TraditionalPerformances.header.subtitle')}
          </p>
        </div>

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
                    <div className="traditional-performances-stat-label">{t('clubs.TraditionalPerformances.stats.performances')}</div>
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
                    <div className="traditional-performances-stat-label">{t('clubs.TraditionalPerformances.stats.performers')}</div>
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
                    <div className="traditional-performances-stat-label">{t('clubs.TraditionalPerformances.stats.yearsOnStage')}</div>
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
                    <div className="traditional-performances-stat-label">{t('clubs.TraditionalPerformances.stats.eventsThisYear')}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="traditional-performances-main-grid">
          
          {upcomingEvents.length > 0 && (
            <div className="traditional-performances-section">
              <div className="traditional-performances-section-header">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <h3>{t('clubs.TraditionalPerformances.upcoming.title')}</h3>
                <p>{t('clubs.TraditionalPerformances.upcoming.subtitle')}</p>
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
                            <span>{t('clubs.TraditionalPerformances.upcoming.seats', { count: event.participants })}</span>
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
                          {t('clubs.TraditionalPerformances.upcoming.reserve')}
                        </button>
                        <button 
                          className="traditional-performances-action-btn secondary"
                          onClick={() => handleShare(event)}
                        >
                          <FontAwesomeIcon icon={faShare} />
                          {t('clubs.TraditionalPerformances.upcoming.share')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {performanceActivities.length > 0 && (
            <div className="traditional-performances-section">
              <div className="traditional-performances-section-header">
                <FontAwesomeIcon icon={faUsers} />
                <h3>{t('clubs.TraditionalPerformances.groups.title')}</h3>
                <p>{t('clubs.TraditionalPerformances.groups.subtitle')}</p>
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
                        <span><strong>{getDayName(activity.day)}</strong> {t('clubs.TraditionalPerformances.groups.from')} {activity.time}</span>
                      </div>
                      {activity.description && (
                        <p>{activity.description}</p>
                      )}
                      <div className="traditional-performances-group-details">
                        {activity.instructor && (
                          <div className="traditional-performances-instructor">
                            <FontAwesomeIcon icon={faMicrophone} />
                            <span>{t('clubs.TraditionalPerformances.groups.leader')}: {activity.instructor}</span>
                          </div>
                        )}
                        {activity.participants && (
                          <div className="traditional-performances-participants">
                            <FontAwesomeIcon icon={faUsers} />
                            <span>{t('clubs.TraditionalPerformances.groups.performers', { count: activity.participants })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {performanceVideos.length > 0 && (
            <div className="traditional-performances-section">
              <div className="traditional-performances-section-header">
                <FontAwesomeIcon icon={faVideo} />
                <h3>{t('clubs.TraditionalPerformances.videos.title')}</h3>
                <p>{t('clubs.TraditionalPerformances.videos.subtitle')}</p>
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
                            {t('clubs.TraditionalPerformances.videos.watch')}
                          </button>
                          <button 
                            className="traditional-performances-video-btn download"
                            onClick={() => handleVideoDownload(video)}
                          >
                            <FontAwesomeIcon icon={faDownload} />
                            {t('clubs.TraditionalPerformances.videos.download')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastEvents.length > 0 && (
            <div className="traditional-performances-section">
              <div className="traditional-performances-section-header">
                <FontAwesomeIcon icon={faCamera} />
                <h3>{t('clubs.TraditionalPerformances.past.title')}</h3>
                <p>{t('clubs.TraditionalPerformances.past.subtitle')}</p>
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
                          <span>{t('clubs.TraditionalPerformances.past.viewers', { count: event.participants })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {performanceAwards.length > 0 && (
            <div className="traditional-performances-section">
              <div className="traditional-performances-section-header">
                <FontAwesomeIcon icon={faAward} />
                <h3>{t('clubs.TraditionalPerformances.awards.title')}</h3>
                <p>{t('clubs.TraditionalPerformances.awards.subtitle')}</p>
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

        <div className="traditional-performances-cta">
          <div className="traditional-performances-cta-content">
            <h3>{t('clubs.TraditionalPerformances.cta.title')}</h3>
            <p>{t('clubs.TraditionalPerformances.cta.subtitle')}</p>
            <div className="traditional-performances-cta-buttons">
              <button 
                className="traditional-performances-cta-primary"
                onClick={openRegistration}
              >
                <FontAwesomeIcon icon={faTheaterMasks} />
                {t('clubs.TraditionalPerformances.cta.register')}
              </button>
              <button 
                className="traditional-performances-cta-secondary"
                onClick={openCalendar}
              >
                <FontAwesomeIcon icon={faCalendarAlt} />
                {t('clubs.TraditionalPerformances.cta.viewSchedule')}
              </button>
            </div>
          </div>
        </div>

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
                {t('clubs.TraditionalPerformances.videoModal.notSupported')}
              </video>
            </div>
            
            <div className="traditional-performances-video-modal-info">
              <h3>{currentVideo.caption}</h3>
              {currentVideo.alt && <p>{currentVideo.alt}</p>}
              <div className="traditional-performances-video-modal-details">
                {currentVideo.duration && (
                  <span className="traditional-performances-video-modal-duration">
                    <FontAwesomeIcon icon={faClock} />
                    {t('clubs.TraditionalPerformances.videoModal.duration')}: {currentVideo.duration}
                  </span>
                )}
                {currentVideo.type && (
                  <span className="traditional-performances-video-modal-type">
                    <FontAwesomeIcon icon={faVideo} />
                    {t('clubs.TraditionalPerformances.videoModal.type')}: {currentVideo.type}
                  </span>
                )}
              </div>
              <div className="traditional-performances-video-modal-actions">
                <button 
                  className="traditional-performances-modal-btn primary"
                  onClick={() => handleVideoDownload(currentVideo)}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  {t('clubs.TraditionalPerformances.videoModal.downloadVideo')}
                </button>
                <button 
                  className="traditional-performances-modal-btn secondary"
                  onClick={() => handleShare(currentVideo)}
                >
                  <FontAwesomeIcon icon={faShare} />
                  {t('clubs.TraditionalPerformances.videoModal.share')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCalendarModalOpen && (
        <div className="traditional-performances-calendar-modal">
          <div className="traditional-performances-calendar-modal-overlay" onClick={closeCalendar}></div>
          <div className="traditional-performances-calendar-modal-container">
            <button className="traditional-performances-calendar-modal-close" onClick={closeCalendar}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="traditional-performances-calendar-header">
              <FontAwesomeIcon icon={faCalendar} />
              <h3>{t('clubs.TraditionalPerformances.calendarModal.title', { clubName: club.name })}</h3>
            </div>
            
            <div className="traditional-performances-calendar-content">
              <div className="traditional-performances-calendar-section">
                <h4>{t('clubs.TraditionalPerformances.calendarModal.regularActivities')}</h4>
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
                  <h4>{t('clubs.TraditionalPerformances.calendarModal.upcomingEvents')}</h4>
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

      {isRegistrationModalOpen && (
        <div className="traditional-performances-registration-modal">
          <div className="traditional-performances-registration-modal-overlay" onClick={closeRegistration}></div>
          <div className="traditional-performances-registration-modal-container">
            <button className="traditional-performances-registration-modal-close" onClick={closeRegistration}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="traditional-performances-registration-header">
              <FontAwesomeIcon icon={faUser} />
              <h3>{t('clubs.TraditionalPerformances.registrationModal.title', { clubName: club.name })}</h3>
              <p>{t('clubs.TraditionalPerformances.registrationModal.subtitle')}</p>
            </div>
            
            <form onSubmit={handleRegistrationSubmit} className="traditional-performances-registration-form">
              <div className="traditional-performances-form-group">
                <label htmlFor="name">
                  <FontAwesomeIcon icon={faUser} />
                  {t('clubs.TraditionalPerformances.registrationModal.form.name')} *
                </label>
                <input
                  type="text"
                  id="name"
                  value={registrationForm.name}
                  onChange={(e) => handleRegistrationChange('name', e.target.value)}
                  required
                  placeholder={t('clubs.TraditionalPerformances.registrationModal.form.namePlaceholder')}
                />
              </div>
              
              <div className="traditional-performances-form-group">
                <label htmlFor="email">
                  <FontAwesomeIcon icon={faEnvelope} />
                  {t('clubs.TraditionalPerformances.registrationModal.form.email')} *
                </label>
                <input
                  type="email"
                  id="email"
                  value={registrationForm.email}
                  onChange={(e) => handleRegistrationChange('email', e.target.value)}
                  required
                  placeholder={t('clubs.TraditionalPerformances.registrationModal.form.emailPlaceholder')}
                />
              </div>
              
              <div className="traditional-performances-form-group">
                <label htmlFor="phone">
                  <FontAwesomeIcon icon={faPhone} />
                  {t('clubs.TraditionalPerformances.registrationModal.form.phone')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={registrationForm.phone}
                  onChange={(e) => handleRegistrationChange('phone', e.target.value)}
                  placeholder={t('clubs.TraditionalPerformances.registrationModal.form.phonePlaceholder')}
                />
              </div>
              
              <div className="traditional-performances-form-group">
                <label htmlFor="activity">
                  <FontAwesomeIcon icon={faTheaterMasks} />
                  {t('clubs.TraditionalPerformances.registrationModal.form.interest')}
                </label>
                <select
                  id="activity"
                  value={registrationForm.activity}
                  onChange={(e) => handleRegistrationChange('activity', e.target.value)}
                >
                  {getActivityOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="traditional-performances-form-group">
                <label htmlFor="message">
                  <FontAwesomeIcon icon={faEnvelope} />
                  {t('clubs.TraditionalPerformances.registrationModal.form.message')}
                </label>
                <textarea
                  id="message"
                  value={registrationForm.message}
                  onChange={(e) => handleRegistrationChange('message', e.target.value)}
                  placeholder={t('clubs.TraditionalPerformances.registrationModal.form.messagePlaceholder')}
                  rows="4"
                />
              </div>
              
              <div className="traditional-performances-form-actions">
                <button type="submit" className="traditional-performances-submit-btn">
                  <FontAwesomeIcon icon={faEnvelope} />
                  {t('clubs.TraditionalPerformances.registrationModal.form.submit')}
                </button>
                <button type="button" onClick={closeRegistration} className="traditional-performances-cancel-btn">
                  {t('clubs.TraditionalPerformances.registrationModal.form.cancel')}
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