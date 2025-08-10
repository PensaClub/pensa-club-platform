import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faCalendarAlt, 
  faStar,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faGlobe,
  faChevronLeft,
  faChevronRight,
  faPlay
} from '@fortawesome/free-solid-svg-icons';
import { faFacebook } from '@fortawesome/free-brands-svg-icons'; // Тук е поправката
import './clubHero.css';

export const ClubHero = ({ club }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const images = club.gallery && club.gallery.length > 0 
    ? club.gallery 
    : club.mainImage 
      ? [club.mainImage] 
      : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'cultural': 'Културен клуб',
      'sports': 'Спортен клуб',
      'traditional': 'Традиционен клуб',
      'social': 'Социален клуб',
      'educational': 'Образователен клуб',
      'active': 'Активен клуб',
      'general': 'Клуб на пенсионера'
    };
    return labels[category] || 'Клуб на пенсионера';
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={i} icon={faStar} className="star filled" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FontAwesomeIcon key="half" icon={faStar} className="star half" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} className="star empty" />);
    }
    
    return stars;
  };

  return (
    <section id="club-hero" className="club-hero">
      <div className="club-hero-container">
        
        {/* Лява страна - Изображения */}
        <div className="club-hero-images">
          {images.length > 0 ? (
            <div className="hero-image-gallery">
              <div className="main-image-container">
                <img 
                  src={images[currentImageIndex]} 
                  alt={`${club.name} - снимка ${currentImageIndex + 1}`}
                  className="hero-main-image"
                  onError={() => setImageError(true)}
                />
                
                {images.length > 1 && (
                  <>
                    <button className="image-nav-btn prev" onClick={prevImage}>
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button className="image-nav-btn next" onClick={nextImage}>
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  </>
                )}
                
                <div className="image-overlay">
                  <div className="image-badges">
                    <span className="status-badge active">Активен</span>
                    <span className="category-badge">{getCategoryLabel(club.category)}</span>
                  </div>
                </div>
              </div>
              
              {images.length > 1 && (
                <div className="image-thumbnails">
                  {images.slice(0, 4).map((image, index) => (
                    <div 
                      key={index}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img src={image} alt={`Thumbnail ${index + 1}`} />
                      {images.length > 4 && index === 3 && (
                        <div className="more-images">+{images.length - 4}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Placeholder ако няма снимки
            <div className="hero-image-placeholder">
              <div className="placeholder-content">
                {club.logo && <img src={club.logo} alt={club.name} className="placeholder-logo" />}
                <FontAwesomeIcon icon={faUsers} className="placeholder-icon" />
                <p>Няма налични снимки</p>
              </div>
            </div>
          )}
        </div>

        {/* Дясна страна - Информация */}
        <div className="club-hero-info">
          <div className="hero-header">
            <div className="club-title-section">
              <h1 className="club-name">{club.name}</h1>
              <div className="club-rating">
                <div className="stars">
                  {renderStars(club.metadata.rating)}
                </div>
                <span className="rating-value">{club.metadata.rating}</span>
                <span className="rating-count">({club.metadata.views} прегледа)</span>
              </div>
            </div>
            
            {club.logo && (
              <div className="club-logo">
                <img src={club.logo} alt={`${club.name} лого`} />
              </div>
            )}
          </div>

          <div className="club-location-info">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <span>{club.location.address}, {club.location.city}</span>
          </div>

          <p className="club-description">{club.shortDescription}</p>

          {/* Статистики */}
          <div className="club-stats-grid">
            <div className="stat-item-clubview">
              <FontAwesomeIcon icon={faUsers} className="stat-icon" />
              <div className="stat-content">
                <div className="stat-value">{club.membership.totalMembers}</div>
                <div className="stat-label">Членове</div>
              </div>
            </div>
            
            <div className="stat-item-clubview">
              <FontAwesomeIcon icon={faCalendarAlt} className="stat-icon" />
              <div className="stat-content">
                <div className="stat-value">{new Date().getFullYear() - club.foundedYear}</div>
                <div className="stat-label">Години</div>
              </div>
            </div>
            
            <div className="stat-item-clubview">
              <FontAwesomeIcon icon={faPlay} className="stat-icon" />
              <div className="stat-content">
                <div className="stat-value">{club.activities.regular.length}</div>
                <div className="stat-label">Дейности</div>
              </div>
            </div>
          </div>

          {/* Бързи контакти */}
          <div className="quick-contacts">
            <h3>Бързи контакти</h3>
            <div className="contact-buttons-clubview">
              {club.contacts.phone && (
                <a href={`tel:${club.contacts.phone}`} className="contact-btn phone">
                  <FontAwesomeIcon icon={faPhone} />
                  <span>Обади се</span>
                </a>
              )}
              
              {club.contacts.email && (
                <a href={`mailto:${club.contacts.email}`} className="contact-btn email">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <span>Имейл</span>
                </a>
              )}
              
              {club.contacts.website && (
                <a href={`https://${club.contacts.website}`} target="_blank" rel="noopener noreferrer" className="contact-btn website">
                  <FontAwesomeIcon icon={faGlobe} />
                  <span>Сайт</span>
                </a>
              )}
              
              {club.contacts.socialMedia?.facebook && (
                <a href={`https://${club.contacts.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" className="contact-btn facebook">
                  <FontAwesomeIcon icon={faFacebook} />
                  <span>Facebook</span>
                </a>
              )}
            </div>
          </div>

          {/* Членски внос */}
          <div className="membership-info">
            <h3>Членство</h3>
            <div className="membership-fee">
              <span className="fee-amount">{club.membership.membershipFee.monthly} лв.</span>
              <span className="fee-period">месечно</span>
            </div>
            <div className="membership-benefits">
              {club.membership.benefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className="benefit-item">• {benefit}</div>
              ))}
              {club.membership.benefits.length > 3 && (
                <div className="more-benefits">+{club.membership.benefits.length - 3} още</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClubHero;