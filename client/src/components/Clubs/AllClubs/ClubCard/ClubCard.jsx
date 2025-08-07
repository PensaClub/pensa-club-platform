// components/Clubs/AllClubs/ClubCard/ClubCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faMapMarkerAlt, 
  faStar,
  faCalendarAlt,
  faEye,
  faHeart,
  faArrowRight,
  faPhone,
  faEnvelope,
  faGlobe,
  faMusic,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';
import './clubCard.css';

export const ClubCard = ({ club, index, isSelected, onSelect, onSelectOnMap }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpeningMap, setIsOpeningMap] = useState(false);
  
  const isEven = index % 2 === 0;
  
  const handleCardClick = () => {
    navigate(`/clubs/${club.slug}`);
  };

  const handleSelectClick = (e) => {
    e.stopPropagation();
    onSelect();
  };

  // Нова функция за показване на картата
  const handleShowOnMap = (e) => {
    e.stopPropagation();
    setIsOpeningMap(true);
    
    if (onSelectOnMap) {
      onSelectOnMap();
      
      // Премахваме loading state след 1 секунда
      setTimeout(() => {
        setIsOpeningMap(false);
      }, 1000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'cultural': '#3182ce',
      'general': '#4a5568', 
      'sports': '#38a169',
      'educational': '#805ad5',
      'traditional': '#d97706'
    };
    return colors[category] || '#4a5568';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'cultural': 'Културен',
      'general': 'Общ',
      'sports': 'Спортен', 
      'educational': 'Образователен',
      'traditional': 'Традиционен'
    };
    return labels[category] || category;
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': '#38a169',
      'inactive': '#718096',
      'suspended': '#e53e3e'
    };
    return colors[status] || '#718096';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'active': 'Активен',
      'inactive': 'Неактивен',
      'suspended': 'Спрян'
    };
    return labels[status] || status;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesomeIcon key={i} icon={faStar} className="club-card-star filled" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <FontAwesomeIcon key="half" icon={faStar} className="club-card-star half" />
      );
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <FontAwesomeIcon key={`empty-${i}`} icon={faStar} className="club-card-star empty" />
      );
    }
    
    return stars;
  };

  // Намираме председателя
  const chairman = club.management.board.find(member => member.role === 'председател');

  return (
    <div 
      className={`club-card ${isEven ? 'club-card-left' : 'club-card-right'} ${isSelected ? 'club-card-selected' : ''} ${isHovered ? 'club-card-hovered' : ''}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="club-card-container">
        
        {/* Изображение с статистики */}
        <div className={`club-card-image-section ${isEven ? 'club-card-image-left' : 'club-card-image-right'}`}>
          <div className="club-card-image-wrapper">
            <img 
              src={club.mainImage || club.logo}
              alt={club.name}
              className={`club-card-image ${imageLoaded ? 'loaded' : ''}`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="club-card-image-placeholder" style={{ display: 'none' }}>
              <FontAwesomeIcon icon={faUsers} />
              <span>Няма изображение</span>
            </div>
            
            {/* Overlay информация */}
            <div className="club-card-image-overlay">
              <div className="club-card-status-badge" style={{ backgroundColor: getStatusColor(club.status) }}>
                {getStatusLabel(club.status)}
              </div>
              <div className="club-card-category-badge" style={{ backgroundColor: getCategoryColor(club.category) }}>
                {getCategoryLabel(club.category)}
              </div>
            </div>

            {/* Hover actions */}
            <div className="club-card-image-actions">
              <button 
                className={`club-card-select-btn ${isOpeningMap ? 'map-opening' : ''}`}
                onClick={handleShowOnMap}
                title="Покажи на картата"
                disabled={isOpeningMap}
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} />
              </button>
              <button 
                className="club-card-favorite-btn" 
                title="Добави в любими"
                onClick={handleSelectClick}
              >
                <FontAwesomeIcon icon={faHeart} />
              </button>
            </div>
          </div>

          {/* Статистики под снимката */}
          <div className="club-card-stats">
            <div className="club-card-stat">
              <FontAwesomeIcon icon={faUsers} className="club-card-stat-icon" />
              <span className="club-card-stat-value">{club.membership.totalMembers}</span>
              <span className="club-card-stat-label">членове</span>
            </div>
            <div className="club-card-stat">
              <FontAwesomeIcon icon={faCalendarAlt} className="club-card-stat-icon" />
              <span className="club-card-stat-value">{club.activities.regular.length}</span>
              <span className="club-card-stat-label">дейности</span>
            </div>
            <div className="club-card-stat">
              <FontAwesomeIcon icon={faEye} className="club-card-stat-icon" />
              <span className="club-card-stat-value">{club.metadata.views}</span>
              <span className="club-card-stat-label">прегледи</span>
            </div>
          </div>
        </div>

        {/* Съдържание */}
        <div className={`club-card-content ${isEven ? 'club-card-content-right' : 'club-card-content-left'}`}>
          
          {/* Header */}
          <div className="club-card-header">
            <h3 className="club-card-title">{club.name}</h3>
            <div className="club-card-rating">
              <div className="club-card-stars">
                {renderStars(club.metadata.rating)}
              </div>
              <span className="club-card-rating-value">{club.metadata.rating}</span>
            </div>
          </div>

          {/* Локация */}
          <div className="club-card-location">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="club-card-location-icon" />
            <span>{club.location.address}, {club.location.city}</span>
          </div>

          {/* Описание */}
          <p className="club-card-description">
            {club.shortDescription}
          </p>

          {/* Средна секция */}
          <div className="club-card-middle">
            {/* Популярни дейности */}
            {club.activities.regular.length > 0 && (
              <div className="club-card-activities">
                <h4 className="club-card-activities-title">
                  <FontAwesomeIcon icon={faMusic} />
                  Популярни дейности
                </h4>
                <div className="club-card-activities-list">
                  {club.activities.regular.slice(0, 2).map((activity, idx) => (
                    <div key={idx} className="club-card-activity">
                      <span className="club-card-activity-name">{activity.name}</span>
                      <span className="club-card-activity-time">{activity.day}, {activity.time}</span>
                    </div>
                  ))}
                  {club.activities.regular.length > 2 && (
                    <div className="club-card-activities-more">
                      +{club.activities.regular.length - 2} още дейности
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Председател */}
            {chairman && (
              <div className="club-card-chairman">
                <FontAwesomeIcon icon={faUserTie} className="club-card-chairman-icon" />
                <div className="club-card-chairman-info">
                  <span className="club-card-chairman-name">
                    {chairman.name}
                  </span>
                  <span className="club-card-chairman-role">Председател</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="club-card-footer">
            <div className="club-card-contacts">
              {club.contacts.phone && (
                <a 
                  href={`tel:${club.contacts.phone}`} 
                  className="club-card-contact-item"
                  onClick={(e) => e.stopPropagation()}
                  title={`Обади се: ${club.contacts.phone}`}
                >
                  <FontAwesomeIcon icon={faPhone} />
                </a>
              )}
              {club.contacts.email && (
                <a 
                  href={`mailto:${club.contacts.email}`} 
                  className="club-card-contact-item"
                  onClick={(e) => e.stopPropagation()}
                  title={`Изпрати имейл: ${club.contacts.email}`}
                >
                  <FontAwesomeIcon icon={faEnvelope} />
                </a>
              )}
              {club.contacts.website && (
                <a 
                  href={club.contacts.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="club-card-contact-item"
                  onClick={(e) => e.stopPropagation()}
                  title={`Посети сайт: ${club.contacts.website}`}
                >
                  <FontAwesomeIcon icon={faGlobe} />
                </a>
              )}
            </div>
            
            <div className="club-card-meta">
              <div className="club-card-founded">
                Основан: {club.foundedYear}
              </div>
              <button className="club-card-view-btn">
                <span>Виж повече</span>
                <FontAwesomeIcon icon={faArrowRight} className="club-card-arrow" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};