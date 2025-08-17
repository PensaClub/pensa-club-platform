import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faUsers,
  faCalendarAlt,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faChevronDown,
  faHeart,
  faHandHoldingHeart,
  faHandsHelping,
  faGlobe,
  faClock,
  faTag,
  faTimes,
  faUser,
  faCheck,
  faExclamationTriangle,
  faUserFriends,
  faIdCard,
  faAddressCard,
  faCopy,
  faCheckCircle,
  faAward,
  faSearch,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import './socialHero.css';

export const SocialHero = ({ club }) => {
  const { t, i18n } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [copiedItems, setCopiedItems] = useState({});
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  if (!club?.name) {
    return null;
  }

  const heroImages = [];

  if (club.mainImage) {
    heroImages.push(club.mainImage);
  }

  if (club.gallery && club.gallery.length > 0) {
    heroImages.push(...club.gallery);
  }

  if (heroImages.length === 0) {
    heroImages.push('https://picsum.photos/1920/1080?random=501');
  }

  const getAvailableStats = () => {
    const stats = [];
    if (club.stats?.totalMembers) {
      stats.push({
        icon: faUsers,
        label: t('clubs.SocialHero.stats.members'),
        value: `${club.stats.totalMembers}+`,
        color: '#16a34a'
      });
    }
    if (club.foundedYear) {
      stats.push({
        icon: faCalendarAlt,
        label: t('clubs.SocialHero.stats.founded'),
        value: club.foundedYear,
        color: '#0891b2'
      });
    }
    if (club.stats?.projectsBeneficiaries) {
      stats.push({
        icon: faHandHoldingHeart,
        label: t('clubs.SocialHero.stats.helped'),
        value: `${club.stats.projectsBeneficiaries}+`,
        color: '#dc2626'
      });
    }
    if (club.stats?.donationsDistributed) {
      stats.push({
        icon: faHeart,
        label: t('clubs.SocialHero.stats.donationsDistributed'),
        value: `${club.stats.donationsDistributed}+`,
        color: '#7c3aed'
      });
    }
    return stats;
  };

  const availableStats = getAvailableStats();
  const firstVideo = club.media?.videos && club.media.videos.length > 0 ? club.media.videos[0] : null;
  const hasContacts = club.contacts?.phone || club.contacts?.mobile || club.contacts?.email;
  const members = club.members || [];

  const formatJoinDate = (dateString) => {
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'en' ? 'en-US' : 
                   'de-DE';
    
    return new Date(dateString).toLocaleDateString(locale);
  };

  const getFilteredMembers = () => {
    return members.filter(member => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      const searchLower = memberSearchTerm.toLowerCase();
      return fullName.includes(searchLower) || 
             member.phone?.includes(searchLower) ||
             member.email?.toLowerCase().includes(searchLower);
    });
  };

  const filteredMembers = getFilteredMembers();

  const getMemberCountLabel = (count) => {
    if (i18n.language === 'bg') {
      return count === 1 ? 'член' : 'членове';
    } else if (i18n.language === 'en') {
      return count === 1 ? 'member' : 'members';
    } else {
      return count === 1 ? 'Mitglied' : 'Mitglieder';
    }
  };

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  const handleScrollToContent = () => {
    const aboutSection = document.getElementById('social-about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleVideoPlay = () => {
    if (firstVideo) {
      setIsVideoModalOpen(true);
    }
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
  };

  const openEmailModal = () => {
    setIsEmailModalOpen(true);
  };

  const closeEmailModal = () => {
    setIsEmailModalOpen(false);
    setEmailForm({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
    setFormStatus(null);
  };

  const handleFormChange = (field, value) => {
    setEmailForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    if (club.contacts?.email) {
      const subject = encodeURIComponent(t('clubs.SocialHero.email.subject', { clubName: club.name }));
      const body = encodeURIComponent(t('clubs.SocialHero.email.body', {
        clubName: club.name,
        name: emailForm.name,
        email: emailForm.email,
        phone: emailForm.phone || t('clubs.SocialHero.form.notSpecified'),
        message: emailForm.message,
        senderEmail: emailForm.email
      }));

      try {
        window.location.href = `mailto:${club.contacts.email}?subject=${subject}&body=${body}`;
        setFormStatus('sent');
        setTimeout(() => {
          closeEmailModal();
        }, 2000);
      } catch (error) {
        setFormStatus('error');
      }
    } else {
      setFormStatus('error');
    }
  };

  const handleContactAction = (type) => {
    switch (type) {
      case 'phone':
        if (club.contacts?.phone || club.contacts?.mobile) {
          window.open(`tel:${club.contacts.phone || club.contacts.mobile}`);
        }
        break;
      case 'email':
        openEmailModal();
        break;
      case 'visit':
        const locationSection = document.getElementById('social-location');
        if (locationSection) {
          locationSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          alert(t('clubs.SocialHero.actions.locationInfo'));
        }
        break;
      default:
        break;
    }
  };

  const clearSearch = () => {
    setMemberSearchTerm('');
  };

  const closeMembersModal = () => {
    setShowMembersModal(false);
    setMemberSearchTerm('');
  };

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
      console.error(t('clubs.SocialHero.members.copyError'), error);
    }
  };

  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    return text.replace(
      new RegExp(`(${searchTerm})`, 'gi'),
      '<mark>$1</mark>'
    );
  };

  return (
    <section id="social-hero" className="social-hero-main-section">
      <div className="social-hero-background">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`social-hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className="social-hero-overlay" />
      </div>

      <div className="social-hero-container">
        <div className="social-hero-content">
          <div className="social-hero-badge">
            <FontAwesomeIcon icon={faHandsHelping} />
            <span>{t('clubs.SocialHero.badge')}</span>
          </div>

          <h1 className="social-hero-title">
            {club.name}
          </h1>

          {club.shortDescription && (
            <p className="social-hero-subtitle">
              {club.shortDescription}
            </p>
          )}

          {club.fullDescription && (
            <p className="social-hero-description">
              {club.fullDescription}
            </p>
          )}

          {(firstVideo || club.location || club.contacts) && (
            <div className="social-hero-actions">
              {firstVideo && (
                <button
                  className="social-hero-btn primary"
                  onClick={handleVideoPlay}
                >
                  <FontAwesomeIcon icon={faPlay} />
                  {t('clubs.SocialHero.actions.watchVideo')}
                </button>
              )}
              <button
                className="social-hero-btn secondary"
                onClick={() => handleContactAction('visit')}
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                {t('clubs.SocialHero.actions.visitUs')}
              </button>
            </div>
          )}

          {hasContacts && (
            <div className="social-hero-quick-contact">
              {(club.contacts?.phone || club.contacts?.mobile) && (
                <button
                  className="social-hero-contact-btn"
                  onClick={() => handleContactAction('phone')}
                >
                  <FontAwesomeIcon icon={faPhone} />
                  <span>{club.contacts.phone || club.contacts.mobile}</span>
                </button>
              )}
              {club.contacts?.email && (
                <button
                  className="social-hero-contact-btn"
                  onClick={() => handleContactAction('email')}
                >
                  <FontAwesomeIcon icon={faEnvelope} />
                  <span>{t('clubs.SocialHero.actions.writeUs')}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {availableStats.length > 0 && (
          <div className="social-hero-stats">
            {availableStats.map((stat, index) => (
              <div key={index} className="social-hero-stat-card">
                <div
                  className="social-hero-stat-icon"
                  style={{ backgroundColor: stat.color }}
                >
                  <FontAwesomeIcon icon={stat.icon} />
                </div>
                <div className="social-hero-stat-content">
                  <div className="social-hero-stat-value">{stat.value}</div>
                  <div className="social-hero-stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
            {members.length > 0 && (
              <button
                className="social-hero-btn secondary"
                onClick={() => setShowMembersModal(true)}
              >
                <FontAwesomeIcon icon={faUserFriends} />
                {t('clubs.SocialHero.members.ourMembers')} ({members.length})
              </button>
            )}
          </div>
        )}
      </div>

      <div className="social-hero-scroll-indicator">
        <button onClick={handleScrollToContent}>
          <FontAwesomeIcon icon={faChevronDown} />
          <span>{t('clubs.SocialHero.scroll.learnMore')}</span>
        </button>
      </div>

      {isVideoModalOpen && firstVideo && (
        <div className="social-hero-video-modal" onClick={closeVideoModal}>
          <div className="social-hero-video-container" onClick={(e) => e.stopPropagation()}>
            <button className="social-hero-video-close" onClick={closeVideoModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <div className="social-hero-video-player">
              <video
                controls
                autoPlay
                width="100%"
                height="400"
                poster={firstVideo.thumbnail}
              >
                <source src={firstVideo.src} type="video/mp4" />
                {t('clubs.SocialHero.video.notSupported')}
              </video>
            </div>

            <div className="social-hero-video-info-section">
              <h3>{firstVideo.caption || t('clubs.SocialHero.video.defaultTitle')}</h3>
              {firstVideo.alt && <p>{firstVideo.alt}</p>}
              <div className="social-hero-video-details">
                {firstVideo.duration && (
                  <span className="social-hero-video-duration">
                    <FontAwesomeIcon icon={faClock} />
                    {t('clubs.SocialHero.video.duration')}: {firstVideo.duration}
                  </span>
                )}
                {firstVideo.type && (
                  <span className="social-hero-video-type">
                    <FontAwesomeIcon icon={faTag} />
                    {t('clubs.SocialHero.video.type')}: {firstVideo.type}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isEmailModalOpen && (
        <div className="social-hero-email-modal">
          <div className="social-hero-email-modal-overlay" onClick={closeEmailModal}></div>
          <div className="social-hero-email-modal-container">
            <button className="social-hero-email-modal-close" onClick={closeEmailModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <div className="social-hero-email-header">
              <FontAwesomeIcon icon={faEnvelope} />
              <h3>{t('clubs.SocialHero.email.modal.title')}</h3>
              <p>{t('clubs.SocialHero.email.modal.subtitle')}</p>
            </div>

            {formStatus === 'sent' ? (
              <div className="social-hero-form-success">
                <FontAwesomeIcon icon={faCheck} />
                <h4>{t('clubs.SocialHero.form.success.title')}</h4>
                <p>{t('clubs.SocialHero.form.success.message')}</p>
              </div>
            ) : formStatus === 'error' ? (
              <div className="social-hero-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>{t('clubs.SocialHero.form.error.title')}</h4>
                <p>{t('clubs.SocialHero.form.error.message')}</p>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="social-hero-email-form">
                <div className="social-hero-form-row">
                  <div className="social-hero-form-group">
                    <label htmlFor="name">
                      <FontAwesomeIcon icon={faUser} />
                      {t('clubs.SocialHero.form.name')} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={emailForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      required
                      placeholder={t('clubs.SocialHero.form.namePlaceholder')}
                    />
                  </div>

                  <div className="social-hero-form-group">
                    <label htmlFor="email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.SocialHero.form.email')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={emailForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      required
                      placeholder={t('clubs.SocialHero.form.emailPlaceholder')}
                    />
                  </div>
                </div>

                <div className="social-hero-form-group">
                  <label htmlFor="phone">
                    <FontAwesomeIcon icon={faPhone} />
                    {t('clubs.SocialHero.form.phone')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={emailForm.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    placeholder={t('clubs.SocialHero.form.phonePlaceholder')}
                  />
                </div>

                <div className="social-hero-form-group">
                  <label htmlFor="message">
                    <FontAwesomeIcon icon={faEnvelope} />
                    {t('clubs.SocialHero.form.message')} *
                  </label>
                  <textarea
                    id="message"
                    value={emailForm.message}
                    onChange={(e) => handleFormChange('message', e.target.value)}
                    required
                    placeholder={t('clubs.SocialHero.form.messagePlaceholder')}
                    rows="4"
                  />
                </div>

                <div className="social-hero-form-actions">
                  <button
                    type="submit"
                    className="social-hero-submit-btn"
                    disabled={formStatus === 'sending'}
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                    {formStatus === 'sending' ? t('clubs.SocialHero.form.sending') : t('clubs.SocialHero.form.submit')}
                  </button>
                  <button
                    type="button"
                    onClick={closeEmailModal}
                    className="social-hero-cancel-btn"
                  >
                    {t('clubs.SocialHero.form.cancel')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {heroImages.length > 1 && (
        <div className="social-hero-slide-indicators">
          {heroImages.map((_, index) => (
            <button
              key={index}
              className={`social-hero-indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      )}

      {showMembersModal && (
        <div className="social-hero-email-modal">
          <div className="social-hero-email-modal-overlay" onClick={closeMembersModal}></div>
          <div className="social-hero-email-modal-container social-hero-members-modal">
            <button 
              className="social-hero-email-modal-close" 
              onClick={closeMembersModal}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="social-hero-email-header">
              <FontAwesomeIcon icon={faUserFriends} />
              <h3>{t('clubs.SocialHero.members.modal.title')}</h3>
              <p>{t('clubs.SocialHero.members.modal.subtitle', { 
                count: members.length, 
                memberWord: getMemberCountLabel(members.length) 
              })}</p>
            </div>

            <div className="social-hero-members-search">
              <div className="social-hero-search-container">
                <div className="social-hero-search-input-wrapper">
                  <FontAwesomeIcon icon={faSearch} className="social-hero-search-icon" />
                  <input
                    type="text"
                    placeholder={t('clubs.SocialHero.members.search.placeholder')}
                    value={memberSearchTerm}
                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                    className="social-hero-search-input"
                  />
                  {memberSearchTerm && (
                    <button 
                      onClick={clearSearch}
                      className="social-hero-search-clear"
                      title={t('clubs.SocialHero.members.search.clear')}
                    >
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                  )}
                </div>
                
                {memberSearchTerm && (
                  <div className="social-hero-search-results">
                    {filteredMembers.length === 0 ? (
                      <span className="social-hero-no-results">
                        {t('clubs.SocialHero.members.search.noResults', { term: memberSearchTerm })}
                      </span>
                    ) : (
                      <span className="social-hero-results-count">
                        {filteredMembers.length === 1 
                          ? t('clubs.SocialHero.members.search.foundOne')
                          : t('clubs.SocialHero.members.search.foundMany', { count: filteredMembers.length })
                        }
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="social-hero-members-container">
              {filteredMembers.length === 0 && !memberSearchTerm ? (
                <div className="social-hero-no-members">
                  <FontAwesomeIcon icon={faUsers} />
                  <h4>{t('clubs.SocialHero.members.noMembers.title')}</h4>
                  <p>{t('clubs.SocialHero.members.noMembers.message')}</p>
                </div>
              ) : filteredMembers.length === 0 && memberSearchTerm ? (
                <div className="social-hero-no-members">
                  <FontAwesomeIcon icon={faSearch} />
                  <h4>{t('clubs.SocialHero.members.search.noResultsTitle')}</h4>
                  <p>{t('clubs.SocialHero.members.search.noResultsMessage')}</p>
                  <button onClick={clearSearch} className="social-hero-clear-search-btn">
                    <FontAwesomeIcon icon={faTimesCircle} />
                    {t('clubs.SocialHero.members.search.clearSearch')}
                  </button>
                </div>
              ) : (
                <div className="social-hero-members-grid">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="social-hero-member-card">
                      <div className="social-hero-member-photo">
                        {member.photo ? (
                          <img 
                            src={member.photo.src} 
                            alt={member.photo.alt}
                            className="social-hero-member-image"
                          />
                        ) : (
                          <div className="social-hero-member-placeholder">
                            <FontAwesomeIcon icon={faUser} />
                          </div>
                        )}
                        {member.role && member.role !== 'член' && member.role !== 'member' && member.role !== 'Mitglied' && (
                          <div className="social-hero-member-role">
                            <FontAwesomeIcon icon={faAward} />
                            <span>{member.role}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="social-hero-member-info">
                        <div className="social-hero-member-name">
                          <h4>
                            {memberSearchTerm ? (
                              <span dangerouslySetInnerHTML={{
                                __html: highlightSearchTerm(
                                  `${member.firstName} ${member.lastName}`,
                                  memberSearchTerm
                                )
                              }} />
                            ) : (
                              `${member.firstName} ${member.lastName}`
                            )}
                          </h4>
                          <button
                            className={`social-hero-copy-icon ${copiedItems[`${member.id}-name`] ? 'copied' : ''}`}
                            onClick={() => copyMemberData(`${member.firstName} ${member.lastName}`, 'name', member.id)}
                            title={t('clubs.SocialHero.members.copyName')}
                          >
                            <FontAwesomeIcon icon={copiedItems[`${member.id}-name`] ? faCheckCircle : faCopy} />
                          </button>
                        </div>
                        
                        <div className="social-hero-member-details">
                          {member.phone && (
                            <div className="social-hero-member-detail">
                              <FontAwesomeIcon icon={faPhone} />
                              <span>
                                {memberSearchTerm ? (
                                  <span dangerouslySetInnerHTML={{
                                    __html: highlightSearchTerm(member.phone, memberSearchTerm)
                                  }} />
                                ) : (
                                  member.phone
                                )}
                              </span>
                              <button
                                className={`social-hero-copy-icon ${copiedItems[`${member.id}-phone`] ? 'copied' : ''}`}
                                onClick={() => copyMemberData(member.phone, 'phone', member.id)}
                                title={t('clubs.SocialHero.members.copyPhone')}
                              >
                                <FontAwesomeIcon icon={copiedItems[`${member.id}-phone`] ? faCheckCircle : faCopy} />
                              </button>
                            </div>
                          )}
                          
                          {member.email && (
                            <div className="social-hero-member-detail">
                              <FontAwesomeIcon icon={faEnvelope} />
                              <span>
                                {memberSearchTerm ? (
                                  <span dangerouslySetInnerHTML={{
                                    __html: highlightSearchTerm(member.email, memberSearchTerm)
                                  }} />
                                ) : (
                                  member.email
                                )}
                              </span>
                              <button
                                className={`social-hero-copy-icon ${copiedItems[`${member.id}-email`] ? 'copied' : ''}`}
                                onClick={() => copyMemberData(member.email, 'email', member.id)}
                                title={t('clubs.SocialHero.members.copyEmail')}
                              >
                                <FontAwesomeIcon icon={copiedItems[`${member.id}-email`] ? faCheckCircle : faCopy} />
                              </button>
                            </div>
                          )}
                          
                          {member.address && (
                            <div className="social-hero-member-detail">
                              <FontAwesomeIcon icon={faMapMarkerAlt} />
                              <span>{member.address}</span>
                              <button
                                className={`social-hero-copy-icon ${copiedItems[`${member.id}-address`] ? 'copied' : ''}`}
                                onClick={() => copyMemberData(member.address, 'address', member.id)}
                                title={t('clubs.SocialHero.members.copyAddress')}
                              >
                                <FontAwesomeIcon icon={copiedItems[`${member.id}-address`] ? faCheckCircle : faCopy} />
                              </button>
                            </div>
                          )}
                          
                          {member.joinDate && (
                            <div className="social-hero-member-detail">
                              <FontAwesomeIcon icon={faCalendarAlt} />
                              <span>{t('clubs.SocialHero.members.memberSince')} {formatJoinDate(member.joinDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SocialHero;