import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTshirt,
  faImages,
  faAward,
  faEye,
  faDownload,
  faTimes,
  faCalendarAlt,
  faMapMarkerAlt,
  faUsers,
  faShare
} from '@fortawesome/free-solid-svg-icons';
import './traditionalCostumes.css';

export const TraditionalCostumes = ({ club }) => {
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Проверяваме дали има необходимите данни
  if (!club?.name) {
    return null;
  }

  // Извличаме САМО реални данни от клуба
  const gallery = club.gallery || [];
  const allEvents = club.activities?.events || [];
  const awards = club.achievements?.awards || [];

  // Филтрираме събития свързани с носии/традиции САМО ако наистина има такива
  const costumeEvents = allEvents.filter(event =>
    event.title?.toLowerCase().includes('носи') ||
    event.title?.toLowerCase().includes('костюм') ||
    event.title?.toLowerCase().includes('традицион') ||
    event.description?.toLowerCase().includes('носи') ||
    event.type === 'traditional'
  );

  // Филтрираме награди за традиции/носии САМО ако наистина има такива
  const costumeAwards = awards.filter(award =>
    award.name?.toLowerCase().includes('традицион') ||
    award.name?.toLowerCase().includes('носи') ||
    award.name?.toLowerCase().includes('костюм') ||
    award.name?.toLowerCase().includes('фолклор') ||
    award.name?.toLowerCase().includes('култур')
  );

  // Проверяваме дали има РЕАЛНО съдържание за показване
  const hasCostumeContent = 
    gallery.length > 0 ||
    costumeEvents.length > 0 ||
    costumeAwards.length > 0;

  if (!hasCostumeContent) {
    return null;
  }

  // Функции за галерия
  const openGallery = (image, index) => {
    setCurrentImage(image);
    setCurrentImageIndex(index);
    setIsGalleryModalOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryModalOpen(false);
    setCurrentImage(null);
    setCurrentImageIndex(0);
  };

  const navigateImage = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentImageIndex + 1) % gallery.length
      : (currentImageIndex - 1 + gallery.length) % gallery.length;
    
    setCurrentImageIndex(newIndex);
    setCurrentImage(gallery[newIndex]);
  };

  const handleImageDownload = async (imageSrc) => {
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Грешка при изтегляне:', error);
      alert('Възникна грешка при изтеглянето на изображението');
    }
  };

  const handleShare = (item) => {
    const text = item?.title || club.name;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: text,
        text: item?.description || `Галерия от ${club.name}`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Линкът е копиран в клипборда!');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <section id="traditional-costumes" className="traditional-costumes-main-section">
      <div className="traditional-costumes-container">
        
        {/* Header - показва се само ако има съдържание */}
        <div className="traditional-costumes-header">
          <div className="traditional-costumes-badge">
            <FontAwesomeIcon icon={faTshirt} />
            <span>Традиции и носии</span>
          </div>
          <h2 className="traditional-costumes-title">Нашето културно наследство</h2>
          <p className="traditional-costumes-subtitle">
            Съхраняваме и представяме традициите на българската култура
          </p>
        </div>

        <div className="traditional-costumes-main-grid">
          
          {/* Gallery - показва се САМО ако има снимки */}
          {gallery.length > 0 && (
            <div className="traditional-costumes-section">
              <div className="traditional-costumes-section-header">
                <FontAwesomeIcon icon={faImages} />
                <h3>Галерия</h3>
                <p>Снимки от нашите традиционни мероприятия и дейности</p>
              </div>
              
              <div className="traditional-costumes-gallery">
                {gallery.map((imageSrc, index) => (
                  <div key={index} className="traditional-costumes-gallery-item">
                    <div className="traditional-costumes-image-container">
                      <img src={imageSrc} alt={`Снимка ${index + 1} от ${club.name}`} />
                      <div className="traditional-costumes-image-overlay">
                        <button 
                          className="traditional-costumes-overlay-btn view"
                          onClick={() => openGallery(imageSrc, index)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button 
                          className="traditional-costumes-overlay-btn download"
                          onClick={() => handleImageDownload(imageSrc)}
                        >
                          <FontAwesomeIcon icon={faDownload} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Traditional Events - показва се САМО ако има традиционни събития */}
          {costumeEvents.length > 0 && (
            <div className="traditional-costumes-section">
              <div className="traditional-costumes-section-header">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <h3>Традиционни събития</h3>
                <p>Мероприятия свързани с нашите традиции</p>
              </div>
              
              <div className="traditional-costumes-events">
                {costumeEvents.map((event, index) => (
                  <div key={index} className="traditional-costumes-event-card">
                    <div className="traditional-costumes-event-icon">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                    </div>
                    <div className="traditional-costumes-event-content">
                      <h4>{event.title}</h4>
                      <div className="traditional-costumes-event-date">
                        {formatDate(event.date)}
                        {event.time && ` в ${event.time}`}
                      </div>
                      {event.description && (
                        <p>{event.description}</p>
                      )}
                      <div className="traditional-costumes-event-meta">
                        {event.participants && (
                          <span className="traditional-costumes-event-participants">
                            <FontAwesomeIcon icon={faUsers} />
                            {event.participants} участници
                          </span>
                        )}
                        <span className="traditional-costumes-event-type">{event.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awards - показва се САМО ако има награди за традиции */}
          {costumeAwards.length > 0 && (
            <div className="traditional-costumes-section">
              <div className="traditional-costumes-section-header">
                <FontAwesomeIcon icon={faAward} />
                <h3>Признания за традициите</h3>
                <p>Нашите постижения в областта на традиционната култура</p>
              </div>
              
              <div className="traditional-costumes-awards">
                {costumeAwards.map((award, index) => (
                  <div key={index} className="traditional-costumes-award-card">
                    <div className="traditional-costumes-award-icon">
                      <FontAwesomeIcon icon={faAward} />
                    </div>
                    <div className="traditional-costumes-award-content">
                      <h4>{award.name}</h4>
                      {award.description && <p>{award.description}</p>}
                      <div className="traditional-costumes-award-details">
                        {award.year && (
                          <span className="traditional-costumes-award-year">{award.year}</span>
                        )}
                        {award.awardedBy && (
                          <span className="traditional-costumes-award-by">{award.awardedBy}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ГАЛЕРИЯ МОДАЛ - показва се само при отваряне */}
      {isGalleryModalOpen && currentImage && (
        <div className="traditional-costumes-gallery-modal">
          <div className="traditional-costumes-gallery-modal-overlay" onClick={closeGallery}></div>
          <div className="traditional-costumes-gallery-modal-container">
            <button className="traditional-costumes-gallery-modal-close" onClick={closeGallery}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            {/* Navigation - показва се само ако има повече от 1 снимка */}
            {gallery.length > 1 && (
              <>
                <button 
                  className="traditional-costumes-gallery-nav prev"
                  onClick={() => navigateImage('prev')}
                >
                  ❮
                </button>
                <button 
                  className="traditional-costumes-gallery-nav next"
                  onClick={() => navigateImage('next')}
                >
                  ❯
                </button>
              </>
            )}
            
            <div className="traditional-costumes-gallery-image-container">
              <img src={currentImage} alt={`Снимка от ${club.name}`} />
            </div>
            
            <div className="traditional-costumes-gallery-modal-info">
              <h3>Снимка от {club.name}</h3>
              <div className="traditional-costumes-gallery-modal-actions">
                <button 
                  className="traditional-costumes-modal-btn primary"
                  onClick={() => handleImageDownload(currentImage)}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Изтегли
                </button>
                <button 
                  className="traditional-costumes-modal-btn secondary"
                  onClick={() => handleShare({ title: `Снимка от ${club.name}` })}
                >
                  <FontAwesomeIcon icon={faShare} />
                  Сподели
                </button>
              </div>
              {gallery.length > 1 && (
                <div className="traditional-costumes-gallery-counter">
                  {currentImageIndex + 1} от {gallery.length}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TraditionalCostumes;