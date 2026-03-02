import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation('clubs');
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

  if (!club?.name && !club?.shortDescription && !club?.stats && !club?.activities) {
    return null;
  }

  const stats = club.stats || {};
  const activities = club.activities || {};
  const regularActivities = activities.regular || [];
  const contacts = club.contacts || {};
  const achievements = club.achievements || {};
  const media = club.media || {};
  const videos = media.videos || [];
  const location = club.location || {};

  if (!club.name && !club.shortDescription) {
    return null;
  }

  const getSportsStats = () => [
    {
      icon: faUsers,
      value: stats.totalMembers || club.membership?.totalMembers || 0,
      label: t('clubs.SportsHero.stats.activeMembers'),
      color: '#22c55e'
    },
    {
      icon: faDumbbell,
      value: stats.programs || regularActivities.length || 0,
      label: t('clubs.SportsHero.stats.programs'),
      color: '#f97316'
    },
    {
      icon: faTrophy,
      value: stats.competitions || stats.events || 0,
      label: t('clubs.SportsHero.stats.competitions'),
      color: '#3b82f6'
    },
    {
      icon: faStopwatch,
      value: stats.avgWeeklyWorkouts || stats.yearsActive || 0,
      label: stats.avgWeeklyWorkouts ? 
        t('clubs.SportsHero.stats.workoutsPerWeek') : 
        t('clubs.SportsHero.stats.yearsActive'),
      color: '#8b5cf6'
    }
  ];

  const sportsStats = getSportsStats();

  const getActivityIcon = (activityName) => {
    const name = activityName.toLowerCase();
    const iconTerms = t('clubs.SportsHero.activityIconTerms', { returnObjects: true });
    
    for (const [iconKey, terms] of Object.entries(iconTerms)) {
      if (terms.some(term => name.includes(term))) {
        const iconMap = {
          yoga: faLeaf,
          cardio: faHeartbeat,
          strength: faDumbbell,
          running: faRunning,
          dance: faFire
        };
        return iconMap[iconKey] || faFlag;
      }
    }
    return faFlag;
  };

  const popularActivities = regularActivities.slice(0, 3).map(activity => ({
    name: activity.name,
    participants: activity.participants || 0,
    day: activity.day,
    time: activity.time,
    description: activity.description,
    instructor: activity.instructor,
    icon: getActivityIcon(activity.name)
  }));

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
      const subject = encodeURIComponent(t('clubs.SportsHero.contactEmail.subject', { 
        name: contactForm.name, 
        clubName: club.name 
      }));
      const body = encodeURIComponent(t('clubs.SportsHero.contactEmail.body', {
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone,
        message: contactForm.message,
        clubName: club.name
      }));
      
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
      const subject = encodeURIComponent(t('clubs.SportsHero.enrollEmail.subject', { 
        programName: selectedProgram.name 
      }));
      const body = encodeURIComponent(t('clubs.SportsHero.enrollEmail.body', {
        programName: selectedProgram.name,
        day: selectedProgram.day,
        time: selectedProgram.time,
        instructor: selectedProgram.instructor || t('clubs.SportsHero.enrollEmail.noInstructor'),
        name: enrollForm.name,
        email: enrollForm.email,
        phone: enrollForm.phone,
        age: enrollForm.age,
        experience: enrollForm.experience,
        healthConditions: enrollForm.healthConditions || t('clubs.SportsHero.enrollEmail.noHealthIssues'),
        clubName: club.name
      }));
      
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
      console.error('Copy error:', error);
    }
  };

  const getExperienceLevels = () => [
    { value: '', label: t('clubs.SportsHero.experienceLevels.select') },
    { value: 'Начинаещ', label: t('clubs.SportsHero.experienceLevels.beginner') },
    { value: 'Средно ниво', label: t('clubs.SportsHero.experienceLevels.intermediate') },
    { value: 'Напреднал', label: t('clubs.SportsHero.experienceLevels.advanced') },
    { value: 'Експерт', label: t('clubs.SportsHero.experienceLevels.expert') }
  ];

  const experienceLevels = getExperienceLevels();

  const formatJoinDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'de' ? 'de-DE' : 'en-US';
    
    return date.toLocaleDateString(locale);
  };

  const getDefaultAchievement = () => {
    return achievements.awards?.[0]?.name || 
           achievements.recognitions?.[0] || 
           t('clubs.SportsHero.defaultAchievement');
  };

  const getMemberLabel = (count) => {
    if (count === 1) return t('clubs.SportsHero.members.single');
    return t('clubs.SportsHero.members.plural');
  };

  return (
    <section id="sports-hero" className="sports-hero-section">
      <div className="sports-hero-container">
        
        <div className="sports-hero-content">
          <div className="sports-hero-text">
            <div className="sports-hero-badge">
              <FontAwesomeIcon icon={faBolt} />
              <span>{t('clubs.SportsHero.badge')}</span>
            </div>
            
            <h1 className="sports-hero-title">
              {club.name}
            </h1>
            
            <p className="sports-hero-description">
              {club.shortDescription || club.fullDescription}
            </p>

            <div className="sports-hero-actions">
              <button 
                onClick={() => setShowContactModal(true)}
                className="sports-hero-btn primary"
              >
                <FontAwesomeIcon icon={faEnvelope} />
                <span>{t('clubs.SportsHero.actions.writeToUs')}</span>
              </button>
              {contacts.phone && (
                <a href={`tel:${contacts.phone}`} className="sports-hero-btn secondary">
                  <FontAwesomeIcon icon={faPhone} />
                  <span>{t('clubs.SportsHero.actions.callUs')}</span>
                </a>
              )}
            </div>

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
                  <span>{t('clubs.SportsHero.quickInfo.open')}: {contacts.workingHours.monday}</span>
                </div>
              )}
            </div>
          </div>

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
                    <span>{getDefaultAchievement()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="sports-hero-placeholder">
                <FontAwesomeIcon icon={faRunning} />
                <h3>{t('clubs.SportsHero.placeholder.title')}</h3>
                <p>{t('clubs.SportsHero.placeholder.subtitle')}</p>
              </div>
            )}
          </div>
        </div>

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
            <span>{t('clubs.SportsHero.membersButton', { count: members.length })}</span>
          </button>
        )}

        {popularActivities.length > 0 && (
          <div className="sports-hero-activities">
            <h3 className="sports-hero-activities-title">
              <FontAwesomeIcon icon={faFire} />
              {t('clubs.SportsHero.popularPrograms.title')}
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
                        {t('clubs.SportsHero.popularPrograms.participants', { count: activity.participants })}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => openEnrollModal(activity)}
                    className="sports-hero-activity-join"
                    title={t('clubs.SportsHero.popularPrograms.enrollTooltip')}
                  >
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {videos.length > 0 && (
          <div className="sports-hero-videos">
            <h3 className="sports-hero-videos-title">
              <FontAwesomeIcon icon={faPlay} />
              {t('clubs.SportsHero.videos.title')}
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

        <div className="sports-hero-cta">
          <div className="sports-hero-cta-content">
            <h3>{t('clubs.SportsHero.cta.title')}</h3>
            <p>{t('clubs.SportsHero.cta.subtitle')}</p>
            <div className="sports-hero-cta-actions">
              <button 
                onClick={() => setShowContactModal(true)}
                className="sports-hero-cta-btn"
              >
                <FontAwesomeIcon icon={faEnvelope} />
                <span>{t('clubs.SportsHero.cta.writeToUs')}</span>
              </button>
              <button 
                onClick={() => setShowEnrollModal(true)}
                className="sports-hero-cta-btn outline"
              >
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>{t('clubs.SportsHero.cta.enrollForWorkout')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

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
              <h3>{t('clubs.SportsHero.contactModal.title')}</h3>
              <p>{t('clubs.SportsHero.contactModal.subtitle')}</p>
            </div>
            
            {contactStatus === 'sent' ? (
              <div className="sports-hero-form-success">
                <FontAwesomeIcon icon={faCheckCircle} />
                <h4>{t('clubs.SportsHero.contactModal.success.title')}</h4>
                <p>{t('clubs.SportsHero.contactModal.success.message')}</p>
              </div>
            ) : contactStatus === 'error' ? (
              <div className="sports-hero-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>{t('clubs.SportsHero.contactModal.error.title')}</h4>
                <p>{t('clubs.SportsHero.contactModal.error.message')}</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="sports-hero-form">
                <div className="sports-hero-form-row">
                  <div className="sports-hero-form-group">
                    <label htmlFor="contact-name">
                      <FontAwesomeIcon icon={faUser} />
                      {t('clubs.SportsHero.contactModal.form.name')} *
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      value={contactForm.name}
                      onChange={(e) => handleContactChange('name', e.target.value)}
                      required
                      placeholder={t('clubs.SportsHero.contactModal.form.namePlaceholder')}
                    />
                  </div>
                  
                  <div className="sports-hero-form-group">
                    <label htmlFor="contact-email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.SportsHero.contactModal.form.email')} *
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      value={contactForm.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      required
                      placeholder={t('clubs.SportsHero.contactModal.form.emailPlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="sports-hero-form-group">
                  <label htmlFor="contact-phone">
                    <FontAwesomeIcon icon={faPhone} />
                    {t('clubs.SportsHero.contactModal.form.phone')}
                  </label>
                  <input
                    type="tel"
                    id="contact-phone"
                    value={contactForm.phone}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    placeholder={t('clubs.SportsHero.contactModal.form.phonePlaceholder')}
                  />
                </div>
                
                <div className="sports-hero-form-group">
                  <label htmlFor="contact-message">
                    <FontAwesomeIcon icon={faEnvelope} />
                    {t('clubs.SportsHero.contactModal.form.message')} *
                  </label>
                  <textarea
                    id="contact-message"
                    value={contactForm.message}
                    onChange={(e) => handleContactChange('message', e.target.value)}
                    required
                    placeholder={t('clubs.SportsHero.contactModal.form.messagePlaceholder')}
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
                    {contactStatus === 'sending' ? 
                      t('clubs.SportsHero.contactModal.form.sending') : 
                      t('clubs.SportsHero.contactModal.form.submit')}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowContactModal(false)}
                    className="sports-hero-cancel-btn"
                  >
                    {t('clubs.SportsHero.contactModal.form.cancel')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
              <h3>{t('clubs.SportsHero.enrollModal.title')}</h3>
              {selectedProgram ? (
                <p>{t('clubs.SportsHero.enrollModal.selectedProgram', { programName: selectedProgram.name })}</p>
              ) : (
                <p>{t('clubs.SportsHero.enrollModal.selectProgram')}</p>
              )}
            </div>
            
            {enrollStatus === 'sent' ? (
              <div className="sports-hero-form-success">
                <FontAwesomeIcon icon={faCheckCircle} />
                <h4>{t('clubs.SportsHero.enrollModal.success.title')}</h4>
                <p>{t('clubs.SportsHero.enrollModal.success.message')}</p>
              </div>
            ) : enrollStatus === 'error' ? (
              <div className="sports-hero-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>{t('clubs.SportsHero.enrollModal.error.title')}</h4>
                <p>{t('clubs.SportsHero.enrollModal.error.message')}</p>
              </div>
            ) : (
              <form onSubmit={handleEnrollSubmit} className="sports-hero-form">
                {!selectedProgram && (
                  <div className="sports-hero-program-selection">
                    <h4>{t('clubs.SportsHero.enrollModal.chooseProgram')}:</h4>
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
                    <h4>{t('clubs.SportsHero.enrollModal.chosenProgram')}:</h4>
                    <div className="sports-hero-program-details">
                      <FontAwesomeIcon icon={selectedProgram.icon} />
                      <div>
                        <strong>{selectedProgram.name}</strong>
                        <span>{selectedProgram.day} • {selectedProgram.time}</span>
                        {selectedProgram.instructor && <span>{t('clubs.SportsHero.enrollModal.instructor')}: {selectedProgram.instructor}</span>}
                      </div>
                      <button 
                        type="button"
                        onClick={() => setSelectedProgram(null)}
                        className="sports-hero-change-program"
                      >
                        {t('clubs.SportsHero.enrollModal.changeProgram')}
                      </button>
                    </div>
                  </div>
                )}

                <div className="sports-hero-form-row">
                  <div className="sports-hero-form-group">
                    <label htmlFor="enroll-name">
                      <FontAwesomeIcon icon={faUser} />
                      {t('clubs.SportsHero.enrollModal.form.name')} *
                    </label>
                    <input
                      type="text"
                      id="enroll-name"
                      value={enrollForm.name}
                      onChange={(e) => handleEnrollChange('name', e.target.value)}
                      required
                      placeholder={t('clubs.SportsHero.enrollModal.form.namePlaceholder')}
                    />
                  </div>
                  
                  <div className="sports-hero-form-group">
                    <label htmlFor="enroll-email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.SportsHero.enrollModal.form.email')} *
                    </label>
                    <input
                      type="email"
                      id="enroll-email"
                      value={enrollForm.email}
                      onChange={(e) => handleEnrollChange('email', e.target.value)}
                      required
                      placeholder={t('clubs.SportsHero.enrollModal.form.emailPlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="sports-hero-form-row">
                  <div className="sports-hero-form-group">
                    <label htmlFor="enroll-phone">
                      <FontAwesomeIcon icon={faPhone} />
                      {t('clubs.SportsHero.enrollModal.form.phone')} *
                    </label>
                    <input
                      type="tel"
                      id="enroll-phone"
                      value={enrollForm.phone}
                      onChange={(e) => handleEnrollChange('phone', e.target.value)}
                      required
                      placeholder={t('clubs.SportsHero.enrollModal.form.phonePlaceholder')}
                    />
                  </div>
                  
                  <div className="sports-hero-form-group">
                    <label htmlFor="enroll-age">
                      <FontAwesomeIcon icon={faUser} />
                      {t('clubs.SportsHero.enrollModal.form.age')}
                    </label>
                    <input
                      type="number"
                      id="enroll-age"
                      value={enrollForm.age}
                      onChange={(e) => handleEnrollChange('age', e.target.value)}
                      placeholder={t('clubs.SportsHero.enrollModal.form.agePlaceholder')}
                      min="18"
                      max="120"
                    />
                  </div>
                </div>
                
                <div className="sports-hero-form-group">
                  <label htmlFor="enroll-experience">
                    <FontAwesomeIcon icon={faTrophy} />
                    {t('clubs.SportsHero.enrollModal.form.experience')}
                  </label>
                  <select
                    id="enroll-experience"
                    value={enrollForm.experience}
                    onChange={(e) => handleEnrollChange('experience', e.target.value)}
                  >
                    {experienceLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="sports-hero-form-group">
                  <label htmlFor="enroll-health">
                    <FontAwesomeIcon icon={faHeartbeat} />
                    {t('clubs.SportsHero.enrollModal.form.healthRestrictions')}
                  </label>
                  <textarea
                    id="enroll-health"
                    value={enrollForm.healthConditions}
                    onChange={(e) => handleEnrollChange('healthConditions', e.target.value)}
                    placeholder={t('clubs.SportsHero.enrollModal.form.healthPlaceholder')}
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
                    {enrollStatus === 'sending' ? 
                      t('clubs.SportsHero.enrollModal.form.sending') : 
                      t('clubs.SportsHero.enrollModal.form.submit')}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowEnrollModal(false)}
                    className="sports-hero-cancel-btn"
                  >
                    {t('clubs.SportsHero.enrollModal.form.cancel')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
              <h3>{t('clubs.SportsHero.membersModal.title')}</h3>
              <p>{t('clubs.SportsHero.membersModal.total', { count: members.length, label: getMemberLabel(members.length) })}</p>
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
                          title={t('clubs.SportsHero.membersModal.copyName')}
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
                              title={t('clubs.SportsHero.membersModal.copyPhone')}
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
                              title={t('clubs.SportsHero.membersModal.copyEmail')}
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
                              title={t('clubs.SportsHero.membersModal.copyAddress')}
                            >
                              <FontAwesomeIcon icon={copiedItems[`${member.id}-address`] ? faCheckCircle : faCopy} />
                            </button>
                          </div>
                        )}
                        
                        {member.joinDate && (
                          <div className="sports-hero-member-detail">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            <span>{t('clubs.SportsHero.membersModal.memberSince')} {formatJoinDate(member.joinDate)}</span>
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