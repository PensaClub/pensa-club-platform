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
  faMusic,
  faTheaterMasks,
  faDrum,
  faHeart,
  faAward,
  faCrown,
  faGem,
  faTree,
  faLeaf,
  faStar,
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
  faSearch,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import './traditionalHero.css';

export const TraditionalHero = ({ club }) => {
  const { t, i18n } = useTranslation('clubs');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [copiedItems, setCopiedItems] = useState({});
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [emailForm, setEmailForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);

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
        label: t('clubs.TraditionalHero.stats.members'),
        value: `${club.stats.totalMembers}+`,
        color: '#dc2626'
      });
    }
    if (club.foundedYear) {
      stats.push({
        icon: faCalendarAlt,
        label: t('clubs.TraditionalHero.stats.founded'),
        value: club.foundedYear,
        color: '#d97706'
      });
    }
    if (club.stats?.performances) {
      stats.push({
        icon: faTheaterMasks,
        label: t('clubs.TraditionalHero.stats.performances'),
        value: `${club.stats.performances}+`,
        color: '#059669'
      });
    }
    if (club.stats?.yearsActive) {
      stats.push({
        icon: faAward,
        label: t('clubs.TraditionalHero.stats.yearsExperience'),
        value: club.stats.yearsActive,
        color: '#7c3aed'
      });
    }
    return stats;
  };

  const availableStats = getAvailableStats();
  const firstVideo = club.media?.videos && club.media.videos.length > 0 ? club.media.videos[0] : null;
  const hasContacts = club.contacts?.phone || club.contacts?.mobile || club.contacts?.email;
  const members = club.members || [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'de' ? 'de-DE' : 'en-US';
    return date.toLocaleDateString(locale);
  };

  const filteredMembers = members.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const searchLower = memberSearchTerm.toLowerCase();
    return fullName.includes(searchLower) || 
           member.phone?.includes(searchLower) ||
           member.email?.toLowerCase().includes(searchLower);
  });

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  const handleScrollToContent = () => {
    const aboutSection = document.getElementById('traditional-about');
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
      const subject = encodeURIComponent(t('clubs.TraditionalHero.email.subject', { clubName: club.name }));
      const body = encodeURIComponent(t('clubs.TraditionalHero.email.body', {
        clubName: club.name,
        name: emailForm.name,
        email: emailForm.email,
        phone: emailForm.phone || t('clubs.TraditionalHero.email.noPhone'),
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
        const locationSection = document.getElementById('traditional-location');
        if (locationSection) {
          locationSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          alert(t('clubs.TraditionalHero.messages.locationInfo'));
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
      console.error('Copy error:', error);
    }
  };

  return (
    <section className="traditional-hero-main-section">
      <div className="traditional-hero-background">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`traditional-hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className="traditional-hero-overlay" />
      </div>

      <div className="traditional-hero-container">
        <div className="traditional-hero-content">
          <div className="traditional-hero-badge">
            <FontAwesomeIcon icon={faCrown} />
            <span>{t('clubs.TraditionalHero.badge')}</span>
          </div>

          <h1 className="traditional-hero-title">
            {club.name}
          </h1>

          {club.shortDescription && (
            <p className="traditional-hero-subtitle">
              {club.shortDescription}
            </p>
          )}

          {club.fullDescription && (
            <p className="traditional-hero-description">
              {club.fullDescription}
            </p>
          )}

          {(firstVideo || club.location || club.contacts) && (
            <div className="traditional-hero-actions">
              {firstVideo && (
                <button
                  className="traditional-hero-btn primary"
                  onClick={handleVideoPlay}
                >
                  <FontAwesomeIcon icon={faPlay} />
                  {t('clubs.TraditionalHero.actions.watchVideo')}
                </button>
              )}
              <button
                className="traditional-hero-btn secondary"
                onClick={() => handleContactAction('visit')}
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                {t('clubs.TraditionalHero.actions.visitUs')}
              </button>
              {members.length > 0 && (
                <button
                  className="traditional-hero-btn secondary"
                  onClick={() => setShowMembersModal(true)}
                >
                  <FontAwesomeIcon icon={faUserFriends} />
                  {t('clubs.TraditionalHero.actions.ourMembers', { count: members.length })}
                </button>
              )}
            </div>
          )}

          {hasContacts && (
            <div className="traditional-hero-quick-contact">
              {(club.contacts?.phone || club.contacts?.mobile) && (
                <button
                  className="traditional-hero-contact-btn"
                  onClick={() => handleContactAction('phone')}
                >
                  <FontAwesomeIcon icon={faPhone} />
                  <span>{club.contacts.phone || club.contacts.mobile}</span>
                </button>
              )}
              {club.contacts?.email && (
                <button
                  className="traditional-hero-contact-btn"
                  onClick={() => handleContactAction('email')}
                >
                  <FontAwesomeIcon icon={faEnvelope} />
                  <span>{t('clubs.TraditionalHero.actions.writeToUs')}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {availableStats.length > 0 && (
          <div className="traditional-hero-stats">
            {availableStats.map((stat, index) => (
              <div key={index} className="traditional-hero-stat-card">
                <div
                  className="traditional-hero-stat-icon"
                  style={{ backgroundColor: stat.color }}
                >
                  <FontAwesomeIcon icon={stat.icon} />
                </div>
                <div className="traditional-hero-stat-content">
                  <div className="traditional-hero-stat-value">{stat.value}</div>
                  <div className="traditional-hero-stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="traditional-hero-scroll-indicator">
        <button onClick={handleScrollToContent}>
          <FontAwesomeIcon icon={faChevronDown} />
          <span>{t('clubs.TraditionalHero.scrollIndicator')}</span>
        </button>
      </div>

      {isVideoModalOpen && firstVideo && (
        <div className="traditional-hero-video-modal" onClick={closeVideoModal}>
          <div className="traditional-hero-video-container" onClick={(e) => e.stopPropagation()}>
            <button className="traditional-hero-video-close" onClick={closeVideoModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <div className="traditional-hero-video-player">
              <video
                controls
                autoPlay
                width="100%"
                height="400"
                poster={firstVideo.thumbnail}
              >
                <source src={firstVideo.src} type="video/mp4" />
                {t('clubs.TraditionalHero.video.notSupported')}
              </video>
            </div>

            <div className="traditional-hero-video-info-section">
              <h3>{firstVideo.caption || t('clubs.TraditionalHero.video.defaultTitle')}</h3>
              {firstVideo.alt && <p>{firstVideo.alt}</p>}
              <div className="traditional-hero-video-details">
                {firstVideo.duration && (
                  <span className="traditional-hero-video-duration">
                    <FontAwesomeIcon icon={faClock} />
                    {t('clubs.TraditionalHero.video.duration')}: {firstVideo.duration}
                  </span>
                )}
                {firstVideo.type && (
                  <span className="traditional-hero-video-type">
                    <FontAwesomeIcon icon={faTag} />
                    {t('clubs.TraditionalHero.video.type')}: {firstVideo.type}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isEmailModalOpen && (
        <div className="traditional-hero-email-modal">
          <div className="traditional-hero-email-modal-overlay" onClick={closeEmailModal}></div>
          <div className="traditional-hero-email-modal-container">
            <button className="traditional-hero-email-modal-close" onClick={closeEmailModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <div className="traditional-hero-email-header">
              <FontAwesomeIcon icon={faEnvelope} />
              <h3>{t('clubs.TraditionalHero.emailModal.title')}</h3>
              <p>{t('clubs.TraditionalHero.emailModal.subtitle')}</p>
            </div>

            {formStatus === 'sent' ? (
              <div className="traditional-hero-form-success">
                <FontAwesomeIcon icon={faCheck} />
                <h4>{t('clubs.TraditionalHero.emailModal.success.title')}</h4>
                <p>{t('clubs.TraditionalHero.emailModal.success.message')}</p>
              </div>
            ) : formStatus === 'error' ? (
              <div className="traditional-hero-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>{t('clubs.TraditionalHero.emailModal.error.title')}</h4>
                <p>{t('clubs.TraditionalHero.emailModal.error.message')}</p>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="traditional-hero-email-form">
                <div className="traditional-hero-form-row">
                  <div className="traditional-hero-form-group">
                    <label htmlFor="name">
                      <FontAwesomeIcon icon={faUser} />
                      {t('clubs.TraditionalHero.emailModal.form.name')} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={emailForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      required
                      placeholder={t('clubs.TraditionalHero.emailModal.form.namePlaceholder')}
                    />
                  </div>

                  <div className="traditional-hero-form-group">
                    <label htmlFor="email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.TraditionalHero.emailModal.form.email')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={emailForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      required
                      placeholder={t('clubs.TraditionalHero.emailModal.form.emailPlaceholder')}
                    />
                  </div>
                </div>

                <div className="traditional-hero-form-group">
                  <label htmlFor="phone">
                    <FontAwesomeIcon icon={faPhone} />
                    {t('clubs.TraditionalHero.emailModal.form.phone')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={emailForm.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    placeholder={t('clubs.TraditionalHero.emailModal.form.phonePlaceholder')}
                  />
                </div>

                <div className="traditional-hero-form-group">
                  <label htmlFor="message">
                    <FontAwesomeIcon icon={faEnvelope} />
                    {t('clubs.TraditionalHero.emailModal.form.message')} *
                  </label>
                  <textarea
                    id="message"
                    value={emailForm.message}
                    onChange={(e) => handleFormChange('message', e.target.value)}
                    required
                    placeholder={t('clubs.TraditionalHero.emailModal.form.messagePlaceholder')}
                    rows="4"
                  />
                </div>

                <div className="traditional-hero-form-actions">
                  <button
                    type="submit"
                    className="traditional-hero-submit-btn"
                    disabled={formStatus === 'sending'}
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                    {formStatus === 'sending' ? 
                      t('clubs.TraditionalHero.emailModal.form.sending') : 
                      t('clubs.TraditionalHero.emailModal.form.submit')}
                  </button>
                  <button
                    type="button"
                    onClick={closeEmailModal}
                    className="traditional-hero-cancel-btn"
                  >
                    {t('clubs.TraditionalHero.emailModal.form.cancel')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {heroImages.length > 1 && (
        <div className="traditional-hero-slide-indicators">
          {heroImages.map((_, index) => (
            <button
              key={index}
              className={`traditional-hero-indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      )}

      {showMembersModal && (
        <div className="traditional-hero-email-modal">
          <div className="traditional-hero-email-modal-overlay" onClick={closeMembersModal}></div>
          <div className="traditional-hero-email-modal-container traditional-hero-members-modal">
            <button 
              className="traditional-hero-email-modal-close" 
              onClick={closeMembersModal}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="traditional-hero-email-header">
              <FontAwesomeIcon icon={faCrown} />
              <h3>{t('clubs.TraditionalHero.membersModal.title')}</h3>
              <p>{t('clubs.TraditionalHero.membersModal.subtitle', { 
                count: members.length,
                memberText: members.length === 1 ? 
                  t('clubs.TraditionalHero.membersModal.memberSingle') : 
                  t('clubs.TraditionalHero.membersModal.memberPlural')
              })}</p>
            </div>

            <div className="traditional-hero-members-search">
              <div className="traditional-hero-search-container">
                <div className="traditional-hero-search-input-wrapper">
                  <FontAwesomeIcon icon={faSearch} className="traditional-hero-search-icon" />
                  <input
                    type="text"
                    placeholder={t('clubs.TraditionalHero.membersModal.searchPlaceholder')}
                    value={memberSearchTerm}
                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                    className="traditional-hero-search-input"
                  />
                  {memberSearchTerm && (
                    <button 
                      onClick={clearSearch}
                      className="traditional-hero-search-clear"
                      title={t('clubs.TraditionalHero.membersModal.clearSearch')}
                    >
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                  )}
                </div>
                
                {memberSearchTerm && (
                  <div className="traditional-hero-search-results">
                    {filteredMembers.length === 0 ? (
                      <span className="traditional-hero-no-results">
                        {t('clubs.TraditionalHero.membersModal.noResultsFor', { term: memberSearchTerm })}
                      </span>
                    ) : (
                      <span className="traditional-hero-results-count">
                        {filteredMembers.length === 1 
                          ? t('clubs.TraditionalHero.membersModal.foundOne')
                          : t('clubs.TraditionalHero.membersModal.foundMany', { count: filteredMembers.length })
                        }
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="traditional-hero-members-container">
              {filteredMembers.length === 0 && !memberSearchTerm ? (
                <div className="traditional-hero-no-members">
                  <FontAwesomeIcon icon={faUsers} />
                  <h4>{t('clubs.TraditionalHero.membersModal.noMembers.title')}</h4>
                  <p>{t('clubs.TraditionalHero.membersModal.noMembers.message')}</p>
                </div>
              ) : filteredMembers.length === 0 && memberSearchTerm ? (
                <div className="traditional-hero-no-members">
                  <FontAwesomeIcon icon={faSearch} />
                  <h4>{t('clubs.TraditionalHero.membersModal.noResults.title')}</h4>
                  <p>{t('clubs.TraditionalHero.membersModal.noResults.message')}</p>
                  <button onClick={clearSearch} className="traditional-hero-clear-search-btn">
                    <FontAwesomeIcon icon={faTimesCircle} />
                    {t('clubs.TraditionalHero.membersModal.clearSearch')}
                  </button>
                </div>
              ) : (
                <div className="traditional-hero-members-grid">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="traditional-hero-member-card">
                      <div className="traditional-hero-member-photo">
                        {member.photo ? (
                          <img 
                            src={member.photo.src} 
                            alt={member.photo.alt}
                            className="traditional-hero-member-image"
                          />
                        ) : (
                          <div className="traditional-hero-member-placeholder">
                            <FontAwesomeIcon icon={faUser} />
                          </div>
                        )}
                        {member.role && member.role !== t('clubs.TraditionalHero.membersModal.defaultRole') && (
                          <div className="traditional-hero-member-role">
                            <FontAwesomeIcon icon={faAward} />
                            <span>{member.role}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="traditional-hero-member-info">
                        <div className="traditional-hero-member-name">
                          <h4>
                            {memberSearchTerm ? (
                              <span dangerouslySetInnerHTML={{
                                __html: `${member.firstName} ${member.lastName}`.replace(
                                  new RegExp(`(${memberSearchTerm})`, 'gi'),
                                  '<mark>$1</mark>'
                                )
                              }} />
                            ) : (
                              `${member.firstName} ${member.lastName}`
                            )}
                          </h4>
                          <button
                            className={`traditional-hero-copy-icon ${copiedItems[`${member.id}-name`] ? 'copied' : ''}`}
                            onClick={() => copyMemberData(`${member.firstName} ${member.lastName}`, 'name', member.id)}
                            title={t('clubs.TraditionalHero.membersModal.copyName')}
                          >
                            <FontAwesomeIcon icon={copiedItems[`${member.id}-name`] ? faCheckCircle : faCopy} />
                          </button>
                        </div>
                        
                        <div className="traditional-hero-member-details">
                          {member.phone && (
                            <div className="traditional-hero-member-detail">
                              <FontAwesomeIcon icon={faPhone} />
                              <span>
                                {memberSearchTerm ? (
                                  <span dangerouslySetInnerHTML={{
                                    __html: member.phone.replace(
                                      new RegExp(`(${memberSearchTerm})`, 'gi'),
                                      '<mark>$1</mark>'
                                    )
                                  }} />
                                ) : (
                                  member.phone
                                )}
                              </span>
                              <button
                                className={`traditional-hero-copy-icon ${copiedItems[`${member.id}-phone`] ? 'copied' : ''}`}
                                onClick={() => copyMemberData(member.phone, 'phone', member.id)}
                                title={t('clubs.TraditionalHero.membersModal.copyPhone')}
                              >
                                <FontAwesomeIcon icon={copiedItems[`${member.id}-phone`] ? faCheckCircle : faCopy} />
                              </button>
                            </div>
                          )}
                          
                          {member.email && (
                            <div className="traditional-hero-member-detail">
                              <FontAwesomeIcon icon={faEnvelope} />
                              <span>
                                {memberSearchTerm ? (
                                  <span dangerouslySetInnerHTML={{
                                    __html: member.email.replace(
                                      new RegExp(`(${memberSearchTerm})`, 'gi'),
                                      '<mark>$1</mark>'
                                    )
                                  }} />
                                ) : (
                                  member.email
                                )}
                              </span>
                              <button
                                className={`traditional-hero-copy-icon ${copiedItems[`${member.id}-email`] ? 'copied' : ''}`}
                                onClick={() => copyMemberData(member.email, 'email', member.id)}
                                title={t('clubs.TraditionalHero.membersModal.copyEmail')}
                              >
                                <FontAwesomeIcon icon={copiedItems[`${member.id}-email`] ? faCheckCircle : faCopy} />
                              </button>
                            </div>
                          )}
                          
                          {member.address && (
                            <div className="traditional-hero-member-detail">
                              <FontAwesomeIcon icon={faMapMarkerAlt} />
                              <span>{member.address}</span>
                              <button
                                className={`traditional-hero-copy-icon ${copiedItems[`${member.id}-address`] ? 'copied' : ''}`}
                                onClick={() => copyMemberData(member.address, 'address', member.id)}
                                title={t('clubs.TraditionalHero.membersModal.copyAddress')}
                              >
                                <FontAwesomeIcon icon={copiedItems[`${member.id}-address`] ? faCheckCircle : faCopy} />
                              </button>
                            </div>
                          )}
                          
                          {member.joinDate && (
                            <div className="traditional-hero-member-detail">
                              <FontAwesomeIcon icon={faCalendarAlt} />
                              <span>{t('clubs.TraditionalHero.membersModal.memberSince')} {formatDate(member.joinDate)}</span>
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

export default TraditionalHero;