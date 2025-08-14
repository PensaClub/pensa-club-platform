import { useState, useEffect } from 'react';
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
      console.error('Грешка при копиране:', error);
      alert('Грешка при копиране. Моля опитайте отново.');
    }
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
    alert('Присъединяване към клуба!');
  };

  const handleEventsClick = () => {
    const element = document.getElementById('club-events');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTourClick = () => {
    alert('Виртуална обиколка!');
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
              <span>Културен клуб</span>
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
                Присъедини се
              </button>
              
              <button className="cultural-hero-btn-secondary" onClick={handleEventsClick}>
                <FontAwesomeIcon icon={faCalendarAlt} />
                Събития
              </button>

              <button className="cultural-hero-btn-outline" onClick={handleTourClick}>
                <FontAwesomeIcon icon={faExpand} />
                Обиколка
              </button>

              {members.length > 0 && (
                <button className="cultural-hero-btn-secondary" onClick={() => setShowMembersModal(true)}>
                  <FontAwesomeIcon icon={faUserFriends} />
                  Членове ({members.length})
                </button>
              )}
            </div>
{/* 
            <div className="cultural-hero-quick-navigation">
              <button onClick={() => handleQuickLink('club-about')} className="cultural-hero-nav-link">
                За клуба
              </button>
              <button onClick={() => handleQuickLink('club-activities')} className="cultural-hero-nav-link">
                Дейности
              </button>
              <button onClick={() => handleQuickLink('club-events')} className="cultural-hero-nav-link">
                Събития
              </button>
              <button onClick={() => handleQuickLink('club-management')} className="cultural-hero-nav-link">
                Ръководство
              </button>
            </div> */}
          </div>

          {/* Right Side - Stats */}
          <div className="cultural-hero-stats-panel">
            <h3>Статистика</h3>
            
            <div className="cultural-hero-stat-card">
              <div className="cultural-hero-stat-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className="cultural-hero-stat-info">
                <div className="cultural-hero-stat-number">{club.membership?.totalMembers || '67'}</div>
                <div className="cultural-hero-stat-label">Активни членове</div>
              </div>
            </div>
            
            <div className="cultural-hero-stat-card">
              <div className="cultural-hero-stat-icon">
                <FontAwesomeIcon icon={faMusic} />
              </div>
              <div className="cultural-hero-stat-info">
                <div className="cultural-hero-stat-number">{club.activities?.regular?.length || '4'}</div>
                <div className="cultural-hero-stat-label">Редовни програми</div>
              </div>
            </div>
            
            <div className="cultural-hero-stat-card">
              <div className="cultural-hero-stat-icon">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <div className="cultural-hero-stat-info">
                <div className="cultural-hero-stat-number">{club.activities?.events?.length || '2'}</div>
                <div className="cultural-hero-stat-label">Предстоящи събития</div>
              </div>
            </div>

            <div className="cultural-hero-established-info">
              <div className="cultural-hero-established-year">
                Основан {club.foundedYear || '2010'}
              </div>
              <div className="cultural-hero-years-active">
                {new Date().getFullYear() - (club.foundedYear || 2010)} години опит
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
              <h3>Членове на клуба</h3>
              <p>Нашата творческа общност от {members.length} {members.length === 1 ? 'член' : 'членове'}</p>
            </div>

            {/* Search Section */}
            <div className="cultural-hero-members-search">
              <div className="cultural-hero-search-container">
                <div className="cultural-hero-search-input-wrapper">
                  <FontAwesomeIcon icon={faSearch} className="cultural-hero-search-icon" />
                  <input
                    type="text"
                    placeholder="Търсене по име, телефон или имейл..."
                    value={memberSearchTerm}
                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                    className="cultural-hero-search-input"
                  />
                  {memberSearchTerm && (
                    <button 
                      onClick={clearSearch}
                      className="cultural-hero-search-clear"
                      title="Изчисти търсенето"
                    >
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                  )}
                </div>
                
                {memberSearchTerm && (
                  <div className="cultural-hero-search-results">
                    {filteredMembers.length === 0 ? (
                      <span className="cultural-hero-no-results">
                        Няма намерени резултати за "{memberSearchTerm}"
                      </span>
                    ) : (
                      <span className="cultural-hero-results-count">
                        {filteredMembers.length === 1 
                          ? `Намерен 1 член` 
                          : `Намерени ${filteredMembers.length} членове`
                        }
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
                  <h4>Няма регистрирани членове</h4>
                  <p>Все още няма добавени членове в системата.</p>
                </div>
              ) : filteredMembers.length === 0 && memberSearchTerm ? (
                <div className="cultural-hero-no-members">
                  <FontAwesomeIcon icon={faSearch} />
                  <h4>Няма намерени резултати</h4>
                  <p>Опитайте с различни ключови думи или изчистете търсенето.</p>
                  <button onClick={clearSearch} className="cultural-hero-clear-search-btn">
                    <FontAwesomeIcon icon={faTimesCircle} />
                    Изчисти търсенето
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
                        {member.role && member.role !== 'член' && (
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
                            title="Копирай името"
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
                                title="Копирай телефона"
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
                                title="Копирай имейла"
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
                                title="Копирай адреса"
                              >
                                <FontAwesomeIcon icon={copiedItems[`${member.id}-address`] ? faCheckCircle : faCopy} />
                              </button>
                            </div>
                          )}
                          
                          {member.joinDate && (
                            <div className="cultural-hero-member-detail">
                              <FontAwesomeIcon icon={faCalendarAlt} />
                              <span>Член от {new Date(member.joinDate).toLocaleDateString('bg-BG')}</span>
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