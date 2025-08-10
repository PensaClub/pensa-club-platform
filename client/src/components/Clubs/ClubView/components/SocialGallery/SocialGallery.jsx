import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faImages,
  faImage,
  faCamera,
  faVideo,
  faPlay,
  faEye,
  faHeart,
  faShare,
  faDownload,
  faExpand,
  faCompress,
  faTimes,
  faChevronLeft,
  faChevronRight,
  faCalendarAlt,
  faMapMarkerAlt,
  faUsers,
  faTag,
  faFilter,
  faSearch,
  faList,
  faPhotoVideo,
  faTh
} from '@fortawesome/free-solid-svg-icons';
import './socialGallery.css';

export const SocialGallery = ({ club }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'masonry'
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Проверяваме дали има необходимите данни
  if (!club?.gallery?.photos && 
      !club?.gallery?.videos && 
      !club?.events?.photos &&
      !club?.socialImpact?.photos &&
      !club?.activities?.photos) {
    return null;
  }

  // Събираме всички снимки и видеа
  const galleryPhotos = club.gallery?.photos || [];
  const galleryVideos = club.gallery?.videos || [];
  const eventPhotos = club.events?.photos || [];
  const impactPhotos = club.socialImpact?.photos || [];
  const activityPhotos = club.activities?.photos || [];

  // Създаваме обединен списък с медия
  const allMedia = [
    ...galleryPhotos.map(photo => ({
      ...photo,
      id: `gallery-${photo.url}`,
      type: 'photo',
      category: photo.category || 'general',
      source: 'gallery'
    })),
    ...galleryVideos.map(video => ({
      ...video,
      id: `video-${video.url}`,
      type: 'video',
      category: video.category || 'general',
      source: 'gallery'
    })),
    ...eventPhotos.map(photo => ({
      ...photo,
      id: `event-${photo.url}`,
      type: 'photo',
      category: 'events',
      source: 'events'
    })),
    ...impactPhotos.map(photo => ({
      ...photo,
      id: `impact-${photo.url}`,
      type: 'photo',
      category: 'impact',
      source: 'impact'
    })),
    ...activityPhotos.map(photo => ({
      ...photo,
      id: `activity-${photo.url}`,
      type: 'photo',
      category: 'activities',
      source: 'activities'
    }))
  ];

  // Ако няма медия, не показваме компонента
  if (allMedia.length === 0) {
    return null;
  }

  // Helper функции
  function getCategoryIcon(category) {
    switch(category) {
      case 'events': return faCalendarAlt;
      case 'impact': return faHeart;
      case 'activities': return faUsers;
      case 'general': return faImage;
      default: return faImage;
    }
  }

  function getCategoryColor(category) {
    switch(category) {
      case 'events': return '#f59e0b';
      case 'impact': return '#ef4444';
      case 'activities': return '#10b981';
      case 'general': return '#6366f1';
      default: return '#6b7280';
    }
  }

  function getCategoryLabel(category) {
    switch(category) {
      case 'events': return 'События';
      case 'impact': return 'Въздействие';
      case 'activities': return 'Дейности';
      case 'general': return 'Общи';
      default: return 'Други';
    }
  }

  // Категории за филтриране
  const categories = [
    { key: 'all', label: 'Всички', icon: faImages },
    { key: 'events', label: 'Събития', icon: faCalendarAlt },
    { key: 'impact', label: 'Въздействие', icon: faHeart },
    { key: 'activities', label: 'Дейности', icon: faUsers },
    { key: 'general', label: 'Общи', icon: faImage }
  ];

  // Филтриране на медия
  const filteredMedia = allMedia.filter(item => {
    const matchesCategory = activeFilter === 'all' || item.category === activeFilter;
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.alt?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openLightbox = (media, index) => {
    setSelectedImage(media);
    setCurrentImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    const nextIndex = (currentImageIndex + 1) % filteredMedia.length;
    setCurrentImageIndex(nextIndex);
    setSelectedImage(filteredMedia[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = currentImageIndex === 0 ? filteredMedia.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(prevIndex);
    setSelectedImage(filteredMedia[prevIndex]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <section id="social-gallery" className="social-gallery-section">
      <div className="social-gallery-container">
        
        {/* Header */}
        <div className="social-gallery-header">
          <div className="social-gallery-header-content">
            <div className="social-gallery-badge">
              <FontAwesomeIcon icon={faImages} />
              <span>Нашата галерия</span>
            </div>
            <h2 className="social-gallery-title">
              Моменти които споделяме заедно
            </h2>
            <p className="social-gallery-subtitle">
              Разгледайте снимки и видеа от нашите събития, дейности и ежедневието в клуба
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="social-gallery-stats">
            <div className="social-gallery-stat">
              <span className="social-gallery-stat-number">{allMedia.filter(m => m.type === 'photo').length}</span>
              <span className="social-gallery-stat-label">Снимки</span>
            </div>
            <div className="social-gallery-stat">
              <span className="social-gallery-stat-number">{allMedia.filter(m => m.type === 'video').length}</span>
              <span className="social-gallery-stat-label">Видеа</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="social-gallery-controls">
          {/* Search Bar */}
          <div className="social-gallery-search-bar">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Търсете снимки и видеа..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="social-gallery-toolbar">
            {/* View Mode Toggle */}
            <div className="social-gallery-view-toggle">
              <button 
                onClick={() => setViewMode('grid')}
                className={`social-gallery-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faTh} />
                <span>Решетка</span>
              </button>
              <button 
                onClick={() => setViewMode('masonry')}
                className={`social-gallery-view-btn ${viewMode === 'masonry' ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faPhotoVideo} />
                <span>Мозайка</span>
              </button>
            </div>
            
            {/* Category Filter */}
            <div className="social-gallery-category-filters">
              {categories.map(category => (
                <button
                  key={category.key}
                  onClick={() => setActiveFilter(category.key)}
                  className={`social-gallery-category-btn ${activeFilter === category.key ? 'active' : ''}`}
                >
                  <FontAwesomeIcon icon={category.icon} />
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className={`social-gallery-grid ${viewMode}`}>
          {filteredMedia.map((media, index) => (
            <div 
              key={media.id}
              className="social-gallery-item"
              onClick={() => openLightbox(media, index)}
              style={{ '--item-delay': `${index * 0.05}s` }}
            >
              <div className="social-gallery-item-container">
                {media.type === 'photo' ? (
                  <img 
                    src={media.url || media.src} 
                    alt={media.alt || media.title || 'Снимка от галерията'} 
                    className="social-gallery-image"
                  />
                ) : (
                  <div className="social-gallery-video-thumbnail">
                    <img 
                      src={media.thumbnail || media.url} 
                      alt={media.alt || media.title || 'Видео от галерията'} 
                      className="social-gallery-image"
                    />
                    <div className="social-gallery-play-button">
                      <FontAwesomeIcon icon={faPlay} />
                    </div>
                  </div>
                )}
                
                <div className="social-gallery-overlay">
                  <div className="social-gallery-item-info">
                    {media.title && (
                      <h4 className="social-gallery-item-title">{media.title}</h4>
                    )}
                    {media.date && (
                      <div className="social-gallery-item-date">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>{formatDate(media.date)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="social-gallery-item-actions">
                    <div 
                      className="social-gallery-category-tag"
                      style={{ backgroundColor: getCategoryColor(media.category) }}
                    >
                      <FontAwesomeIcon icon={getCategoryIcon(media.category)} />
                      <span>{getCategoryLabel(media.category)}</span>
                    </div>
                    
                    <button className="social-gallery-view-btn">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredMedia.length === 0 && (
          <div className="social-gallery-no-results">
            <FontAwesomeIcon icon={faImages} />
            <h3>Няма намерени снимки или видеа</h3>
            <p>Опитайте с различни критерии за търсене</p>
            <button 
              onClick={() => {setActiveFilter('all'); setSearchTerm('');}}
              className="social-gallery-reset-btn"
            >
              Покажи всички
            </button>
          </div>
        )}

        {/* Lightbox */}
        {selectedImage && (
          <div className="social-gallery-lightbox" onClick={closeLightbox}>
            <div className="social-gallery-lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button className="social-gallery-lightbox-close" onClick={closeLightbox}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
              
              {filteredMedia.length > 1 && (
                <>
                  <button className="social-gallery-lightbox-nav prev" onClick={prevImage}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  <button className="social-gallery-lightbox-nav next" onClick={nextImage}>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </>
              )}
              
              <div className="social-gallery-lightbox-media">
                {selectedImage.type === 'photo' ? (
                  <img 
                    src={selectedImage.url || selectedImage.src} 
                    alt={selectedImage.alt || selectedImage.title || 'Снимка от галерията'} 
                  />
                ) : (
                  <video 
                    src={selectedImage.url} 
                    controls 
                    autoPlay
                  />
                )}
              </div>
              
              <div className="social-gallery-lightbox-info">
                {selectedImage.title && (
                  <h3 className="social-gallery-lightbox-title">{selectedImage.title}</h3>
                )}
                {selectedImage.description && (
                  <p className="social-gallery-lightbox-description">{selectedImage.description}</p>
                )}
                
                <div className="social-gallery-lightbox-meta">
                  <div 
                    className="social-gallery-lightbox-category"
                    style={{ backgroundColor: getCategoryColor(selectedImage.category) }}
                  >
                    <FontAwesomeIcon icon={getCategoryIcon(selectedImage.category)} />
                    <span>{getCategoryLabel(selectedImage.category)}</span>
                  </div>
                  
                  {selectedImage.date && (
                    <div className="social-gallery-lightbox-date">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>{formatDate(selectedImage.date)}</span>
                    </div>
                  )}
                  
                  {selectedImage.location && (
                    <div className="social-gallery-lightbox-location">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      <span>{selectedImage.location}</span>
                    </div>
                  )}
                </div>
                
                <div className="social-gallery-lightbox-counter">
                  {currentImageIndex + 1} от {filteredMedia.length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SocialGallery;