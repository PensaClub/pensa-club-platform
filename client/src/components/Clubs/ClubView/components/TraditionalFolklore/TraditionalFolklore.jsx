import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMusic,
  faTheaterMasks,
  faDrum,
  faPlay,
  faPause,
  faVolumeUp,
  faUsers,
  faAward,
  faStar,
  faHeart,
  faCrown,
  faGem,
  faCalendarAlt,
  faDownload,
  faShare,
  faEye,
  faGlobe,
  faMicrophone,
  faGuitar,
  faCompactDisc,
  faHeadphones,
  faTimes,
  faEnvelope,
  faPhone,
  faUser,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './traditionalFolklore.css';

export const TraditionalFolklore = ({ club }) => {
  const { t, i18n } = useTranslation('clubs');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    experience: '',
    activity: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);

  if (!club?.name) {
    return null;
  }

  const folkloreActivities = club.activities?.regular?.filter(activity => 
    activity.name.toLowerCase().includes('хор') ||
    activity.name.toLowerCase().includes('танци') ||
    activity.name.toLowerCase().includes('музик') ||
    activity.name.toLowerCase().includes('песни') ||
    activity.name.toLowerCase().includes('тракийски') ||
    activity.name.toLowerCase().includes('родопски')
  ) || [];

  const folkloreEvents = club.activities?.events?.filter(event =>
    event.type === 'cultural' || 
    event.type === 'traditional' ||
    event.title.toLowerCase().includes('концерт') ||
    event.title.toLowerCase().includes('фестивал') ||
    event.title.toLowerCase().includes('танц')
  ) || [];

  const folkloreVideos = club.media?.videos?.filter(video =>
    video.type === 'cultural' ||
    video.type === 'event' ||
    video.alt.toLowerCase().includes('танц') ||
    video.alt.toLowerCase().includes('песен') ||
    video.alt.toLowerCase().includes('концерт')
  ) || [];

  const folkloreAudio = club.media?.audioFiles || [];

  const culturalAwards = club.achievements?.awards?.filter(award =>
    award.name.toLowerCase().includes('култур') ||
    award.name.toLowerCase().includes('фолклор') ||
    award.name.toLowerCase().includes('музик') ||
    award.name.toLowerCase().includes('танц')
  ) || [];

  const performanceStats = {
    performances: club.stats?.performances || 0,
    members: club.stats?.totalMembers || 0,
    years: club.stats?.yearsActive || 0
  };

  const hasFolkloreContent = folkloreActivities.length > 0 ||
                            folkloreEvents.length > 0 ||
                            folkloreVideos.length > 0 ||
                            folkloreAudio.length > 0 ||
                            culturalAwards.length > 0;

  if (!hasFolkloreContent) {
    return null;
  }

  const hasStats = performanceStats.performances > 0 || 
                   performanceStats.members > 0 || 
                   performanceStats.years > 0;

  const getActivityIcon = (name) => {
    if (name.toLowerCase().includes('хор')) return faMusic;
    if (name.toLowerCase().includes('танци')) return faTheaterMasks;
    if (name.toLowerCase().includes('музик')) return faGuitar;
    return faDrum;
  };

  const getExperienceOptions = () => [
    { value: '', label: t('clubs.TraditionalFolklore.registrationModal.form.selectExperience') },
    { value: 'beginner', label: t('clubs.TraditionalFolklore.registrationModal.form.experience.beginner') },
    { value: 'intermediate', label: t('clubs.TraditionalFolklore.registrationModal.form.experience.intermediate') },
    { value: 'advanced', label: t('clubs.TraditionalFolklore.registrationModal.form.experience.advanced') },
    { value: 'professional', label: t('clubs.TraditionalFolklore.registrationModal.form.experience.professional') }
  ];

  const getActivityOptions = () => {
    const options = [
      { value: '', label: t('clubs.TraditionalFolklore.registrationModal.form.selectActivity') },
      ...folkloreActivities.map((activity, index) => ({
        value: activity.name,
        label: activity.name
      })),
      { value: 'any', label: t('clubs.TraditionalFolklore.registrationModal.form.anyActivity') }
    ];
    return options;
  };

  const handleVideoPlay = (video) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
  };

  const handleAudioPlay = (audioIndex) => {
    if (currentlyPlaying === audioIndex) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(audioIndex);
    }
  };

  const handleDownload = async (media) => {
    try {
      const response = await fetch(media.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${media.caption || t('clubs.TraditionalFolklore.media.defaultFileName')}.${media.type === 'video' ? 'mp4' : 'mp3'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert(t('clubs.TraditionalFolklore.messages.downloadError'));
    }
  };

  const handleShare = (media) => {
    const text = `${media.caption || media.alt} - ${club.name}`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: media.caption || media.alt,
        text: text,
        url: url
      });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      alert(t('clubs.TraditionalFolklore.messages.shareSuccess'));
    }
  };

  const openRegistrationModal = () => {
    setIsRegistrationModalOpen(true);
  };

  const closeRegistrationModal = () => {
    setIsRegistrationModalOpen(false);
    setRegistrationForm({
      name: '',
      email: '',
      phone: '',
      age: '',
      experience: '',
      activity: '',
      message: ''
    });
    setFormStatus(null);
  };

  const handleFormChange = (field, value) => {
    setRegistrationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    if (club.contacts?.email) {
      const subject = encodeURIComponent(t('clubs.TraditionalFolklore.registrationModal.emailSubject', { clubName: club.name }));
      const body = encodeURIComponent(t('clubs.TraditionalFolklore.registrationModal.emailBody', {
        name: registrationForm.name,
        email: registrationForm.email,
        phone: registrationForm.phone || t('clubs.TraditionalFolklore.registrationModal.notSpecified'),
        age: registrationForm.age || t('clubs.TraditionalFolklore.registrationModal.notSpecified'),
        experience: registrationForm.experience || t('clubs.TraditionalFolklore.registrationModal.noExperience'),
        activity: registrationForm.activity || t('clubs.TraditionalFolklore.registrationModal.anyActivity'),
        message: registrationForm.message || t('clubs.TraditionalFolklore.registrationModal.noMessage'),
        clubName: club.name
      }));
      
      try {
        window.location.href = `mailto:${club.contacts.email}?subject=${subject}&body=${body}`;
        setFormStatus('sent');
        setTimeout(() => {
          closeRegistrationModal();
        }, 2000);
      } catch (error) {
        setFormStatus('error');
      }
    } else {
      setFormStatus('error');
    }
  };

  const handleWatchVideos = () => {
    if (folkloreVideos.length > 0) {
      handleVideoPlay(folkloreVideos[0]);
    } else {
      alert(t('clubs.TraditionalFolklore.messages.noVideosAvailable'));
    }
  };

  return (
    <section id="traditional-folklore" className="traditional-folklore-main-section">
      <div className="traditional-folklore-container">
        
        <div className="traditional-folklore-header">
          <div className="traditional-folklore-badge">
            <FontAwesomeIcon icon={faTheaterMasks} />
            <span>{t('clubs.TraditionalFolklore.header.badge')}</span>
          </div>
          <h2 className="traditional-folklore-title">{t('clubs.TraditionalFolklore.header.title')}</h2>
          <p className="traditional-folklore-subtitle">
            {t('clubs.TraditionalFolklore.header.subtitle')}
          </p>
        </div>

        {hasStats && (
          <div className="traditional-folklore-stats">
            <div className="traditional-folklore-stats-grid">
              {performanceStats.performances > 0 && (
                <div className="traditional-folklore-stat-card">
                  <div className="traditional-folklore-stat-icon">
                    <FontAwesomeIcon icon={faTheaterMasks} />
                  </div>
                  <div className="traditional-folklore-stat-content">
                    <div className="traditional-folklore-stat-value">{performanceStats.performances}+</div>
                    <div className="traditional-folklore-stat-label">{t('clubs.TraditionalFolklore.stats.performances')}</div>
                  </div>
                </div>
              )}
              {performanceStats.members > 0 && (
                <div className="traditional-folklore-stat-card">
                  <div className="traditional-folklore-stat-icon">
                    <FontAwesomeIcon icon={faUsers} />
                  </div>
                  <div className="traditional-folklore-stat-content">
                    <div className="traditional-folklore-stat-value">{performanceStats.members}</div>
                    <div className="traditional-folklore-stat-label">{t('clubs.TraditionalFolklore.stats.participants')}</div>
                  </div>
                </div>
              )}
              {performanceStats.years > 0 && (
                <div className="traditional-folklore-stat-card">
                  <div className="traditional-folklore-stat-icon">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                  </div>
                  <div className="traditional-folklore-stat-content">
                    <div className="traditional-folklore-stat-value">{performanceStats.years}</div>
                    <div className="traditional-folklore-stat-label">{t('clubs.TraditionalFolklore.stats.yearsExperience')}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="traditional-folklore-main-grid">
          
          {folkloreActivities.length > 0 && (
            <div className="traditional-folklore-section">
              <div className="traditional-folklore-section-header">
                <FontAwesomeIcon icon={faMusic} />
                <h3>{t('clubs.TraditionalFolklore.activities.title')}</h3>
                <p>{t('clubs.TraditionalFolklore.activities.subtitle')}</p>
              </div>
              
              <div className="traditional-folklore-cards">
                {folkloreActivities.map((activity, index) => (
                  <div key={index} className="traditional-folklore-card activity">
                    <div className="traditional-folklore-card-icon">
                      <FontAwesomeIcon icon={getActivityIcon(activity.name)} />
                    </div>
                    <div className="traditional-folklore-card-content">
                      <h4>{activity.name}</h4>
                      <div className="traditional-folklore-schedule">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span><strong>{activity.day}</strong> {t('clubs.TraditionalFolklore.activities.from')} {activity.time}</span>
                      </div>
                      {activity.description && (
                        <p>{activity.description}</p>
                      )}
                      <div className="traditional-folklore-details">
                        {activity.instructor && (
                          <div className="traditional-folklore-instructor">
                            <FontAwesomeIcon icon={faMicrophone} />
                            <span>{t('clubs.TraditionalFolklore.activities.instructor')}: {activity.instructor}</span>
                          </div>
                        )}
                        {activity.participants && (
                          <div className="traditional-folklore-participants">
                            <FontAwesomeIcon icon={faUsers} />
                            <span>{t('clubs.TraditionalFolklore.common.participants', { count: activity.participants })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {folkloreEvents.length > 0 && (
            <div className="traditional-folklore-section">
              <div className="traditional-folklore-section-header">
                <FontAwesomeIcon icon={faStar} />
                <h3>{t('clubs.TraditionalFolklore.events.title')}</h3>
                <p>{t('clubs.TraditionalFolklore.events.subtitle')}</p>
              </div>
              
              <div className="traditional-folklore-cards">
                {folkloreEvents.map((event, index) => (
                  <div key={index} className="traditional-folklore-card event">
                    <div className="traditional-folklore-card-icon">
                      <FontAwesomeIcon icon={faTheaterMasks} />
                    </div>
                    <div className="traditional-folklore-card-content">
                      <h4>{event.title}</h4>
                      <div className="traditional-folklore-event-date">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>{t('clubs.TraditionalFolklore.events.dateTime', { date: event.date, time: event.time })}</span>
                      </div>
                      {event.description && (
                        <p>{event.description}</p>
                      )}
                      <div className="traditional-folklore-event-info">
                        <div className="traditional-folklore-event-type">{event.type}</div>
                        {event.participants && (
                          <div className="traditional-folklore-audience">
                            <FontAwesomeIcon icon={faUsers} />
                            <span>{t('clubs.TraditionalFolklore.events.audience', { count: event.participants })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {folkloreVideos.length > 0 && (
            <div className="traditional-folklore-section">
              <div className="traditional-folklore-section-header">
                <FontAwesomeIcon icon={faPlay} />
                <h3>{t('clubs.TraditionalFolklore.videos.title')}</h3>
                <p>{t('clubs.TraditionalFolklore.videos.subtitle')}</p>
              </div>
              
              <div className="traditional-folklore-videos">
                {folkloreVideos.map((video, index) => (
                  <div key={index} className="traditional-folklore-video-card">
                    <div className="traditional-folklore-video-thumbnail">
                      <img src={video.thumbnail} alt={video.alt} />
                      <div 
                        className="traditional-folklore-play-overlay"
                        onClick={() => handleVideoPlay(video)}
                      >
                        <FontAwesomeIcon icon={faPlay} />
                      </div>
                      {video.duration && (
                        <div className="traditional-folklore-duration">
                          {video.duration}
                        </div>
                      )}
                    </div>
                    <div className="traditional-folklore-video-info">
                      <h4>{video.caption}</h4>
                      <p>{video.alt}</p>
                      <div className="traditional-folklore-video-meta">
                        <span className="traditional-folklore-video-type">{video.type}</span>
                        <div className="traditional-folklore-video-actions">
                          <button 
                            className="traditional-folklore-action-btn"
                            onClick={() => handleVideoPlay(video)}
                          >
                            <FontAwesomeIcon icon={faPlay} />
                            {t('clubs.TraditionalFolklore.videos.watch')}
                          </button>
                          <button 
                            className="traditional-folklore-action-btn"
                            onClick={() => handleShare(video)}
                          >
                            <FontAwesomeIcon icon={faShare} />
                            {t('clubs.TraditionalFolklore.videos.share')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {folkloreAudio.length > 0 && (
            <div className="traditional-folklore-section">
              <div className="traditional-folklore-section-header">
                <FontAwesomeIcon icon={faVolumeUp} />
                <h3>{t('clubs.TraditionalFolklore.audio.title')}</h3>
                <p>{t('clubs.TraditionalFolklore.audio.subtitle')}</p>
              </div>
              
              <div className="traditional-folklore-audio">
                {folkloreAudio.map((audio, index) => (
                  <div key={index} className="traditional-folklore-audio-card">
                    <div className="traditional-folklore-audio-icon">
                      <FontAwesomeIcon icon={faCompactDisc} />
                    </div>
                    <div className="traditional-folklore-audio-info">
                      <h4>{audio.caption}</h4>
                      <p>{audio.alt}</p>
                      {audio.duration && (
                        <div className="traditional-folklore-audio-duration">
                          <FontAwesomeIcon icon={faHeadphones} />
                          <span>{audio.duration}</span>
                        </div>
                      )}
                    </div>
                    <div className="traditional-folklore-audio-actions">
                      <button 
                        className="traditional-folklore-play-btn"
                        onClick={() => handleAudioPlay(index)}
                      >
                        <FontAwesomeIcon icon={currentlyPlaying === index ? faPause : faPlay} />
                      </button>
                      <button 
                        className="traditional-folklore-download-btn"
                        onClick={() => handleDownload(audio)}
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {culturalAwards.length > 0 && (
            <div className="traditional-folklore-section">
              <div className="traditional-folklore-section-header">
                <FontAwesomeIcon icon={faAward} />
                <h3>{t('clubs.TraditionalFolklore.awards.title')}</h3>
                <p>{t('clubs.TraditionalFolklore.awards.subtitle')}</p>
              </div>
              
              <div className="traditional-folklore-awards">
                {culturalAwards.map((award, index) => (
                  <div key={index} className="traditional-folklore-award-card">
                    <div className="traditional-folklore-award-icon">
                      <FontAwesomeIcon icon={faCrown} />
                    </div>
                    <div className="traditional-folklore-award-content">
                      <h4>{award.name}</h4>
                      <p>{award.description}</p>
                      <div className="traditional-folklore-award-details">
                        <span className="traditional-folklore-award-year">{award.year}</span>
                        <span className="traditional-folklore-award-by">{award.awardedBy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="traditional-folklore-cta">
          <div className="traditional-folklore-cta-content">
            <h3>{t('clubs.TraditionalFolklore.cta.title')}</h3>
            <p>{t('clubs.TraditionalFolklore.cta.subtitle')}</p>
            <div className="traditional-folklore-cta-buttons">
              <button 
                className="traditional-folklore-cta-primary"
                onClick={openRegistrationModal}
              >
                <FontAwesomeIcon icon={faMusic} />
                {t('clubs.TraditionalFolklore.cta.register')}
              </button>
              <button 
                className="traditional-folklore-cta-secondary"
                onClick={handleWatchVideos}
              >
                <FontAwesomeIcon icon={faEye} />
                {t('clubs.TraditionalFolklore.cta.watchVideos')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isVideoModalOpen && selectedVideo && (
        <div className="traditional-folklore-video-modal">
          <div className="traditional-folklore-video-modal-overlay" onClick={closeVideoModal}></div>
          <div className="traditional-folklore-video-modal-container">
            <button className="traditional-folklore-video-modal-close" onClick={closeVideoModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="traditional-folklore-video-player">
              <video 
                controls 
                autoPlay
                width="100%"
                poster={selectedVideo.thumbnail}
              >
                <source src={selectedVideo.src} type="video/mp4" />
                {t('clubs.TraditionalFolklore.videoModal.notSupported')}
              </video>
            </div>
            
            <div className="traditional-folklore-video-modal-info">
              <h3>{selectedVideo.caption}</h3>
              <p>{selectedVideo.alt}</p>
              <div className="traditional-folklore-video-modal-actions">
                <button 
                  className="traditional-folklore-modal-btn primary"
                  onClick={() => handleDownload(selectedVideo)}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  {t('clubs.TraditionalFolklore.videoModal.download')}
                </button>
                <button 
                  className="traditional-folklore-modal-btn secondary"
                  onClick={() => handleShare(selectedVideo)}
                >
                  <FontAwesomeIcon icon={faShare} />
                  {t('clubs.TraditionalFolklore.videoModal.share')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRegistrationModalOpen && (
        <div className="traditional-folklore-registration-modal">
          <div className="traditional-folklore-registration-modal-overlay" onClick={closeRegistrationModal}></div>
          <div className="traditional-folklore-registration-modal-container">
            <button className="traditional-folklore-registration-modal-close" onClick={closeRegistrationModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="traditional-folklore-registration-header">
              <FontAwesomeIcon icon={faMusic} />
              <h3>{t('clubs.TraditionalFolklore.registrationModal.title')}</h3>
              <p>{t('clubs.TraditionalFolklore.registrationModal.subtitle')}</p>
            </div>
            
            {formStatus === 'sent' ? (
              <div className="traditional-folklore-form-success">
                <FontAwesomeIcon icon={faCheck} />
                <h4>{t('clubs.TraditionalFolklore.registrationModal.success.title')}</h4>
                <p>{t('clubs.TraditionalFolklore.registrationModal.success.message')}</p>
              </div>
            ) : formStatus === 'error' ? (
              <div className="traditional-folklore-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>{t('clubs.TraditionalFolklore.registrationModal.error.title')}</h4>
                <p>{t('clubs.TraditionalFolklore.registrationModal.error.message')}</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="traditional-folklore-registration-form">
                <div className="traditional-folklore-form-row">
                  <div className="traditional-folklore-form-group">
                    <label htmlFor="name">
                      <FontAwesomeIcon icon={faUser} />
                      {t('clubs.TraditionalFolklore.registrationModal.form.name')} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={registrationForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      required
                      placeholder={t('clubs.TraditionalFolklore.registrationModal.form.namePlaceholder')}
                    />
                  </div>
                  
                  <div className="traditional-folklore-form-group">
                    <label htmlFor="email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.TraditionalFolklore.registrationModal.form.email')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={registrationForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      required
                      placeholder={t('clubs.TraditionalFolklore.registrationModal.form.emailPlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="traditional-folklore-form-row">
                  <div className="traditional-folklore-form-group">
                    <label htmlFor="phone">
                      <FontAwesomeIcon icon={faPhone} />
                      {t('clubs.TraditionalFolklore.registrationModal.form.phone')}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={registrationForm.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder={t('clubs.TraditionalFolklore.registrationModal.form.phonePlaceholder')}
                    />
                  </div>
                  
                  <div className="traditional-folklore-form-group">
                    <label htmlFor="age">
                      <FontAwesomeIcon icon={faUsers} />
                      {t('clubs.TraditionalFolklore.registrationModal.form.age')}
                    </label>
                    <input
                      type="number"
                      id="age"
                      value={registrationForm.age}
                      onChange={(e) => handleFormChange('age', e.target.value)}
                      placeholder={t('clubs.TraditionalFolklore.registrationModal.form.agePlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="traditional-folklore-form-row">
                  <div className="traditional-folklore-form-group">
                    <label htmlFor="experience">
                      <FontAwesomeIcon icon={faAward} />
                      {t('clubs.TraditionalFolklore.registrationModal.form.experienceLabel')}
                    </label>
                    <select
                      id="experience"
                      value={registrationForm.experience}
                      onChange={(e) => handleFormChange('experience', e.target.value)}
                    >
                      {getExperienceOptions().map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="traditional-folklore-form-group">
                    <label htmlFor="activity">
                      <FontAwesomeIcon icon={faTheaterMasks} />
                      {t('clubs.TraditionalFolklore.registrationModal.form.activityLabel')}
                    </label>
                    <select
                      id="activity"
                      value={registrationForm.activity}
                      onChange={(e) => handleFormChange('activity', e.target.value)}
                    >
                      {getActivityOptions().map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="traditional-folklore-form-group">
                  <label htmlFor="message">
                    <FontAwesomeIcon icon={faEnvelope} />
                    {t('clubs.TraditionalFolklore.registrationModal.form.message')}
                  </label>
                  <textarea
                    id="message"
                    value={registrationForm.message}
                    onChange={(e) => handleFormChange('message', e.target.value)}
                    placeholder={t('clubs.TraditionalFolklore.registrationModal.form.messagePlaceholder')}
                    rows="4"
                  />
                </div>
                
                <div className="traditional-folklore-form-actions">
                  <button 
                    type="submit" 
                    className="traditional-folklore-submit-btn"
                    disabled={formStatus === 'sending'}
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                    {formStatus === 'sending' ? 
                      t('clubs.TraditionalFolklore.registrationModal.form.sending') : 
                      t('clubs.TraditionalFolklore.registrationModal.form.submit')}
                  </button>
                  <button 
                    type="button" 
                    onClick={closeRegistrationModal}
                    className="traditional-folklore-cancel-btn"
                  >
                    {t('clubs.TraditionalFolklore.registrationModal.form.cancel')}
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

export default TraditionalFolklore;