import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faImages,
  faVideo,
  faCamera,
  faPlay,
  faExpand,
  faShare,
  faDownload,
  faHeart,
  faComment,
  faEye,
  faFilter,
  faSearch,
  faTh,
  faList,
  faColumns,
  faChevronLeft,
  faChevronRight,
  faTimes,
  faPlus,
  faCalendarAlt,
  faMapMarkerAlt,
  faUser,
  faTrophy,
  faStar,
  faAward,
  faThumbsUp,
  faShareAlt,
  faTag,
  faInfo,
  faArrowLeft,
  faArrowRight,
  faBolt,
  faGem,
  faShieldAlt,
  faVolumeUp,
  faVolumeMute,
  faCompressAlt,
  faPause
} from '@fortawesome/free-solid-svg-icons';
import './sportsGallery.css';

export const SportsGallery = ({ club }) => {
  const { t, i18n } = useTranslation();
  const [viewMode, setViewMode] = useState('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedItems, setLikedItems] = useState(new Set());
  const [sortBy, setSortBy] = useState('newest');

  if (!club?.gallery?.length && 
      !club?.media?.videos?.length && 
      !club?.activities?.events?.length &&
      !club?.achievements?.awards?.length) {
    return null;
  }

  const galleryPhotos = club.gallery || [];
  const mediaVideos = club.media?.videos || [];
  const events = club.activities?.events || [];
  const awards = club.achievements?.awards || [];

  const photoMedia = galleryPhotos.map((photo, index) => ({
    id: `photo-${index}`,
    type: 'photo',
    url: photo,
    thumbnail: photo,
    title: t('clubs.SportsGallery.defaultTitles.photo', { number: index + 1 }),
    description: '',
    category: 'gallery',
    date: new Date().toISOString().split('T')[0],
    tags: [t('clubs.SportsGallery.categories.gallery')]
  }));

  const videoMedia = mediaVideos.map((video, index) => ({
    id: `video-${index}`,
    type: 'video',
    url: video.src,
    thumbnail: video.thumbnail,
    title: video.alt || t('clubs.SportsGallery.defaultTitles.video', { number: index + 1 }),
    description: video.caption || '',
    category: video.type || 'general',
    date: new Date().toISOString().split('T')[0],
    duration: video.duration,
    tags: [video.type || t('clubs.SportsGallery.categories.video')]
  }));

  const eventMedia = events.map(event => ({
    id: `event-${event.id}`,
    type: 'photo',
    url: '/api/placeholder/800/600',
    thumbnail: '/api/placeholder/400/300',
    title: event.title,
    description: event.description,
    category: 'event',
    date: event.date,
    location: '',
    tags: [event.type || t('clubs.SportsGallery.categories.event')]
  }));

  const awardMedia = awards.map(award => ({
    id: `award-${award.name}`,
    type: 'photo',
    url: '/api/placeholder/800/600',
    thumbnail: '/api/placeholder/400/300',
    title: award.name,
    description: award.description,
    category: 'achievement',
    date: `${award.year}-01-01`,
    tags: [t('clubs.SportsGallery.categories.award'), t('clubs.SportsGallery.categories.achievement')]
  }));

  const allMedia = [
    ...photoMedia,
    ...videoMedia,
    ...eventMedia,
    ...awardMedia
  ];

  if (allMedia.length === 0) {
    return null;
  }

  const getCategoryFilters = () => [
    { 
      key: 'all', 
      label: t('clubs.SportsGallery.filters.all'), 
      icon: faImages, 
      color: '#6366f1' 
    },
    { 
      key: 'gallery', 
      label: t('clubs.SportsGallery.filters.gallery'), 
      icon: faCamera, 
      color: '#64748b' 
    },
    { 
      key: 'general', 
      label: t('clubs.SportsGallery.filters.videos'), 
      icon: faVideo, 
      color: '#06b6d4' 
    },
    { 
      key: 'event', 
      label: t('clubs.SportsGallery.filters.events'), 
      icon: faStar, 
      color: '#8b5cf6' 
    },
    { 
      key: 'achievement', 
      label: t('clubs.SportsGallery.filters.achievements'), 
      icon: faAward, 
      color: '#10b981' 
    },
    { 
      key: 'fitness', 
      label: t('clubs.SportsGallery.filters.fitness'), 
      icon: faBolt, 
      color: '#ef4444' 
    },
    { 
      key: 'aqua_fitness', 
      label: t('clubs.SportsGallery.filters.aquaFitness'), 
      icon: faTrophy, 
      color: '#f59e0b' 
    },
    { 
      key: 'yoga', 
      label: t('clubs.SportsGallery.filters.yoga'), 
      icon: faShieldAlt, 
      color: '#84cc16' 
    }
  ].filter(filter => {
    if (filter.key === 'all') return true;
    return allMedia.some(item => item.category === filter.key);
  });

  const getSortOptions = () => [
    { value: 'newest', label: t('clubs.SportsGallery.sortOptions.newest') },
    { value: 'oldest', label: t('clubs.SportsGallery.sortOptions.oldest') },
    { value: 'name', label: t('clubs.SportsGallery.sortOptions.name') }
  ];

  const getViewModes = () => [
    { key: 'grid', label: t('clubs.SportsGallery.viewModes.grid'), icon: faTh },
    { key: 'masonry', label: t('clubs.SportsGallery.viewModes.masonry'), icon: faColumns },
    { key: 'list', label: t('clubs.SportsGallery.viewModes.list'), icon: faList }
  ];

  const categoryFilters = getCategoryFilters();
  const sortOptions = getSortOptions();
  const viewModes = getViewModes();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'de' ? 'de-DE' : 'en-US';
    return date.toLocaleDateString(locale);
  };

  const filteredMedia = useMemo(() => {
    let filtered = allMedia;

    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.category === activeFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search) ||
        item.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date || 0) - new Date(a.date || 0);
        case 'oldest':
          return new Date(a.date || 0) - new Date(b.date || 0);
        case 'name':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [allMedia, activeFilter, searchTerm, sortBy]);

  const handleLike = (itemId) => {
    const newLiked = new Set(likedItems);
    if (newLiked.has(itemId)) {
      newLiked.delete(itemId);
    } else {
      newLiked.add(itemId);
    }
    setLikedItems(newLiked);
  };

  const openLightbox = (item, index) => {
    setSelectedMedia(item);
    setCurrentIndex(index);
    setShowLightbox(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    setSelectedMedia(null);
    document.body.style.overflow = 'unset';
  };

  const navigateLightbox = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % filteredMedia.length
      : (currentIndex - 1 + filteredMedia.length) % filteredMedia.length;
    
    setCurrentIndex(newIndex);
    setSelectedMedia(filteredMedia[newIndex]);
  };

  const handleShare = async (item) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Sharing failed:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert(t('clubs.SportsGallery.messages.linkCopied'));
      } catch (error) {
        console.log('Copy failed:', error);
      }
    }
  };

  const getMediaIcon = (item) => {
    if (item.type === 'video') return faPlay;
    if (item.category === 'achievement') return faAward;
    if (item.category === 'event') return faStar;
    return faCamera;
  };

  const getCategoryLabel = (category) => {
    const filter = categoryFilters.find(f => f.key === category);
    return filter ? filter.label : t('clubs.SportsGallery.categories.general');
  };

  const stats = {
    totalPhotos: allMedia.filter(item => item.type === 'photo').length,
    totalVideos: allMedia.filter(item => item.type === 'video').length,
    totalEvents: eventMedia.length,
    totalAchievements: awardMedia.length
  };

  return (
    <section id="sports-gallery" className="sports-gallery-section">
      <div className="sports-gallery-container">
        
        <div className="sports-gallery-header">
          <div className="sports-gallery-header-content">
            <div className="sports-gallery-badge">
              <FontAwesomeIcon icon={faGem} />
              <span>{t('clubs.SportsGallery.header.badge')}</span>
            </div>
            <h2 className="sports-gallery-title">
              {t('clubs.SportsGallery.header.title')}
            </h2>
            <p className="sports-gallery-subtitle">
              {t('clubs.SportsGallery.header.subtitle')}
            </p>
          </div>
          
          <div className="sports-gallery-stats">
            {stats.totalPhotos > 0 && (
              <div className="sports-gallery-stat-card">
                <div className="sports-gallery-stat-icon">
                  <FontAwesomeIcon icon={faImages} />
                </div>
                <div className="sports-gallery-stat-content">
                  <span className="sports-gallery-stat-number">{stats.totalPhotos}</span>
                  <span className="sports-gallery-stat-label">{t('clubs.SportsGallery.stats.photos')}</span>
                </div>
              </div>
            )}
            {stats.totalVideos > 0 && (
              <div className="sports-gallery-stat-card">
                <div className="sports-gallery-stat-icon">
                  <FontAwesomeIcon icon={faVideo} />
                </div>
                <div className="sports-gallery-stat-content">
                  <span className="sports-gallery-stat-number">{stats.totalVideos}</span>
                  <span className="sports-gallery-stat-label">{t('clubs.SportsGallery.stats.videos')}</span>
                </div>
              </div>
            )}
            {stats.totalEvents > 0 && (
              <div className="sports-gallery-stat-card">
                <div className="sports-gallery-stat-icon">
                  <FontAwesomeIcon icon={faStar} />
                </div>
                <div className="sports-gallery-stat-content">
                  <span className="sports-gallery-stat-number">{stats.totalEvents}</span>
                  <span className="sports-gallery-stat-label">{t('clubs.SportsGallery.stats.events')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sports-gallery-controls">
          
          <div className="sports-gallery-search-sort">
            <div className="sports-gallery-search">
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder={t('clubs.SportsGallery.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="sports-gallery-sort">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="sports-gallery-view-modes">
            {viewModes.map(mode => (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key)}
                className={`sports-gallery-view-btn ${viewMode === mode.key ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={mode.icon} />
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="sports-gallery-filters">
          {categoryFilters.map(filter => {
            const count = filter.key === 'all' ? allMedia.length :
                         allMedia.filter(item => item.category === filter.key).length;
            
            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`sports-gallery-filter-chip ${activeFilter === filter.key ? 'active' : ''}`}
                style={{ '--filter-color': filter.color }}
              >
                <FontAwesomeIcon icon={filter.icon} />
                <span>{filter.label}</span>
                <span className="sports-gallery-filter-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="sports-gallery-content">
          
          {viewMode === 'grid' && (
            <div className="sports-gallery-grid">
              {filteredMedia.map((item, index) => (
                <div 
                  key={item.id}
                  className="sports-gallery-item"
                  onClick={() => openLightbox(item, index)}
                >
                  <div className="sports-gallery-item-media">
                    <img 
                      src={item.thumbnail || item.url} 
                      alt={item.title}
                      loading="lazy"
                    />
                    <div className="sports-gallery-item-overlay">
                      <div className="sports-gallery-item-type">
                        <FontAwesomeIcon icon={getMediaIcon(item)} />
                        {item.type === 'video' && item.duration && (
                          <span className="sports-gallery-duration">{item.duration}</span>
                        )}
                      </div>
                      <div className="sports-gallery-item-actions">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(item.id);
                          }}
                          className={`sports-gallery-action-btn ${likedItems.has(item.id) ? 'liked' : ''}`}
                          title={t('clubs.SportsGallery.actions.like')}
                        >
                          <FontAwesomeIcon icon={faHeart} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(item);
                          }}
                          className="sports-gallery-action-btn"
                          title={t('clubs.SportsGallery.actions.share')}
                        >
                          <FontAwesomeIcon icon={faShare} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="sports-gallery-item-info">
                    <h3>{item.title}</h3>
                    {item.description && <p>{item.description}</p>}
                    <div className="sports-gallery-item-meta">
                      <div className="sports-gallery-item-category">
                        {getCategoryLabel(item.category)}
                      </div>
                      {item.date && (
                        <div className="sports-gallery-item-date">
                          {formatDate(item.date)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'masonry' && (
            <div className="sports-gallery-masonry">
              {filteredMedia.map((item, index) => (
                <div 
                  key={item.id}
                  className="sports-gallery-masonry-item"
                  onClick={() => openLightbox(item, index)}
                >
                  <div className="sports-gallery-masonry-media">
                    <img 
                      src={item.thumbnail || item.url} 
                      alt={item.title}
                      loading="lazy"
                    />
                    <div className="sports-gallery-masonry-overlay">
                      <div className="sports-gallery-masonry-type">
                        <FontAwesomeIcon icon={getMediaIcon(item)} />
                      </div>
                      <div className="sports-gallery-masonry-info">
                        <h4>{item.title}</h4>
                        <span>{getCategoryLabel(item.category)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="sports-gallery-list">
              {filteredMedia.map((item, index) => (
                <div 
                  key={item.id}
                  className="sports-gallery-list-item"
                  onClick={() => openLightbox(item, index)}
                >
                  <div className="sports-gallery-list-thumbnail">
                    <img 
                      src={item.thumbnail || item.url} 
                      alt={item.title}
                      loading="lazy"
                    />
                    <div className="sports-gallery-list-type">
                      <FontAwesomeIcon icon={getMediaIcon(item)} />
                    </div>
                  </div>
                  
                  <div className="sports-gallery-list-content">
                    <div className="sports-gallery-list-header">
                      <h3>{item.title}</h3>
                      <div className="sports-gallery-list-category">
                        {getCategoryLabel(item.category)}
                      </div>
                    </div>
                    
                    {item.description && (
                      <p className="sports-gallery-list-description">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="sports-gallery-list-meta">
                      {item.date && (
                        <span>
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          {formatDate(item.date)}
                        </span>
                      )}
                      {item.location && (
                        <span>
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                          {item.location}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="sports-gallery-list-actions">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(item.id);
                      }}
                      className={`sports-gallery-action-btn ${likedItems.has(item.id) ? 'liked' : ''}`}
                      title={t('clubs.SportsGallery.actions.like')}
                    >
                      <FontAwesomeIcon icon={faHeart} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(item);
                      }}
                      className="sports-gallery-action-btn"
                      title={t('clubs.SportsGallery.actions.share')}
                    >
                      <FontAwesomeIcon icon={faShare} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sports-gallery-results">
          <p>
            {t('clubs.SportsGallery.results.showing', {
              filtered: filteredMedia.length,
              total: allMedia.length,
              search: searchTerm ? t('clubs.SportsGallery.results.forSearch', { term: searchTerm }) : ''
            })}
          </p>
        </div>
      </div>

      {showLightbox && selectedMedia && (
        <div className="sports-gallery-lightbox" onClick={closeLightbox}>
          <div className="sports-gallery-lightbox-content" onClick={(e) => e.stopPropagation()}>
            
            <button 
              onClick={closeLightbox}
              className="sports-gallery-lightbox-close"
              title={t('clubs.SportsGallery.lightbox.close')}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            {filteredMedia.length > 1 && (
              <>
                <button 
                  onClick={() => navigateLightbox('prev')}
                  className="sports-gallery-lightbox-nav prev"
                  title={t('clubs.SportsGallery.lightbox.previous')}
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <button 
                  onClick={() => navigateLightbox('next')}
                  className="sports-gallery-lightbox-nav next"
                  title={t('clubs.SportsGallery.lightbox.next')}
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </>
            )}
            
            <div className="sports-gallery-lightbox-media">
              {selectedMedia.type === 'video' ? (
                <video 
                  src={selectedMedia.url}
                  poster={selectedMedia.thumbnail}
                  controls
                  className="sports-gallery-lightbox-video"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <img 
                  src={selectedMedia.url} 
                  alt={selectedMedia.title}
                  className="sports-gallery-lightbox-image"
                />
              )}
            </div>
            
            <div className="sports-gallery-lightbox-info">
              <div className="sports-gallery-lightbox-header">
                <h3>{selectedMedia.title}</h3>
                <div className="sports-gallery-lightbox-actions">
                  <button 
                    onClick={() => handleLike(selectedMedia.id)}
                    className={`sports-gallery-lightbox-action ${likedItems.has(selectedMedia.id) ? 'liked' : ''}`}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                    <span>{t('clubs.SportsGallery.actions.like')}</span>
                  </button>
                  <button 
                    onClick={() => handleShare(selectedMedia)}
                    className="sports-gallery-lightbox-action"
                  >
                    <FontAwesomeIcon icon={faShare} />
                    <span>{t('clubs.SportsGallery.actions.share')}</span>
                  </button>
                </div>
              </div>
              
              {selectedMedia.description && (
                <p className="sports-gallery-lightbox-description">
                  {selectedMedia.description}
                </p>
              )}
              
              <div className="sports-gallery-lightbox-meta">
                <div className="sports-gallery-lightbox-meta-item">
                  <FontAwesomeIcon icon={faTag} />
                  <span>{getCategoryLabel(selectedMedia.category)}</span>
                </div>
                {selectedMedia.date && (
                  <div className="sports-gallery-lightbox-meta-item">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>{formatDate(selectedMedia.date)}</span>
                  </div>
                )}
                {selectedMedia.duration && (
                  <div className="sports-gallery-lightbox-meta-item">
                    <FontAwesomeIcon icon={faVideo} />
                    <span>{selectedMedia.duration}</span>
                  </div>
                )}
              </div>
              
              {selectedMedia.tags && selectedMedia.tags.length > 0 && (
                <div className="sports-gallery-lightbox-tags">
                  {selectedMedia.tags.map(tag => (
                    <span key={tag} className="sports-gallery-tag">
                      <FontAwesomeIcon icon={faTag} />
                      {tag}
                    </span>
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

export default SportsGallery;