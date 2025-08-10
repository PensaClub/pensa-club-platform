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
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import './culturalHero.css';

export const CulturalHero = ({ club }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

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
    <section id="club-hero" className="new-cultural-hero">
      
      {/* Background with Images */}
      <div className="hero-background">
        {displayImages.map((image, index) => (
          <div
            key={index}
            className={`bg-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className="hero-gradient-overlay"></div>
      </div>

      {/* Video Background */}
      {introVideo && (
        <div className={`video-background ${isVideoPlaying ? 'playing' : ''}`}>
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
          <button className="slide-nav prev" onClick={handlePrevSlide}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button className="slide-nav next" onClick={handleNextSlide}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </>
      )}

      {/* Media Controls */}
      {introVideo && (
        <div className="media-controls">
          <button className="media-btn" onClick={handleToggleVideo}>
            <FontAwesomeIcon icon={isVideoPlaying ? faPause : faPlay} />
          </button>
          <button className="media-btn" onClick={handleToggleMute}>
            <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="hero-main-content">
        <div className="content-container">
          
          {/* Left Side - Main Info */}
          <div className="main-info">
            <div className="club-badge">
              <FontAwesomeIcon icon={faTheaterMasks} />
              <span>Културен клуб</span>
            </div>

            <h1 className="club-title">{club.name}</h1>
            
            <p className="club-description">{club.shortDescription}</p>

            <div className="club-location-info">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>{club.location.address}, {club.location.city}</span>
            </div>

            <div className="action-buttons">
              <button className="btn-primary" onClick={handleJoinClick}>
                <FontAwesomeIcon icon={faUsers} />
                Присъедини се
              </button>
              
              <button className="btn-secondary" onClick={handleEventsClick}>
                <FontAwesomeIcon icon={faCalendarAlt} />
                Събития
              </button>

              <button className="btn-outline" onClick={handleTourClick}>
                <FontAwesomeIcon icon={faExpand} />
                Обиколка
              </button>
            </div>

            <div className="quick-navigation">
              <button onClick={() => handleQuickLink('club-about')} className="nav-link">
                За клуба
              </button>
              <button onClick={() => handleQuickLink('club-activities')} className="nav-link">
                Дейности
              </button>
              <button onClick={() => handleQuickLink('club-events')} className="nav-link">
                Събития
              </button>
              <button onClick={() => handleQuickLink('club-management')} className="nav-link">
                Ръководство
              </button>
            </div>
          </div>

          {/* Right Side - Stats */}
          <div className="stats-panel">
            <h3>Статистика</h3>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className="stat-info">
                <div className="stat-number">{club.membership?.totalMembers || '67'}</div>
                <div className="stat-label">Активни членове</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faMusic} />
              </div>
              <div className="stat-info">
                <div className="stat-number">{club.activities?.regular?.length || '4'}</div>
                <div className="stat-label">Редовни програми</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <div className="stat-info">
                <div className="stat-number">{club.activities?.events?.length || '2'}</div>
                <div className="stat-label">Предстоящи събития</div>
              </div>
            </div>

            <div className="established-info">
              <div className="established-year">
                Основан {club.foundedYear || '2010'}
              </div>
              <div className="years-active">
                {new Date().getFullYear() - (club.foundedYear || 2010)} години опит
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {displayImages.length > 1 && (
        <div className="slide-indicators">
          {displayImages.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => handleGoToSlide(index)}
            />
          ))}
        </div>
      )}

      {/* Decorative Pattern */}
      <div className="decorative-pattern">
        <div className="pattern-element note-1">♪</div>
        <div className="pattern-element note-2">♫</div>
        <div className="pattern-element mask-1">🎭</div>
        <div className="pattern-element mask-2">🎨</div>
      </div>
    </section>
  );
};

export default CulturalHero;