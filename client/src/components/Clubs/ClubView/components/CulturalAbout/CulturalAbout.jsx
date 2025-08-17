import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTheaterMasks,
  faMusic,
  faBookOpen,
  faAward,
  faHeart,
  faPalette,
  faUsers,
  faHandsHelping,
  faStar,
  faQuoteLeft,
  faCalendarAlt,
  faGem,
  faTimes,
  faUser,
  faPhone,
  faEnvelope,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './culturalAbout.css';

export const CulturalAbout = ({ club }) => {
  const { t } = useTranslation();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinForm, setJoinForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    interests: []
  });
  const [formStatus, setFormStatus] = useState(null);

  if (!club?.name) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const yearsActive = currentYear - (club.foundedYear || currentYear);

  const achievements = club.achievements?.awards || [];
  const hasAchievements = achievements.length > 0;

  const hasStats = club.membership?.totalMembers || club.activities?.regular?.length || hasAchievements || yearsActive > 0;

  const communityImpact = club.stats?.communityImpact || {};
  const hasCommunityImpact = Object.keys(communityImpact).length > 0;

  const openJoinModal = () => {
    setShowJoinModal(true);
  };

  const closeJoinModal = () => {
    setShowJoinModal(false);
    setJoinForm({
      name: '',
      email: '',
      phone: '',
      message: '',
      interests: []
    });
    setFormStatus(null);
  };

  const handleFormChange = (field, value) => {
    setJoinForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestToggle = (interest) => {
    setJoinForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    if (club.contacts?.email) {
      const subject = encodeURIComponent(t('clubs.CulturalAbout.modal.emailSubject', { clubName: club.name }));
      const body = encodeURIComponent(t('clubs.CulturalAbout.modal.emailBody', {
        clubName: club.name,
        name: joinForm.name,
        email: joinForm.email,
        phone: joinForm.phone || t('clubs.CulturalAbout.modal.notSpecified'),
        interests: joinForm.interests.join(', ') || t('clubs.CulturalAbout.modal.noInterests'),
        message: joinForm.message || t('clubs.CulturalAbout.modal.noMessage'),
        senderEmail: joinForm.email
      }));
      
      try {
        window.location.href = `mailto:${club.contacts.email}?subject=${subject}&body=${body}`;
        setFormStatus('sent');
        setTimeout(() => {
          closeJoinModal();
        }, 2000);
      } catch (error) {
        setFormStatus('error');
      }
    } else {
      setFormStatus('error');
    }
  };

  const handleViewActivities = () => {
    const activitiesSection = document.getElementById('club-activities');
    if (activitiesSection) {
      activitiesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getAvailableInterests = () => [
    t('clubs.CulturalAbout.interests.choralSinging'),
    t('clubs.CulturalAbout.interests.folkDances'),
    t('clubs.CulturalAbout.interests.visualArts'),
    t('clubs.CulturalAbout.interests.literaryReadings'),
    t('clubs.CulturalAbout.interests.music'),
    t('clubs.CulturalAbout.interests.theater')
  ];

  return (
    <section id="cultural-about" className="cultural-about-main-section">
      <div className="cultural-about-container">
        
        <div className="cultural-about-header">
          <div className="cultural-about-badge">
            <FontAwesomeIcon icon={faBookOpen} />
            <span>{t('clubs.CulturalAbout.header.badge')}</span>
          </div>
          <h2 className="cultural-about-title">{t('clubs.CulturalAbout.header.title')}</h2>
          {yearsActive > 0 && (
            <p className="cultural-about-subtitle">
              {t('clubs.CulturalAbout.header.subtitle', { years: yearsActive })}
            </p>
          )}
        </div>

        <div className="cultural-about-content-grid">
          
          <div className="cultural-about-main-content">
            
            {(club.fullDescription || club.foundedYear) && (
              <div className="cultural-about-story-card">
                <div className="cultural-about-story-header">
                  <FontAwesomeIcon icon={faBookOpen} />
                  <h3>{t('clubs.CulturalAbout.story.title')}</h3>
                </div>
                <div className="cultural-about-story-content">
                  {club.fullDescription && (
                    <p className="cultural-about-story-text">
                      {club.fullDescription}
                    </p>
                  )}
                  
                  {club.foundedYear && (
                    <div className="cultural-about-timeline-highlight">
                      <div className="cultural-about-timeline-year">{club.foundedYear}</div>
                      <div className="cultural-about-timeline-event">{t('clubs.CulturalAbout.story.founded')}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {club.mission && (
              <div className="cultural-about-mission-card">
                <div className="cultural-about-mission-header">
                  <FontAwesomeIcon icon={faGem} />
                  <h3>{t('clubs.CulturalAbout.mission.title')}</h3>
                </div>
                <div className="cultural-about-mission-content">
                  <p className="cultural-about-mission-text">{club.mission}</p>
                </div>
              </div>
            )}

            {(club.testimonials?.length > 0 || club.management?.board?.[0]?.name) && (
              <div className="cultural-about-quote-card">
                <div className="cultural-about-quote-content">
                  <FontAwesomeIcon icon={faQuoteLeft} className="cultural-about-quote-icon" />
                  <blockquote>
                    {club.testimonials?.[0]?.text || 
                     t('clubs.CulturalAbout.quote.defaultText')
                    }
                  </blockquote>
                  <cite>
                    - {club.testimonials?.[0]?.author || club.management?.board?.[0]?.name || t('clubs.CulturalAbout.quote.defaultAuthor')}
                  </cite>
                </div>
              </div>
            )}
          </div>

          <div className="cultural-about-sidebar">
            
            {hasStats && (
              <div className="cultural-about-stats-card">
                <div className="cultural-about-stats-header">
                  <FontAwesomeIcon icon={faStar} />
                  <h3>{t('clubs.CulturalAbout.stats.title')}</h3>
                </div>
                <div className="cultural-about-stats-list">
                  {club.membership?.totalMembers && (
                    <div className="cultural-about-stat-item">
                      <div className="cultural-about-stat-number">{club.membership.totalMembers}</div>
                      <div className="cultural-about-stat-label">{t('clubs.CulturalAbout.stats.activeMembers')}</div>
                    </div>
                  )}
                  {yearsActive > 0 && (
                    <div className="cultural-about-stat-item">
                      <div className="cultural-about-stat-number">{yearsActive}</div>
                      <div className="cultural-about-stat-label">{t('clubs.CulturalAbout.stats.yearsExperience')}</div>
                    </div>
                  )}
                  {club.activities?.regular?.length && (
                    <div className="cultural-about-stat-item">
                      <div className="cultural-about-stat-number">{club.activities.regular.length}</div>
                      <div className="cultural-about-stat-label">{t('clubs.CulturalAbout.stats.regularPrograms')}</div>
                    </div>
                  )}
                  {hasAchievements && (
                    <div className="cultural-about-stat-item">
                      <div className="cultural-about-stat-number">{achievements.length}</div>
                      <div className="cultural-about-stat-label">{t('clubs.CulturalAbout.stats.prestigiousAwards')}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {hasAchievements && (
              <div className="cultural-about-achievements-card">
                <div className="cultural-about-achievements-header">
                  <FontAwesomeIcon icon={faAward} />
                  <h3>{t('clubs.CulturalAbout.achievements.title')}</h3>
                </div>
                <div className="cultural-about-achievements-list">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="cultural-about-achievement-item">
                      <div className="cultural-about-achievement-year">{achievement.year}</div>
                      <div className="cultural-about-achievement-content">
                        <h4>{achievement.name}</h4>
                        {achievement.awardedBy && <p>{achievement.awardedBy}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {club.activities?.regular?.length > 0 && (
              <div className="cultural-about-specialties-card">
                <div className="cultural-about-specialties-header">
                  <FontAwesomeIcon icon={faPalette} />
                  <h3>{t('clubs.CulturalAbout.specialties.title')}</h3>
                </div>
                <div className="cultural-about-specialties-list">
                  {club.activities.regular.slice(0, 4).map((activity, index) => (
                    <div key={index} className="cultural-about-specialty-item">
                      <div className="cultural-about-specialty-icon">
                        <FontAwesomeIcon icon={activity.icon ? eval(activity.icon) : faMusic} />
                      </div>
                      <div className="cultural-about-specialty-content">
                        <h4>{activity.name}</h4>
                        {activity.description && <p>{activity.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {hasCommunityImpact && (
          <div className="cultural-about-community-impact">
            <div className="cultural-about-impact-header">
              <FontAwesomeIcon icon={faHandsHelping} />
              <h3>{t('clubs.CulturalAbout.communityImpact.title')}</h3>
            </div>
            <div className="cultural-about-impact-grid">
              {communityImpact.events && (
                <div className="cultural-about-impact-item">
                  <div className="cultural-about-impact-number">{communityImpact.events}+</div>
                  <div className="cultural-about-impact-label">{t('clubs.CulturalAbout.communityImpact.eventsYearly')}</div>
                </div>
              )}
              {communityImpact.visitors && (
                <div className="cultural-about-impact-item">
                  <div className="cultural-about-impact-number">{communityImpact.visitors}+</div>
                  <div className="cultural-about-impact-label">{t('clubs.CulturalAbout.communityImpact.concertVisitors')}</div>
                </div>
              )}
              {communityImpact.initiatives && (
                <div className="cultural-about-impact-item">
                  <div className="cultural-about-impact-number">{communityImpact.initiatives}+</div>
                  <div className="cultural-about-impact-label">{t('clubs.CulturalAbout.communityImpact.volunteerInitiatives')}</div>
                </div>
              )}
              {communityImpact.familiesSupported && (
                <div className="cultural-about-impact-item">
                  <div className="cultural-about-impact-number">{communityImpact.familiesSupported}+</div>
                  <div className="cultural-about-impact-label">{t('clubs.CulturalAbout.communityImpact.familiesSupported')}</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="cultural-about-cta-section">
          <div className="cultural-about-cta-content">
            <h3>{t('clubs.CulturalAbout.cta.title')}</h3>
            <p>{t('clubs.CulturalAbout.cta.subtitle')}</p>
            <div className="cultural-about-cta-buttons">
              <button className="cultural-about-btn-primary" onClick={openJoinModal}>
                <FontAwesomeIcon icon={faUsers} />
                {t('clubs.CulturalAbout.cta.joinButton')}
              </button>
              <button className="cultural-about-btn-secondary" onClick={handleViewActivities}>
                <FontAwesomeIcon icon={faCalendarAlt} />
                {t('clubs.CulturalAbout.cta.viewProgramButton')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showJoinModal && (
        <div className="cultural-about-join-modal">
          <div className="cultural-about-join-modal-overlay" onClick={closeJoinModal}></div>
          <div className="cultural-about-join-modal-container">
            <button className="cultural-about-join-modal-close" onClick={closeJoinModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="cultural-about-join-header">
              <FontAwesomeIcon icon={faUsers} />
              <h3>{t('clubs.CulturalAbout.modal.title', { clubName: club.name })}</h3>
              <p>{t('clubs.CulturalAbout.modal.subtitle')}</p>
            </div>
            
            {formStatus === 'sent' ? (
              <div className="cultural-about-form-success">
                <FontAwesomeIcon icon={faCheck} />
                <h4>{t('clubs.CulturalAbout.modal.success.title')}</h4>
                <p>{t('clubs.CulturalAbout.modal.success.message')}</p>
              </div>
            ) : formStatus === 'error' ? (
              <div className="cultural-about-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>{t('clubs.CulturalAbout.modal.error.title')}</h4>
                <p>{t('clubs.CulturalAbout.modal.error.message')}</p>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit} className="cultural-about-join-form">
                <div className="cultural-about-form-row">
                  <div className="cultural-about-form-group">
                    <label htmlFor="joinName">
                      <FontAwesomeIcon icon={faUser} />
                      {t('clubs.CulturalAbout.modal.form.name')} *
                    </label>
                    <input
                      type="text"
                      id="joinName"
                      value={joinForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      required
                      placeholder={t('clubs.CulturalAbout.modal.form.namePlaceholder')}
                    />
                  </div>
                  
                  <div className="cultural-about-form-group">
                    <label htmlFor="joinEmail">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.CulturalAbout.modal.form.email')} *
                    </label>
                    <input
                      type="email"
                      id="joinEmail"
                      value={joinForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      required
                      placeholder={t('clubs.CulturalAbout.modal.form.emailPlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="cultural-about-form-group">
                  <label htmlFor="joinPhone">
                    <FontAwesomeIcon icon={faPhone} />
                    {t('clubs.CulturalAbout.modal.form.phone')}
                  </label>
                  <input
                    type="tel"
                    id="joinPhone"
                    value={joinForm.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    placeholder={t('clubs.CulturalAbout.modal.form.phonePlaceholder')}
                  />
                </div>

                <div className="cultural-about-form-group">
                  <label>
                    <FontAwesomeIcon icon={faHeart} />
                    {t('clubs.CulturalAbout.modal.form.interests')}
                  </label>
                  <div className="cultural-about-interests-grid">
                    {getAvailableInterests().map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        className={`cultural-about-interest-btn ${joinForm.interests.includes(interest) ? 'selected' : ''}`}
                        onClick={() => handleInterestToggle(interest)}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="cultural-about-form-group">
                  <label htmlFor="joinMessage">
                    <FontAwesomeIcon icon={faEnvelope} />
                    {t('clubs.CulturalAbout.modal.form.message')}
                  </label>
                  <textarea
                    id="joinMessage"
                    value={joinForm.message}
                    onChange={(e) => handleFormChange('message', e.target.value)}
                    placeholder={t('clubs.CulturalAbout.modal.form.messagePlaceholder')}
                    rows="4"
                  />
                </div>
                
                <div className="cultural-about-form-actions">
                  <button 
                    type="submit" 
                    className="cultural-about-submit-btn"
                    disabled={formStatus === 'sending'}
                  >
                    <FontAwesomeIcon icon={faUsers} />
                    {formStatus === 'sending' ? t('clubs.CulturalAbout.modal.form.sending') : t('clubs.CulturalAbout.modal.form.submit')}
                  </button>
                  <button 
                    type="button" 
                    onClick={closeJoinModal}
                    className="cultural-about-cancel-btn"
                  >
                    {t('clubs.CulturalAbout.modal.form.cancel')}
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

export default CulturalAbout;