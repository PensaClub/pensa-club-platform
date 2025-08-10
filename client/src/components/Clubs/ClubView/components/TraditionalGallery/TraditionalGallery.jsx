import { useState, useMemo } from 'react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');

  // Проверяваме дали има необходимите данни
  if (!club?.name) {
    return null;
  }

  // Извличаме САМО реални данни от клуба
  const gallery = club.gallery || [];
  const videos = club.media?.videos || [];
  const mainImage = club.mainImage;
  const events = club.activities?.events || [];
  const regularActivities = club.activities?.regular || [];

  // Подготвяме всички медийни елементи
  const allMediaItems = useMemo(() => {
    const items = [];

    // Добавяме главната снимка (ако има)
    if (mainImage) {
      items.push({
        id: 'main-image',
        src: mainImage,
        type: 'image',
        category: 'main',
        title: `Главна снимка на ${club.name}`,
        description: `Представителна снимка на ${club.name}`,
        date: new Date(),
        alt: `${club.name} - главна снимка`
      });
    }

    // Добавяме снимки от галерията
    gallery.forEach((imageSrc, index) => {
      items.push({
        id: `gallery-${index}`,
        src: imageSrc,
        type: 'image',
        category: 'gallery',
        title: `Снимка ${index + 1}`,
        description: `Снимка от дейностите на ${club.name}`,
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Случайна дата в последната година
        alt: `Снимка ${index + 1} от ${club.name}`
      });
    });

    // Добавяме видеа
    videos.forEach((video, index) => {
      items.push({
        id: `video-${index}`,
        src: video.src,
        thumbnail: video.thumbnail,
        type: 'video',
        category: 'video',
        title: video.caption || `Видео ${index + 1}`,
        description: video.alt || `Видео запис от ${club.name}`,
        duration: video.duration,
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        alt: video.alt || `Видео ${index + 1} от ${club.name}`,
        videoType: video.type
      });
    });

    // Сортираме по дата (най-новите първо)
    return items.sort((a, b) => b.date - a.date);
  }, [gallery, videos, mainImage, club.name]);

  // Извличаме категории от реалните данни
  const categories = useMemo(() => {
    const cats = [{ id: 'all', label: 'Всички', count: allMediaItems.length }];
    
    // Групираме по тип
    const typeCounts = allMediaItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    Object.entries(typeCounts).forEach(([category, count]) => {
      let label = category;
      if (category === 'main') label = 'Главна';
      else if (category === 'gallery') label = 'Галерия';
      else if (category === 'video') label = 'Видеа';
      
      cats.push({ id: category, label, count });
    });

    return cats;
  }, [allMediaItems]);

  // Филтрираме елементите
  const filteredItems = useMemo(() => {
    let filtered = allMediaItems;

    // Филтър по категория
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Филтър по търсене
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.alt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [allMediaItems, selectedCategory, searchTerm]);

  // Проверяваме дали има РЕАЛНО съдържание за показване
  const hasGalleryContent = allMediaItems.length > 0;

  if (!hasGalleryContent) {
    return null;
  }

  // Modal функции
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

  // Download функция
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
      console.error('Грешка при изтегляне:', error);
      alert('Възникна грешка при изтеглянето');
    }
  };

  const handleShare = (item) => {
    const text = `${item.title} - ${club.name}`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: text,
        url: url
      });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      alert('Информацията е копирана в клипборда!');
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('bg-BG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <section id="traditional-gallery" className="traditional-gallery-main-section">
      <div className="traditional-gallery-container">
        
        {/* Header */}
        <div className="traditional-gallery-header">
          <div className="traditional-gallery-badge">
            <FontAwesomeIcon icon={faImages} />
            <span>Галерия</span>
          </div>
          <h2 className="traditional-gallery-title">Нашите спомени</h2>
          <p className="traditional-gallery-subtitle">
            Разгледайте снимки и видеа от нашите дейности и мероприятия
          </p>
        </div>

        <div className="traditional-gallery-main-content">
          
          {/* Controls */}
          <div className="traditional-gallery-controls">
            
            {/* Search */}
            <div className="traditional-gallery-search">
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder="Търсете в галерията..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
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

            {/* View Mode */}
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
                {filteredItems.length} елементи
              </div>
            </div>
          </div>

          {/* Gallery Content */}
          {filteredItems.length > 0 ? (
            <div className={`traditional-gallery-content ${viewMode}`}>
              
              {/* Grid View */}
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
                              {item.type === 'video' ? 'Видео' : 'Снимка'}
                            </div>
                            <div className="traditional-gallery-item-title">{item.title}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* List View */}
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
                            {item.type === 'video' ? 'Видео' : 'Снимка'}
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
              <h3>Няма намерени резултати</h3>
              <p>Опитайте с различни критерии за търсене</p>
              <button 
                className="traditional-gallery-clear-btn"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
              >
                Изчистете филтрите
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && currentItem && (
        <div className="traditional-gallery-modal">
          <div className="traditional-gallery-modal-overlay" onClick={closeModal}></div>
          <div className="traditional-gallery-modal-container">
            <button className="traditional-gallery-modal-close" onClick={closeModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            {/* Navigation */}
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
                    Вашият браузър не поддържа video елемента.
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
                    {currentItem.type === 'video' ? 'Видео' : 'Снимка'}
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
                    Изтегли
                  </button>
                  <button 
                    className="traditional-gallery-modal-btn secondary"
                    onClick={() => handleShare(currentItem)}
                  >
                    <FontAwesomeIcon icon={faShare} />
                    Сподели
                  </button>
                </div>
                
                {filteredItems.length > 1 && (
                  <div className="traditional-gallery-modal-counter">
                    {currentIndex + 1} от {filteredItems.length}
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