import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
  const [viewMode, setViewMode] = useState('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  if (!club?.gallery?.photos && 
      !club?.gallery?.videos && 
      !club?.events?.photos &&
      !club?.socialImpact?.photos &&
      !club?.activities?.photos) {
    return null;
  }

  const galleryPhotos = club.gallery?.photos || [];
  const galleryVideos = club.gallery?.videos || [];
  const eventPhotos = club.events?.photos || [];
  const impactPhotos = club.socialImpact?.photos || [];
  const activityPhotos = club.activities?.photos || [];

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

  if (allMedia.length === 0) {
    return null;
  }

  const getCategoryIcon = (category) => {
    const iconMap = {
      events: faCalendarAlt,
      impact: faHeart,
      activities: faUsers,
      general: faImage
    };
    return iconMap[category] || faImage;
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      events: '#f59e0b',
      impact: '#ef4444',
      activities: '#10b981',
      general: '#6366f1'
    };
    return colorMap[category] || '#6b7280';
  };

  const getCategoryLabel = (category) => {
    return t(`clubs.SocialGallery.categories.${category}`, category);
  };

  const getCategories = () => [
    { key: 'all', label: t('clubs.SocialGallery.categories.all'), icon: faImages },
    { key: 'events', label: t('clubs.SocialGallery.categories.events'), icon: faCalendarAlt },
    { key: 'impact', label: t('clubs.SocialGallery.categories.impact'), icon: faHeart },
    { key: 'activities', label: t('clubs.SocialGallery.categories.activities'), icon: faUsers },
    { key: 'general', label: t('clubs.SocialGallery.categories.general'), icon: faImage }
  ];

  const categories = getCategories();

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
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'de' ? 'de-DE' : 'en-US';
    
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDefaultAltText = (media) => {
    return media.type === 'photo' ? 
      t('clubs.SocialGallery.defaultAlt.photo') : 
      t('clubs.SocialGallery.defaultAlt.video');
  };

  const resetFilters = () => {
    setActiveFilter('all');
    setSearchTerm('');
  };

  return (
    <section id="social-gallery" className="social-gallery-section">
      <div className="social-gallery-container">
        
        <div className="social-gallery-header">
          <div className="social-gallery-header-content">
            <div className="social-gallery-badge">
              <FontAwesomeIcon icon={faImages} />
              <span>{t('clubs.SocialGallery.header.badge')}</span>
            </div>
            <h2 className="social-gallery-title">
              {t('clubs.SocialGallery.header.title')}
            </h2>
            <p className="social-gallery-subtitle">
              {t('clubs.SocialGallery.header.subtitle')}
            </p>
          </div>
          
          <div className="social-gallery-stats">
            <div className="social-gallery-stat">
              <span className="social-gallery-stat-number">{allMedia.filter(m => m.type === 'photo').length}</span>
              <span className="social-gallery-stat-label">{t('clubs.SocialGallery.stats.photos')}</span>
            </div>
            <div className="social-gallery-stat">
              <span className="social-gallery-stat-number">{allMedia.filter(m => m.type === 'video').length}</span>
              <span className="social-gallery-stat-label">{t('clubs.SocialGallery.stats.videos')}</span>
            </div>
          </div>
        </div>

        <div className="social-gallery-controls">
          <div className="social-gallery-search-bar">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder={t('clubs.SocialGallery.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="social-gallery-toolbar">
            <div className="social-gallery-view-toggle">
              <button 
                onClick={() => setViewMode('grid')}
                className={`social-gallery-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faTh} />
                <span>{t('clubs.SocialGallery.viewModes.grid')}</span>
              </button>
              <button 
                onClick={() => setViewMode('masonry')}
                className={`social-gallery-view-btn ${viewMode === 'masonry' ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faPhotoVideo} />
                <span>{t('clubs.SocialGallery.viewModes.masonry')}</span>
              </button>
            </div>
            
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
                    alt={media.alt || media.title || getDefaultAltText(media)} 
                    className="social-gallery-image"
                  />
                ) : (
                  <div className="social-gallery-video-thumbnail">
                    <img 
                      src={media.thumbnail || media.url} 
                      alt={media.alt || media.title || getDefaultAltText(media)} 
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

        {filteredMedia.length === 0 && (
          <div className="social-gallery-no-results">
            <FontAwesomeIcon icon={faImages} />
            <h3>{t('clubs.SocialGallery.noResults.title')}</h3>
            <p>{t('clubs.SocialGallery.noResults.message')}</p>
            <button 
              onClick={resetFilters}
              className="social-gallery-reset-btn"
            >
              {t('clubs.SocialGallery.noResults.showAll')}
            </button>
          </div>
        )}

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
                    alt={selectedImage.alt || selectedImage.title || getDefaultAltText(selectedImage)} 
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
                  {t('clubs.SocialGallery.lightbox.counter', { 
                    current: currentImageIndex + 1, 
                    total: filteredMedia.length 
                  })}
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