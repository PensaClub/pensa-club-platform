import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTheaterMasks,
  faMusic,
  faUsers,
  faCalendarAlt,
  faMapMarkerAlt,
  faPlay,
  faPause,
  faVolumeUp,
  faVolumeMute,
  faExpand,
  faChevronLeft,
  faChevronRight,
  faUserFriends,
  faIdCard,
  faAddressCard,
  faCopy,
  faCheckCircle,
  faSearch,
  faTimesCircle,
  faTimes,
  faUser,
  faPhone,
  faEnvelope,
  faAward
} from '@fortawesome/free-solid-svg-icons';
import './culturalHero.css';

export const CulturalHero = ({ club }) => {
  const { t, i18n } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [copiedItems, setCopiedItems] = useState({});
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  // Проверяваме дали има необходимите данни
  if (!club?.name) {
    return null;
  }

  const members = club.members || [];

  const heroImages = [
    club.mainImage,
    ...(club.gallery || [])
  ].filter(Boolean);

  // Fallback снимки ако няма реални
  const fallbackImages = [
    'https://picsum.photos/1920/1080?random=1',
    'https://picsum.photos/1920/1080?random=2',
    'https://picsum.photos/1920/1080?random=3'
  ];

  const displayImages = heroImages.length > 0 ? heroImages : fallbackImages;

  // Функция за филтриране на членовете:
  const filteredMembers = members.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const searchLower = memberSearchTerm.toLowerCase();
    return fullName.includes(searchLower) || 
           member.phone?.includes(searchLower) ||
           member.email?.toLowerCase().includes(searchLower);
  });

  // Функции за търсене и копиране:
  const clearSearch = () => {
    setMemberSearchTerm('');
  };

  const closeMembersModal = () => {
    setShowMembersModal(false);
    setMemberSearchTerm('');
  };

  const copyMemberData = async (data, type, memberName) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(data);
      } else {
        // Fallback за стари браузъри
        const textArea = document.createElement('textarea');
        textArea.value = data;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed:', err);
          throw err;
        } finally {
          document.body.removeChild(textArea);
        }
      }
      
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
      console.error(t('clubs.CulturalHero.errors.copyError'), error);
      alert(t('clubs.CulturalHero.errors.copyErrorMessage'));
    }
  };

  // Функция за форматиране на дати
  const formatDate = (dateString) => {
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'en' ? 'en-US' : 
                   'de-DE';
    
    return new Date(dateString).toLocaleDateString(locale);
  };

  // Функция за plural форми на членове
  const getMembersText = (count) => {
    return t('clubs.CulturalHero.membersCount', { 
      count,
      defaultValue_one: `${count} член`,
      defaultValue_other: `${count} членове`
    });
  };

  useEffect(() => {
    if (displayImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayImages.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [displayImages.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % displayImages.length);
  };

  const handleGoToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleToggleVideo = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleJoinClick = () => {
    alert(t('clubs.CulturalHero.actions.joinClub'));
  };

  const handleEventsClick = () => {
    const element = document.getElementById('club-events');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTourClick = () => {
    alert(t('clubs.CulturalHero.actions.virtualTour'));
  };

  const handleQuickLink = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const introVideo = club.media?.videos?.find(video => video.type === 'intro');

  return (
    <section id="cultural-hero" className="cultural-hero-main-section">
      
      {/* Background with Images */}
      <div className="cultural-hero-background">
        {displayImages.map((image, index) => (
          <div
            key={index}
            className={`cultural-hero-bg-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className="cultural-hero-gradient-overlay"></div>
      </div>

      {/* Video Background */}
      {introVideo && (
        <div className={`cultural-hero-video-background ${isVideoPlaying ? 'playing' : ''}`}>
          <video
            autoPlay={isVideoPlaying}
            muted={isMuted}
            loop
            playsInline
          >
            <source src={introVideo.src} type="video/mp4" />
          </video>
        </div>
      )}

      {/* Navigation Controls */}
      {displayImages.length > 1 && (
        <>
          <button className="cultural-hero-slide-nav prev" onClick={handlePrevSlide}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button className="cultural-hero-slide-nav next" onClick={handleNextSlide}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </>
      )}

      {/* Media Controls */}
      {introVideo && (
        <div className="cultural-hero-media-controls">
          <button className="cultural-hero-media-btn" onClick={handleToggleVideo}>
            <FontAwesomeIcon icon={isVideoPlaying ? faPause : faPlay} />
          </button>
          <button className="cultural-hero-media-btn" onClick={handleToggleMute}>
            <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="cultural-hero-main-content">
        <div className="cultural-hero-content-container">
          
          {/* Left Side - Main Info */}
          <div className="cultural-hero-main-info">
            <div className="cultural-hero-club-badge">
              <FontAwesomeIcon icon={faTheaterMasks} />
              <span>{t('clubs.CulturalHero.badge.culturalClub')}</span>
            </div>

            <h1 className="cultural-hero-club-title">{club.name}</h1>
            
            <p className="cultural-hero-club-description">{club.shortDescription}</p>

            {club.location?.address && (
              <div className="cultural-hero-club-location-info">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>{club.location.address}, {club.location.city}</span>
              </div>
            )}

            <div className="cultural-hero-action-buttons">
              <button className="cultural-hero-btn-primary" onClick={handleJoinClick}>
                <FontAwesomeIcon icon={faUsers} />
                {t('clubs.CulturalHero.buttons.join')}
              </button>
              
              <button className="cultural-hero-btn-secondary" onClick={handleEventsClick}>
                <FontAwesomeIcon icon={faCalendarAlt} />
                {t('clubs.CulturalHero.buttons.events')}
              </button>

              <button className="cultural-hero-btn-outline" onClick={handleTourClick}>
                <FontAwesomeIcon icon={faExpand} />
                {t('clubs.CulturalHero.buttons.tour')}
              </button>

              {members.length > 0 && (
                <button className="cultural-hero-btn-secondary" onClick={() => setShowMembersModal(true)}>
                  <FontAwesomeIcon icon={faUserFriends} />
                  {t('clubs.CulturalHero.buttons.members')} ({members.length})
                </button>
              )}
            </div>
          </div>

          {/* Right Side - Stats */}
          <div className="cultural-hero-stats-panel">
            <h3>{t('clubs.CulturalHero.stats.title')}</h3>
            
            <div className="cultural-hero-stat-card">
              <div className="cultural-hero-stat-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className="cultural-hero-stat-info">
                <div className="cultural-hero-stat-number">{club.membership?.totalMembers || '67'}</div>
                <div className="cultural-hero-stat-label">{t('clubs.CulturalHero.stats.activeMembers')}</div>
              </div>
            </div>
            
            <div className="cultural-hero-stat-card">
              <div className="cultural-hero-stat-icon">
                <FontAwesomeIcon icon={faMusic} />
              </div>
              <div className="cultural-hero-stat-info">
                <div className="cultural-hero-stat-number">{club.activities?.regular?.length || '4'}</div>
                <div className="cultural-hero-stat-label">{t('clubs.CulturalHero.stats.regularPrograms')}</div>
              </div>
            </div>
            
            <div className="cultural-hero-stat-card">
              <div className="cultural-hero-stat-icon">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <div className="cultural-hero-stat-info">
                <div className="cultural-hero-stat-number">{club.activities?.events?.length || '2'}</div>
                <div className="cultural-hero-stat-label">{t('clubs.CulturalHero.stats.upcomingEvents')}</div>
              </div>
            </div>

            <div className="cultural-hero-established-info">
              <div className="cultural-hero-established-year">
                {t('clubs.CulturalHero.stats.founded')} {club.foundedYear || '2010'}
              </div>
              <div className="cultural-hero-years-active">
                {t('clubs.CulturalHero.stats.yearsExperience', { 
                  years: new Date().getFullYear() - (club.foundedYear || 2010) 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {displayImages.length > 1 && (
        <div className="cultural-hero-slide-indicators">
          {displayImages.map((_, index) => (
            <button
              key={index}
              className={`cultural-hero-indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => handleGoToSlide(index)}
            />
          ))}
        </div>
      )}

      {/* Decorative Pattern */}
      <div className="cultural-hero-decorative-pattern">
        <div className="cultural-hero-pattern-element note-1">♪</div>
        <div className="cultural-hero-pattern-element note-2">♫</div>
        <div className="cultural-hero-pattern-element mask-1">🎭</div>
        <div className="cultural-hero-pattern-element mask-2">🎨</div>
      </div>

      {/* Members Modal */}
      {showMembersModal && (
        <div className="cultural-hero-members-modal">
          <div className="cultural-hero-members-modal-overlay" onClick={closeMembersModal}></div>
          <div className="cultural-hero-members-modal-container">
            <button 
              className="cultural-hero-members-modal-close" 
              onClick={closeMembersModal}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="cultural-hero-members-header">
              <FontAwesomeIcon icon={faTheaterMasks} />
              <h3>{t('clubs.CulturalHero.modal.title')}</h3>
              <p>{t('clubs.CulturalHero.modal.subtitle', { 
                count: members.length,
                members: getMembersText(members.length)
              })}</p>
            </div>

            {/* Search Section */}
            <div className="cultural-hero-members-search">
              <div className="cultural-hero-search-container">
                <div className="cultural-hero-search-input-wrapper">
                  <FontAwesomeIcon icon={faSearch} className="cultural-hero-search-icon" />
                  <input
                    type="text"
                    placeholder={t('clubs.CulturalHero.modal.searchPlaceholder')}
                    value={memberSearchTerm}
                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                    className="cultural-hero-search-input"
                  />
                  {memberSearchTerm && (
                    <button 
                      onClick={clearSearch}
                      className="cultural-hero-search-clear"
                      title={t('clubs.CulturalHero.modal.clearSearch')}
                    >
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                  )}
                </div>
                
                {memberSearchTerm && (
                  <div className="cultural-hero-search-results">
                    {filteredMembers.length === 0 ? (
                      <span className="cultural-hero-no-results">
                        {t('clubs.CulturalHero.modal.noResultsFor', { term: memberSearchTerm })}
                      </span>
                    ) : (
                      <span className="cultural-hero-results-count">
                        {t('clubs.CulturalHero.modal.foundMembers', { 
                          count: filteredMembers.length 
                        })}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="cultural-hero-members-container">
              {filteredMembers.length === 0 && !memberSearchTerm ? (
                <div className="cultural-hero-no-members">
                  <FontAwesomeIcon icon={faUsers} />
                  <h4>{t('clubs.CulturalHero.modal.noRegisteredMembers.title')}</h4>
                  <p>{t('clubs.CulturalHero.modal.noRegisteredMembers.subtitle')}</p>
                </div>
              ) : filteredMembers.length === 0 && memberSearchTerm ? (
                <div className="cultural-hero-no-members">
                  <FontAwesomeIcon icon={faSearch} />
                  <h4>{t('clubs.CulturalHero.modal.noSearchResults.title')}</h4>
                  <p>{t('clubs.CulturalHero.modal.noSearchResults.subtitle')}</p>
                  <button onClick={clearSearch} className="cultural-hero-clear-search-btn">
                    <FontAwesomeIcon icon={faTimesCircle} />
                    {t('clubs.CulturalHero.modal.clearSearchButton')}
                  </button>
                </div>
              ) : (
                <div className="cultural-hero-members-grid">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="cultural-hero-member-card">
                      <div className="cultural-hero-member-photo">
                        {member.photo ? (
                          <img 
                            src={member.photo.src} 
                            alt={member.photo.alt}
                            className="cultural-hero-member-image"
                          />
                        ) : (
                          <div className="cultural-hero-member-placeholder">
                            <FontAwesomeIcon icon={faUser} />
                          </div>
                        )}
                        {member.role && member.role !== 'член' && member.role !== 'member' && member.role !== 'mitglied' && (
                          <div className="cultural-hero-member-role">
                            <FontAwesomeIcon icon={faAward} />
                            <span>{member.role}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="cultural-hero-member-info">
                        <div className="cultural-hero-member-name">
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
                            className={`cultural-hero-copy-icon ${copiedItems[`${member.id}-name`] ? 'copied' : ''}`}
                            onClick={() => copyMemberData(`${member.firstName} ${member.lastName}`, 'name', member.id)}
                            title={t('clubs.CulturalHero.modal.copyName')}
                          >
                            <FontAwesomeIcon icon={copiedItems[`${member.id}-name`] ? faCheckCircle : faCopy} />
                          </button>
                        </div>
                        
                        <div className="cultural-hero-member-details">
                          {member.phone && (
                            <div className="cultural-hero-member-detail">
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
                                className={`cultural-hero-copy-icon ${copiedItems[`${member.id}-phone`] ? 'copied' : ''}`}
                                onClick={() => copyMemberData(member.phone, 'phone', member.id)}
                                title={t('clubs.CulturalHero.modal.copyPhone')}
                              >
                                <FontAwesomeIcon icon={copiedItems[`${member.id}-phone`] ? faCheckCircle : faCopy} />
                              </button>
                            </div>
                          )}
                          
                          {member.email && (
                            <div className="cultural-hero-member-detail">
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
                                className={`cultural-hero-copy-icon ${copiedItems[`${member.id}-email`] ? 'copied' : ''}`}
                                onClick={() => copyMemberData(member.email, 'email', member.id)}
                                title={t('clubs.CulturalHero.modal.copyEmail')}
                              >
                                <FontAwesomeIcon icon={copiedItems[`${member.id}-email`] ? faCheckCircle : faCopy} />
                              </button>
                            </div>
                          )}
                          
                          {member.address && (
                            <div className="cultural-hero-member-detail">
                              <FontAwesomeIcon icon={faMapMarkerAlt} />
                              <span>{member.address}</span>
                              <button
                                className={`cultural-hero-copy-icon ${copiedItems[`${member.id}-address`] ? 'copied' : ''}`}
                                onClick={() => copyMemberData(member.address, 'address', member.id)}
                                title={t('clubs.CulturalHero.modal.copyAddress')}
                              >
                                <FontAwesomeIcon icon={copiedItems[`${member.id}-address`] ? faCheckCircle : faCopy} />
                              </button>
                            </div>
                          )}
                          
                          {member.joinDate && (
                            <div className="cultural-hero-member-detail">
                              <FontAwesomeIcon icon={faCalendarAlt} />
                              <span>{t('clubs.CulturalHero.modal.memberSince')} {formatDate(member.joinDate)}</span>
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

export default CulturalHero;