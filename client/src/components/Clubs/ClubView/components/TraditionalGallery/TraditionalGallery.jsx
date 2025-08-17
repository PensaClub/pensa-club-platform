import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faImages,
  faPlay,
  faDownload,
  faShare,
  faTimes,
  faChevronLeft,
  faChevronRight,
  faEye,
  faVideo,
  faCamera,
  faFilter,
  faList,
  faSearch,
  faCalendarAlt,
  faTag,
  faTh
} from '@fortawesome/free-solid-svg-icons';
import './traditionalGallery.css';

export const TraditionalGallery = ({ club }) => {
  const { t, i18n } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');

  if (!club?.name) {
    return null;
  }

  const gallery = club.gallery || [];
  const videos = club.media?.videos || [];
  const mainImage = club.mainImage;
  const events = club.activities?.events || [];
  const regularActivities = club.activities?.regular || [];

  const getLocale = () => {
    return i18n.language === 'bg' ? 'bg-BG' : 
           i18n.language === 'de' ? 'de-DE' : 'en-US';
  };

  const allMediaItems = useMemo(() => {
    const items = [];

    if (mainImage) {
      items.push({
        id: 'main-image',
        src: mainImage,
        type: 'image',
        category: 'main',
        title: t('clubs.TraditionalGallery.items.mainImageTitle', { clubName: club.name }),
        description: t('clubs.TraditionalGallery.items.mainImageDescription', { clubName: club.name }),
        date: new Date(),
        alt: t('clubs.TraditionalGallery.items.mainImageAlt', { clubName: club.name })
      });
    }

    gallery.forEach((imageSrc, index) => {
      items.push({
        id: `gallery-${index}`,
        src: imageSrc,
        type: 'image',
        category: 'gallery',
        title: t('clubs.TraditionalGallery.items.galleryImageTitle', { index: index + 1 }),
        description: t('clubs.TraditionalGallery.items.galleryImageDescription', { clubName: club.name }),
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        alt: t('clubs.TraditionalGallery.items.galleryImageAlt', { index: index + 1, clubName: club.name })
      });
    });

    videos.forEach((video, index) => {
      items.push({
        id: `video-${index}`,
        src: video.src,
        thumbnail: video.thumbnail,
        type: 'video',
        category: 'video',
        title: video.caption || t('clubs.TraditionalGallery.items.videoTitle', { index: index + 1 }),
        description: video.alt || t('clubs.TraditionalGallery.items.videoDescription', { clubName: club.name }),
        duration: video.duration,
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        alt: video.alt || t('clubs.TraditionalGallery.items.videoAlt', { index: index + 1, clubName: club.name }),
        videoType: video.type
      });
    });

    return items.sort((a, b) => b.date - a.date);
  }, [gallery, videos, mainImage, club.name, t]);

  const categories = useMemo(() => {
    const cats = [{ 
      id: 'all', 
      label: t('clubs.TraditionalGallery.categories.all'), 
      count: allMediaItems.length 
    }];
    
    const typeCounts = allMediaItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    Object.entries(typeCounts).forEach(([category, count]) => {
      const label = t(`clubs.TraditionalGallery.categories.${category}`, { defaultValue: category });
      cats.push({ id: category, label, count });
    });

    return cats;
  }, [allMediaItems, t]);

  const filteredItems = useMemo(() => {
    let filtered = allMediaItems;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.alt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [allMediaItems, selectedCategory, searchTerm]);

  const hasGalleryContent = allMediaItems.length > 0;

  if (!hasGalleryContent) {
    return null;
  }

  const formatDate = (date) => {
    return date.toLocaleDateString(getLocale(), { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const openModal = (item, index) => {
    setCurrentItem(item);
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setCurrentIndex(0);
  };

  const navigateItem = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % filteredItems.length
      : (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    
    setCurrentIndex(newIndex);
    setCurrentItem(filteredItems[newIndex]);
  };

  const handleDownload = async (item) => {
    try {
      const response = await fetch(item.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${item.title || 'media'}.${item.type === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert(t('clubs.TraditionalGallery.messages.downloadError'));
    }
  };

  const handleShare = (item) => {
    const text = t('clubs.TraditionalGallery.shareText', { title: item.title, clubName: club.name });
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: text,
        url: url
      });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      alert(t('clubs.TraditionalGallery.messages.shareSuccess'));
    }
  };

  const getMediaTypeLabel = (type) => {
    return t(`clubs.TraditionalGallery.mediaTypes.${type}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  return (
    <section id="traditional-gallery" className="traditional-gallery-main-section">
      <div className="traditional-gallery-container">
        
        <div className="traditional-gallery-header">
          <div className="traditional-gallery-badge">
            <FontAwesomeIcon icon={faImages} />
            <span>{t('clubs.TraditionalGallery.header.badge')}</span>
          </div>
          <h2 className="traditional-gallery-title">{t('clubs.TraditionalGallery.header.title')}</h2>
          <p className="traditional-gallery-subtitle">
            {t('clubs.TraditionalGallery.header.subtitle')}
          </p>
        </div>

        <div className="traditional-gallery-main-content">
          
          <div className="traditional-gallery-controls">
            
            <div className="traditional-gallery-search">
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder={t('clubs.TraditionalGallery.controls.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {categories.length > 2 && (
              <div className="traditional-gallery-categories">
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`traditional-gallery-category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <FontAwesomeIcon icon={faFilter} />
                    {category.label} ({category.count})
                  </button>
                ))}
              </div>
            )}

            <div className="traditional-gallery-view-controls">
              <div className="traditional-gallery-view-modes">
                <button 
                  className={`traditional-gallery-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <FontAwesomeIcon icon={faTh} />
                </button>
                <button 
                  className={`traditional-gallery-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <FontAwesomeIcon icon={faList} />
                </button>
              </div>
              <div className="traditional-gallery-count">
                {t('clubs.TraditionalGallery.controls.itemCount', { count: filteredItems.length })}
              </div>
            </div>
          </div>

          {filteredItems.length > 0 ? (
            <div className={`traditional-gallery-content ${viewMode}`}>
              
              {viewMode === 'grid' && (
                <div className="traditional-gallery-grid">
                  {filteredItems.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="traditional-gallery-item"
                      onClick={() => openModal(item, index)}
                    >
                      <div className="traditional-gallery-item-container">
                        {item.type === 'video' ? (
                          <>
                            <img src={item.thumbnail} alt={item.alt} />
                            <div className="traditional-gallery-play-overlay">
                              <FontAwesomeIcon icon={faPlay} />
                            </div>
                            {item.duration && (
                              <div className="traditional-gallery-duration">{item.duration}</div>
                            )}
                          </>
                        ) : (
                          <img src={item.src} alt={item.alt} />
                        )}
                        
                        <div className="traditional-gallery-item-overlay">
                          <div className="traditional-gallery-item-actions">
                            <button 
                              className="traditional-gallery-action-btn view"
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal(item, index);
                              }}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button 
                              className="traditional-gallery-action-btn download"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(item);
                              }}
                            >
                              <FontAwesomeIcon icon={faDownload} />
                            </button>
                            <button 
                              className="traditional-gallery-action-btn share"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(item);
                              }}
                            >
                              <FontAwesomeIcon icon={faShare} />
                            </button>
                          </div>
                          <div className="traditional-gallery-item-info">
                            <div className="traditional-gallery-item-type">
                              <FontAwesomeIcon icon={item.type === 'video' ? faVideo : faCamera} />
                              {getMediaTypeLabel(item.type)}
                            </div>
                            <div className="traditional-gallery-item-title">{item.title}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <div className="traditional-gallery-list">
                  {filteredItems.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="traditional-gallery-list-item"
                      onClick={() => openModal(item, index)}
                    >
                      <div className="traditional-gallery-list-thumbnail">
                        {item.type === 'video' ? (
                          <>
                            <img src={item.thumbnail} alt={item.alt} />
                            <div className="traditional-gallery-list-play">
                              <FontAwesomeIcon icon={faPlay} />
                            </div>
                          </>
                        ) : (
                          <img src={item.src} alt={item.alt} />
                        )}
                      </div>
                      <div className="traditional-gallery-list-content">
                        <div className="traditional-gallery-list-header">
                          <h4>{item.title}</h4>
                          <div className="traditional-gallery-list-type">
                            <FontAwesomeIcon icon={item.type === 'video' ? faVideo : faCamera} />
                            {getMediaTypeLabel(item.type)}
                          </div>
                        </div>
                        <p>{item.description}</p>
                        <div className="traditional-gallery-list-meta">
                          <span className="traditional-gallery-list-date">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            {formatDate(item.date)}
                          </span>
                          {item.duration && (
                            <span className="traditional-gallery-list-duration">
                              <FontAwesomeIcon icon={faPlay} />
                              {item.duration}
                            </span>
                          )}
                          <span className="traditional-gallery-list-category">
                            <FontAwesomeIcon icon={faTag} />
                            {categories.find(c => c.id === item.category)?.label || item.category}
                          </span>
                        </div>
                      </div>
                      <div className="traditional-gallery-list-actions">
                        <button 
                          className="traditional-gallery-list-btn view"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(item, index);
                          }}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button 
                          className="traditional-gallery-list-btn download"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(item);
                          }}
                        >
                          <FontAwesomeIcon icon={faDownload} />
                        </button>
                        <button 
                          className="traditional-gallery-list-btn share"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(item);
                          }}
                        >
                          <FontAwesomeIcon icon={faShare} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="traditional-gallery-no-results">
              <FontAwesomeIcon icon={faImages} />
              <h3>{t('clubs.TraditionalGallery.noResults.title')}</h3>
              <p>{t('clubs.TraditionalGallery.noResults.subtitle')}</p>
              <button 
                className="traditional-gallery-clear-btn"
                onClick={clearFilters}
              >
                {t('clubs.TraditionalGallery.noResults.clearFilters')}
              </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && currentItem && (
        <div className="traditional-gallery-modal">
          <div className="traditional-gallery-modal-overlay" onClick={closeModal}></div>
          <div className="traditional-gallery-modal-container">
            <button className="traditional-gallery-modal-close" onClick={closeModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            {filteredItems.length > 1 && (
              <>
                <button 
                  className="traditional-gallery-modal-nav prev"
                  onClick={() => navigateItem('prev')}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button 
                  className="traditional-gallery-modal-nav next"
                  onClick={() => navigateItem('next')}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </>
            )}
            
            <div className="traditional-gallery-modal-content">
              <div className="traditional-gallery-modal-media">
                {currentItem.type === 'video' ? (
                  <video 
                    controls 
                    autoPlay
                    width="100%"
                    poster={currentItem.thumbnail}
                  >
                    <source src={currentItem.src} type="video/mp4" />
                    {t('clubs.TraditionalGallery.modal.videoNotSupported')}
                  </video>
                ) : (
                  <img src={currentItem.src} alt={currentItem.alt} />
                )}
              </div>
              
              <div className="traditional-gallery-modal-info">
                <div className="traditional-gallery-modal-header">
                  <h3>{currentItem.title}</h3>
                  <div className="traditional-gallery-modal-type">
                    <FontAwesomeIcon icon={currentItem.type === 'video' ? faVideo : faCamera} />
                    {getMediaTypeLabel(currentItem.type)}
                  </div>
                </div>
                
                {currentItem.description && (
                  <p className="traditional-gallery-modal-description">{currentItem.description}</p>
                )}
                
                <div className="traditional-gallery-modal-meta">
                  <span className="traditional-gallery-modal-date">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    {formatDate(currentItem.date)}
                  </span>
                  {currentItem.duration && (
                    <span className="traditional-gallery-modal-duration">
                      <FontAwesomeIcon icon={faPlay} />
                      {currentItem.duration}
                    </span>
                  )}
                  <span className="traditional-gallery-modal-category">
                    <FontAwesomeIcon icon={faTag} />
                    {categories.find(c => c.id === currentItem.category)?.label || currentItem.category}
                  </span>
                </div>
                
                <div className="traditional-gallery-modal-actions">
                  <button 
                    className="traditional-gallery-modal-btn primary"
                    onClick={() => handleDownload(currentItem)}
                  >
                    <FontAwesomeIcon icon={faDownload} />
                    {t('clubs.TraditionalGallery.modal.download')}
                  </button>
                  <button 
                    className="traditional-gallery-modal-btn secondary"
                    onClick={() => handleShare(currentItem)}
                  >
                    <FontAwesomeIcon icon={faShare} />
                    {t('clubs.TraditionalGallery.modal.share')}
                  </button>
                </div>
                
                {filteredItems.length > 1 && (
                  <div className="traditional-gallery-modal-counter">
                    {t('clubs.TraditionalGallery.modal.counter', { 
                      current: currentIndex + 1, 
                      total: filteredItems.length 
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TraditionalGallery;