import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation('clubs');
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!club?.name) {
    return null;
  }

  const gallery = club.gallery || [];
  const allEvents = club.activities?.events || [];
  const awards = club.achievements?.awards || [];

  const costumeEvents = allEvents.filter(event =>
    event.title?.toLowerCase().includes('носи') ||
    event.title?.toLowerCase().includes('костюм') ||
    event.title?.toLowerCase().includes('традицион') ||
    event.description?.toLowerCase().includes('носи') ||
    event.type === 'traditional'
  );

  const costumeAwards = awards.filter(award =>
    award.name?.toLowerCase().includes('традицион') ||
    award.name?.toLowerCase().includes('носи') ||
    award.name?.toLowerCase().includes('костюм') ||
    award.name?.toLowerCase().includes('фолклор') ||
    award.name?.toLowerCase().includes('култур')
  );

  const hasCostumeContent = 
    gallery.length > 0 ||
    costumeEvents.length > 0 ||
    costumeAwards.length > 0;

  if (!hasCostumeContent) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'de' ? 'de-DE' : 'en-US';
    return date.toLocaleDateString(locale, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

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
      console.error('Download error:', error);
      alert(t('clubs.TraditionalCostumes.messages.downloadError'));
    }
  };

  const handleShare = (item) => {
    const text = item?.title || club.name;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: text,
        text: item?.description || t('clubs.TraditionalCostumes.messages.galleryFrom', { clubName: club.name }),
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert(t('clubs.TraditionalCostumes.messages.linkCopied'));
    }
  };

  return (
    <section id="traditional-costumes" className="traditional-costumes-main-section">
      <div className="traditional-costumes-container">
        
        <div className="traditional-costumes-header">
          <div className="traditional-costumes-badge">
            <FontAwesomeIcon icon={faTshirt} />
            <span>{t('clubs.TraditionalCostumes.header.badge')}</span>
          </div>
          <h2 className="traditional-costumes-title">{t('clubs.TraditionalCostumes.header.title')}</h2>
          <p className="traditional-costumes-subtitle">
            {t('clubs.TraditionalCostumes.header.subtitle')}
          </p>
        </div>

        <div className="traditional-costumes-main-grid">
          
          {gallery.length > 0 && (
            <div className="traditional-costumes-section">
              <div className="traditional-costumes-section-header">
                <FontAwesomeIcon icon={faImages} />
                <h3>{t('clubs.TraditionalCostumes.gallery.title')}</h3>
                <p>{t('clubs.TraditionalCostumes.gallery.subtitle')}</p>
              </div>
              
              <div className="traditional-costumes-gallery">
                {gallery.map((imageSrc, index) => (
                  <div key={index} className="traditional-costumes-gallery-item">
                    <div className="traditional-costumes-image-container">
                      <img 
                        src={imageSrc} 
                        alt={t('clubs.TraditionalCostumes.gallery.imageAlt', { 
                          index: index + 1, 
                          clubName: club.name 
                        })} 
                      />
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

          {costumeEvents.length > 0 && (
            <div className="traditional-costumes-section">
              <div className="traditional-costumes-section-header">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <h3>{t('clubs.TraditionalCostumes.events.title')}</h3>
                <p>{t('clubs.TraditionalCostumes.events.subtitle')}</p>
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
                        {event.time && t('clubs.TraditionalCostumes.events.timeAt', { time: event.time })}
                      </div>
                      {event.description && (
                        <p>{event.description}</p>
                      )}
                      <div className="traditional-costumes-event-meta">
                        {event.participants && (
                          <span className="traditional-costumes-event-participants">
                            <FontAwesomeIcon icon={faUsers} />
                            {t('clubs.TraditionalCostumes.events.participants', { count: event.participants })}
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

          {costumeAwards.length > 0 && (
            <div className="traditional-costumes-section">
              <div className="traditional-costumes-section-header">
                <FontAwesomeIcon icon={faAward} />
                <h3>{t('clubs.TraditionalCostumes.awards.title')}</h3>
                <p>{t('clubs.TraditionalCostumes.awards.subtitle')}</p>
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

      {isGalleryModalOpen && currentImage && (
        <div className="traditional-costumes-gallery-modal">
          <div className="traditional-costumes-gallery-modal-overlay" onClick={closeGallery}></div>
          <div className="traditional-costumes-gallery-modal-container">
            <button className="traditional-costumes-gallery-modal-close" onClick={closeGallery}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
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
              <img 
                src={currentImage} 
                alt={t('clubs.TraditionalCostumes.galleryModal.imageAlt', { clubName: club.name })} 
              />
            </div>
            
            <div className="traditional-costumes-gallery-modal-info">
              <h3>{t('clubs.TraditionalCostumes.galleryModal.title', { clubName: club.name })}</h3>
              <div className="traditional-costumes-gallery-modal-actions">
                <button 
                  className="traditional-costumes-modal-btn primary"
                  onClick={() => handleImageDownload(currentImage)}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  {t('clubs.TraditionalCostumes.galleryModal.download')}
                </button>
                <button 
                  className="traditional-costumes-modal-btn secondary"
                  onClick={() => handleShare({ title: t('clubs.TraditionalCostumes.galleryModal.shareTitle', { clubName: club.name }) })}
                >
                  <FontAwesomeIcon icon={faShare} />
                  {t('clubs.TraditionalCostumes.galleryModal.share')}
                </button>
              </div>
              {gallery.length > 1 && (
                <div className="traditional-costumes-gallery-counter">
                  {t('clubs.TraditionalCostumes.galleryModal.counter', { 
                    current: currentImageIndex + 1, 
                    total: gallery.length 
                  })}
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