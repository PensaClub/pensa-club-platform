import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faImages,
  faVideo,
  faCalendarAlt,
  faFilter,
  faTimes,
  faPlay,
  faDownload,
  faShare,
  faExpand,
  faHeart,
  faEye,
  faCamera,
  faFilm,
  faUser,
  faClock,
  faMapMarkerAlt,
  faChevronLeft,
  faChevronRight,
  faList,
  faSearch,
  faTag,
  faTh
} from '@fortawesome/free-solid-svg-icons';
import './clubGallery.css';

export const ClubGallery = ({ club }) => {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentMedia, setCurrentMedia] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // ПРОВЕРКА ЗА ДАННИ
  const hasGallery = club?.gallery && club.gallery.length > 0;
  const hasVideos = club?.media?.videos && club.media.videos.length > 0;
  const hasEventMedia = club?.activities?.events && 
    club.activities.events.some(event => 
      (event.images && event.images.length > 0) || 
      (event.videos && event.videos.length > 0)
    );

  // ПРОВЕРКА ЗА PREFERENCES - ако publicGallery е false, не показваме компонента
  if (!club?.preferences?.publicGallery || (!hasGallery && !hasVideos && !hasEventMedia)) {
    return null;
  }

  // Събиране на всички медийни файлове
  const getAllMedia = () => {
    let allMedia = [];

    // Основни снимки от галерията
    if (hasGallery) {
      club.gallery.forEach((image, index) => {
        allMedia.push({
          id: `gallery-${index}`,
          type: 'image',
          src: image,
          thumbnail: image,
          title: t('clubs.ClubGallery.media.imageTitle', { number: index + 1 }),
          category: 'gallery',
          categoryLabel: t('clubs.ClubGallery.categories.gallery'),
          alt: t('clubs.ClubGallery.media.imageAlt', { number: index + 1, clubName: club.name }),
          date: null,
          location: null,
          photographer: null
        });
      });
    }

    // Видеа от media
    if (hasVideos) {
      club.media.videos.forEach((video, index) => {
        allMedia.push({
          id: `video-${index}`,
          type: 'video',
          src: video.src,
          thumbnail: video.thumbnail,
          title: video.caption || video.alt || t('clubs.ClubGallery.media.videoTitle', { number: index + 1 }),
          category: 'videos',
          categoryLabel: t('clubs.ClubGallery.categories.videos'),
          alt: video.alt,
          duration: video.duration,
          videoType: video.type,
          date: null,
          location: null
        });
      });
    }

    // Медия от събития
    if (hasEventMedia) {
      club.activities.events.forEach(event => {
        // Снимки от събития
        if (event.images && event.images.length > 0) {
          event.images.forEach((image, index) => {
            allMedia.push({
              id: `event-image-${event.id}-${index}`,
              type: 'image',
              src: image.src,
              thumbnail: image.src,
              title: image.caption || t('clubs.ClubGallery.media.eventImageTitle', { 
                eventTitle: event.title, 
                number: index + 1 
              }),
              category: 'events',
              categoryLabel: t('clubs.ClubGallery.categories.events'),
              alt: image.alt,
              eventTitle: event.title,
              eventDate: event.date,
              location: event.location,
              isMain: image.isMain
            });
          });
        }

        // Видеа от събития
        if (event.videos && event.videos.length > 0) {
          event.videos.forEach((video, index) => {
            allMedia.push({
              id: `event-video-${event.id}-${index}`,
              type: 'video',
              src: video.src,
              thumbnail: video.thumbnail,
              title: video.caption || t('clubs.ClubGallery.media.eventVideoTitle', { 
                eventTitle: event.title, 
                number: index + 1 
              }),
              category: 'events',
              categoryLabel: t('clubs.ClubGallery.categories.events'),
              alt: video.alt,
              duration: video.duration,
              eventTitle: event.title,
              eventDate: event.date,
              location: event.location
            });
          });
        }
      });
    }

    return allMedia;
  };

  const allMedia = getAllMedia();

  // Филтриране на медията
  const getFilteredMedia = () => {
    let filtered = allMedia;

    // Филтър по категория
    if (filter !== 'all') {
      filtered = filtered.filter(item => {
        if (filter === 'images') return item.type === 'image';
        if (filter === 'videos') return item.type === 'video';
        if (filter === 'events') return item.category === 'events';
        return item.category === filter;
      });
    }

    // Филтър по търсене
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.eventTitle && item.eventTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.alt && item.alt.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  const filteredMedia = getFilteredMedia();

  // Статистики
  const getStats = () => {
    const images = allMedia.filter(item => item.type === 'image').length;
    const videos = allMedia.filter(item => item.type === 'video').length;
    const events = allMedia.filter(item => item.category === 'events').length;
    
    return { images, videos, events, total: allMedia.length };
  };

  const stats = getStats();

  // Отваряне на lightbox
  const openLightbox = (media, index) => {
    if (media.type === 'video') {
      setSelectedVideo(media);
      setShowVideoPlayer(true);
    } else {
      setCurrentMedia(media);
      setCurrentIndex(index);
      setShowLightbox(true);
    }
  };

  // Навигация в lightbox
  const navigateLightbox = (direction) => {
    const imageMedia = filteredMedia.filter(item => item.type === 'image');
    let newIndex = currentIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % imageMedia.length;
    } else {
      newIndex = currentIndex === 0 ? imageMedia.length - 1 : currentIndex - 1;
    }
    
    setCurrentIndex(newIndex);
    setCurrentMedia(imageMedia[newIndex]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showLightbox) {
        if (e.key === 'Escape') {
          setShowLightbox(false);
        } else if (e.key === 'ArrowLeft') {
          navigateLightbox('prev');
        } else if (e.key === 'ArrowRight') {
          navigateLightbox('next');
        }
      }
      if (showVideoPlayer && e.key === 'Escape') {
        setShowVideoPlayer(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showLightbox, showVideoPlayer, currentIndex]);

  // Споделяне
  const handleShare = (media) => {
    const text = t('clubs.ClubGallery.actions.shareText', { 
      title: media.title, 
      clubName: club.name 
    });
    if (navigator.share) {
      navigator.share({
        title: media.title,
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${text} - ${window.location.href}`);
      alert(t('clubs.ClubGallery.messages.linkCopied'));
    }
  };

  // Сваляне на файл
  const handleDownload = (media) => {
    const link = document.createElement('a');
    link.href = media.src;
    link.download = `${club.name}-${media.title}`;
    link.click();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'en' ? 'en-US' : 
                   'de-DE';
    
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <section id="general-gallery" className="general-gallery-main">
      <div className="general-gallery-container">
        
        {/* Header */}
        <div className="general-gallery-header">
          <div className="general-gallery-badge">
            <FontAwesomeIcon icon={faImages} />
            <span>{t('clubs.ClubGallery.header.badge')}</span>
          </div>
          <h2 className="general-gallery-title">{t('clubs.ClubGallery.header.title')}</h2>
          <p className="general-gallery-subtitle">
            {t('clubs.ClubGallery.header.subtitle')}
          </p>
          
          {/* Stats - само ако showStatistics е true */}
          {club.preferences?.showStatistics && (
            <div className="general-gallery-stats">
              <div className="general-gallery-stat">
                <FontAwesomeIcon icon={faImages} />
                <span>{stats.images}</span>
                <label>{t('clubs.ClubGallery.stats.images')}</label>
              </div>
              <div className="general-gallery-stat">
                <FontAwesomeIcon icon={faVideo} />
                <span>{stats.videos}</span>
                <label>{t('clubs.ClubGallery.stats.videos')}</label>
              </div>
              <div className="general-gallery-stat">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>{stats.events}</span>
                <label>{t('clubs.ClubGallery.stats.fromEvents')}</label>
              </div>
              <div className="general-gallery-stat">
                <FontAwesomeIcon icon={faEye} />
                <span>{stats.total}</span>
                <label>{t('clubs.ClubGallery.stats.totalFiles')}</label>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="general-gallery-controls">
          <div className="general-gallery-search">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder={t('clubs.ClubGallery.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="general-gallery-filters">
            <button
              className={`general-filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <FontAwesomeIcon icon={faFilter} />
              {t('clubs.ClubGallery.filters.all')} ({stats.total})
            </button>
            <button
              className={`general-filter-btn ${filter === 'images' ? 'active' : ''}`}
              onClick={() => setFilter('images')}
            >
              <FontAwesomeIcon icon={faImages} />
              {t('clubs.ClubGallery.filters.images')} ({stats.images})
            </button>
            <button
              className={`general-filter-btn ${filter === 'videos' ? 'active' : ''}`}
              onClick={() => setFilter('videos')}
            >
              <FontAwesomeIcon icon={faVideo} />
              {t('clubs.ClubGallery.filters.videos')} ({stats.videos})
            </button>
            <button
              className={`general-filter-btn ${filter === 'events' ? 'active' : ''}`}
              onClick={() => setFilter('events')}
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
              {t('clubs.ClubGallery.filters.fromEvents')} ({stats.events})
            </button>
          </div>

          <div className="general-view-controls">
            <button
              className={`general-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title={t('clubs.ClubGallery.viewModes.grid')}
            >
              <FontAwesomeIcon icon={faTh} />
            </button>
            <button
              className={`general-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title={t('clubs.ClubGallery.viewModes.list')}
            >
              <FontAwesomeIcon icon={faList} />
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredMedia.length > 0 ? (
          <div className={`general-gallery-grid ${viewMode}`}>
            {filteredMedia.map((media, index) => (
              <div
                key={media.id}
                className={`general-media-item ${media.type} ${media.isMain ? 'featured' : ''}`}
                onClick={() => openLightbox(media, index)}
              >
                <div className="general-media-thumbnail">
                  <img
                    src={media.thumbnail}
                    alt={media.alt}
                    loading="lazy"
                  />
                  
                  {/* Overlay */}
                  <div className="general-media-overlay">
                    <div className="general-media-actions">
                      <button
                        className="general-media-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          openLightbox(media, index);
                        }}
                        title={t('clubs.ClubGallery.actions.view')}
                      >
                        <FontAwesomeIcon icon={media.type === 'video' ? faPlay : faExpand} />
                      </button>
                      <button
                        className="general-media-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(media);
                        }}
                        title={t('clubs.ClubGallery.actions.share')}
                      >
                        <FontAwesomeIcon icon={faShare} />
                      </button>
                      <button
                        className="general-media-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(media);
                        }}
                        title={t('clubs.ClubGallery.actions.download')}
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                    </div>
                  </div>

                  {/* Type indicator */}
                  <div className="general-media-type">
                    <FontAwesomeIcon icon={media.type === 'video' ? faVideo : faCamera} />
                    {media.duration && <span>{media.duration}</span>}
                  </div>

                  {/* Category badge */}
                  <div className="general-media-category">
                    <FontAwesomeIcon icon={faTag} />
                    <span>{media.categoryLabel}</span>
                  </div>

                  {/* Featured badge */}
                  {media.isMain && (
                    <div className="general-featured-badge">
                      <FontAwesomeIcon icon={faHeart} />
                    </div>
                  )}
                </div>

                <div className="general-media-info">
                  <h3 className="general-media-title">{media.title}</h3>
                  
                  <div className="general-media-meta">
                    {media.eventDate && (
                      <div className="general-meta-item">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>{formatDate(media.eventDate)}</span>
                      </div>
                    )}
                    
                    {media.location && (
                      <div className="general-meta-item">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <span>{media.location}</span>
                      </div>
                    )}
                    
                    {media.photographer && (
                      <div className="general-meta-item">
                        <FontAwesomeIcon icon={faUser} />
                        <span>{media.photographer}</span>
                      </div>
                    )}
                  </div>

                  {media.eventTitle && (
                    <div className="general-event-link">
                      <span>{t('clubs.ClubGallery.media.fromEvent')}: {media.eventTitle}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="general-no-media">
            <FontAwesomeIcon icon={faImages} />
            <h3>{t('clubs.ClubGallery.noMedia.title')}</h3>
            <p>{t('clubs.ClubGallery.noMedia.subtitle')}</p>
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {showLightbox && currentMedia && (
        <div className="general-lightbox-overlay" onClick={() => setShowLightbox(false)}>
          <div className="general-lightbox" onClick={(e) => e.stopPropagation()}>
            <div className="general-lightbox-header">
              <div className="general-lightbox-info">
                <h3>{currentMedia.title}</h3>
                <div className="general-lightbox-meta">
                  {currentMedia.eventDate && (
                    <span><FontAwesomeIcon icon={faCalendarAlt} /> {formatDate(currentMedia.eventDate)}</span>
                  )}
                  {currentMedia.location && (
                    <span><FontAwesomeIcon icon={faMapMarkerAlt} /> {currentMedia.location}</span>
                  )}
                </div>
              </div>
              
              <div className="general-lightbox-actions">
                <button onClick={() => handleShare(currentMedia)}>
                  <FontAwesomeIcon icon={faShare} />
                </button>
                <button onClick={() => handleDownload(currentMedia)}>
                  <FontAwesomeIcon icon={faDownload} />
                </button>
                <button onClick={() => setShowLightbox(false)}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>

            <div className="general-lightbox-content">
              <button
                className="general-lightbox-nav prev"
                onClick={() => navigateLightbox('prev')}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>

              <img
                src={currentMedia.src}
                alt={currentMedia.alt}
                className="general-lightbox-image"
              />

              <button
                className="general-lightbox-nav next"
                onClick={() => navigateLightbox('next')}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>

            <div className="general-lightbox-footer">
              <div className="general-image-counter">
                {t('clubs.ClubGallery.lightbox.counter', { 
                  current: currentIndex + 1, 
                  total: filteredMedia.filter(item => item.type === 'image').length 
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Player */}
      {showVideoPlayer && selectedVideo && (
        <div className="general-video-overlay" onClick={() => setShowVideoPlayer(false)}>
          <div className="general-video-player" onClick={(e) => e.stopPropagation()}>
            <div className="general-video-header">
              <h3>{selectedVideo.title}</h3>
              <button onClick={() => setShowVideoPlayer(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="general-video-content">
              <video
                src={selectedVideo.src}
                controls
                autoPlay
                className="general-video-element"
              >
                {t('clubs.ClubGallery.video.notSupported')}
              </video>
            </div>

            <div className="general-video-info">
              {selectedVideo.eventTitle && (
                <p>{t('clubs.ClubGallery.media.fromEvent')}: <strong>{selectedVideo.eventTitle}</strong></p>
              )}
              {selectedVideo.duration && (
                <p><FontAwesomeIcon icon={faClock} /> {t('clubs.ClubGallery.video.duration')}: {selectedVideo.duration}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ClubGallery;