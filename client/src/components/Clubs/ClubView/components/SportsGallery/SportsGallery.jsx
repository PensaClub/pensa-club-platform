// components/SportsGallery/SportsGallery.jsx
import { useState, useMemo } from 'react';
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'masonry', 'list'
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedItems, setLikedItems] = useState(new Set());
  const [sortBy, setSortBy] = useState('newest');

  // Правилна проверка - показваме ако има ПОНЕ ЕДНО от тези неща
  if (!club?.gallery?.length && 
      !club?.media?.videos?.length && 
      !club?.activities?.events?.length &&
      !club?.achievements?.awards?.length) {
    return null;
  }

  // Събираме реалните данни от club-а според структурата
  const galleryPhotos = club.gallery || [];
  const mediaVideos = club.media?.videos || [];
  const events = club.activities?.events || [];
  const awards = club.achievements?.awards || [];

  // Създаваме медия от снимките в галерията
  const photoMedia = galleryPhotos.map((photo, index) => ({
    id: `photo-${index}`,
    type: 'photo',
    url: photo,
    thumbnail: photo,
    title: `Снимка ${index + 1}`,
    description: '',
    category: 'gallery',
    date: new Date().toISOString().split('T')[0],
    tags: ['галерия']
  }));

  // Създаваме медия от видеата
  const videoMedia = mediaVideos.map((video, index) => ({
    id: `video-${index}`,
    type: 'video',
    url: video.src,
    thumbnail: video.thumbnail,
    title: video.alt || `Видео ${index + 1}`,
    description: video.caption || '',
    category: video.type || 'general',
    date: new Date().toISOString().split('T')[0],
    duration: video.duration,
    tags: [video.type || 'видео']
  }));

  // Създаваме медия от събитията (ако имат снимки)
  const eventMedia = events.map(event => ({
    id: `event-${event.id}`,
    type: 'photo',
    url: '/api/placeholder/800/600', // placeholder за събития
    thumbnail: '/api/placeholder/400/300',
    title: event.title,
    description: event.description,
    category: 'event',
    date: event.date,
    location: '',
    tags: [event.type || 'събитие']
  }));

  // Създаваме медия от наградите (ако имат снимки)
  const awardMedia = awards.map(award => ({
    id: `award-${award.name}`,
    type: 'photo',
    url: '/api/placeholder/800/600', // placeholder за награди
    thumbnail: '/api/placeholder/400/300',
    title: award.name,
    description: award.description,
    category: 'achievement',
    date: `${award.year}-01-01`,
    tags: ['награда', 'постижение']
  }));

  // Обединяваме всички медии
  const allMedia = [
    ...photoMedia,
    ...videoMedia,
    ...eventMedia,
    ...awardMedia
  ];

  // Ако няма медия въобще, не показваме компонента
  if (allMedia.length === 0) {
    return null;
  }

  // Филтри за категории
  const categoryFilters = [
    { key: 'all', label: 'Всички', icon: faImages, color: '#6366f1' },
    { key: 'gallery', label: 'Галерия', icon: faCamera, color: '#64748b' },
    { key: 'general', label: 'Видеа', icon: faVideo, color: '#06b6d4' },
    { key: 'event', label: 'Събития', icon: faStar, color: '#8b5cf6' },
    { key: 'achievement', label: 'Постижения', icon: faAward, color: '#10b981' },
    { key: 'fitness', label: 'Фитнес', icon: faBolt, color: '#ef4444' },
    { key: 'aqua_fitness', label: 'Водна аеробика', icon: faTrophy, color: '#f59e0b' },
    { key: 'yoga', label: 'Йога', icon: faShieldAlt, color: '#84cc16' }
  ].filter(filter => {
    if (filter.key === 'all') return true;
    return allMedia.some(item => item.category === filter.key);
  });

  // Филтрираме и сортираме медията
  const filteredMedia = useMemo(() => {
    let filtered = allMedia;

    // Филтър по категория
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.category === activeFilter);
    }

    // Филтър по търсене
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search) ||
        item.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Сортиране
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

  // Handlers
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
    // Предотвратяваме скролирането на страницата
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    setSelectedMedia(null);
    // Възвръщаме скролирането
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
      // Fallback - копиране в clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Линкът е копиран в clipboard!');
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
    return filter ? filter.label : 'Общи';
  };

  // Статистики
  const stats = {
    totalPhotos: allMedia.filter(item => item.type === 'photo').length,
    totalVideos: allMedia.filter(item => item.type === 'video').length,
    totalEvents: eventMedia.length,
    totalAchievements: awardMedia.length
  };

  return (
    <section id="sports-gallery" className="sports-gallery-section">
      <div className="sports-gallery-container">
        
        {/* Header */}
        <div className="sports-gallery-header">
          <div className="sports-gallery-header-content">
            <div className="sports-gallery-badge">
              <FontAwesomeIcon icon={faGem} />
              <span>Нашата галерия</span>
            </div>
            <h2 className="sports-gallery-title">
              Моменти от живота на клуба
            </h2>
            <p className="sports-gallery-subtitle">
              Разгледайте снимки и видеа от нашите дейности, събития и постижения
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
                  <span className="sports-gallery-stat-label">Снимки</span>
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
                  <span className="sports-gallery-stat-label">Видеа</span>
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
                  <span className="sports-gallery-stat-label">Събития</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="sports-gallery-controls">
          
          {/* Search and Sort */}
          <div className="sports-gallery-search-sort">
            <div className="sports-gallery-search">
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder="Търсете в галерията..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="sports-gallery-sort">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Най-нови</option>
                <option value="oldest">Най-стари</option>
                <option value="name">По име</option>
              </select>
            </div>
          </div>
          
          {/* View Mode Buttons */}
          <div className="sports-gallery-view-modes">
            <button
              onClick={() => setViewMode('grid')}
              className={`sports-gallery-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={faTh} />
              <span>Мрежа</span>
            </button>
            <button
              onClick={() => setViewMode('masonry')}
              className={`sports-gallery-view-btn ${viewMode === 'masonry' ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={faColumns} />
              <span>Мозайка</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`sports-gallery-view-btn ${viewMode === 'list' ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={faList} />
              <span>Списък</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
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

        {/* Gallery Content */}
        <div className="sports-gallery-content">
          
          {/* Grid View */}
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
                        >
                          <FontAwesomeIcon icon={faHeart} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(item);
                          }}
                          className="sports-gallery-action-btn"
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
                          {new Date(item.date).toLocaleDateString('bg-BG')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Masonry View */}
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

          {/* List View */}
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
                          {new Date(item.date).toLocaleDateString('bg-BG')}
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
                    >
                      <FontAwesomeIcon icon={faHeart} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(item);
                      }}
                      className="sports-gallery-action-btn"
                    >
                      <FontAwesomeIcon icon={faShare} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="sports-gallery-results">
          <p>
            Показване на {filteredMedia.length} от {allMedia.length} елемента
            {searchTerm && ` за "${searchTerm}"`}
          </p>
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && selectedMedia && (
        <div className="sports-gallery-lightbox" onClick={closeLightbox}>
          <div className="sports-gallery-lightbox-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button 
              onClick={closeLightbox}
              className="sports-gallery-lightbox-close"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            {/* Navigation */}
            {filteredMedia.length > 1 && (
              <>
                <button 
                  onClick={() => navigateLightbox('prev')}
                  className="sports-gallery-lightbox-nav prev"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <button 
                  onClick={() => navigateLightbox('next')}
                  className="sports-gallery-lightbox-nav next"
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </>
            )}
            
            {/* Media Content */}
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
            
            {/* Media Info */}
            <div className="sports-gallery-lightbox-info">
              <div className="sports-gallery-lightbox-header">
                <h3>{selectedMedia.title}</h3>
                <div className="sports-gallery-lightbox-actions">
                  <button 
                    onClick={() => handleLike(selectedMedia.id)}
                    className={`sports-gallery-lightbox-action ${likedItems.has(selectedMedia.id) ? 'liked' : ''}`}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                    <span>Харесай</span>
                  </button>
                  <button 
                    onClick={() => handleShare(selectedMedia)}
                    className="sports-gallery-lightbox-action"
                  >
                    <FontAwesomeIcon icon={faShare} />
                    <span>Сподели</span>
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
                    <span>{new Date(selectedMedia.date).toLocaleDateString('bg-BG')}</span>
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