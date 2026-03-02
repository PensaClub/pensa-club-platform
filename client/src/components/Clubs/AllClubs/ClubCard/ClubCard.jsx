import { useState } from 'react';
import { useLocalizedNavigate } from '../../../../hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
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
import { useClubContext } from '../../../contexts/ClubContext';
import { useAuthContext } from '../../../contexts/UserContext';
export const ClubCard = ({ club, index, isSelected, onSelect, onSelectOnMap }) => {
  const { t, i18n } = useTranslation('clubs');
  const navigate = useLocalizedNavigate();
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpeningMap, setIsOpeningMap] = useState(false);
  const {  isLoading, 
        toggleBookmarkClub,
        isBookmarkedClub} = useClubContext();
  const { isAuthentication } = useAuthContext();
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
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'en' ? 'en-US' : 
                   'de-DE';
    
    return new Date(dateString).toLocaleDateString(locale, {
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
    return t(`clubs.ClubCard.categories.${category}`, { 
      defaultValue: t('clubs.ClubCard.categories.general') 
    });
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
    return t(`clubs.ClubCard.status.${status}`, { 
      defaultValue: status 
    });
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
  const chairman = club.management?.board?.find(member => 
    member.role?.toLowerCase().includes('председател') || 
    member.role?.toLowerCase().includes('president') || 
    member.role?.toLowerCase().includes('präsident')
  );

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
              <span>{t('clubs.ClubCard.image.noImage')}</span>
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
                title={t('clubs.ClubCard.actions.showOnMap')}
                disabled={isOpeningMap}
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} />
              </button>
               {isAuthentication && (
              <button 
                className={`club-card-favorite-btn ${isBookmarkedClub(club.id) ? 'favorited' : ''}`}
                title={t('clubs.ClubCard.actions.addToFavorites')}
                onClick={() => toggleBookmarkClub(club.id)}
              >
                <FontAwesomeIcon icon={faHeart} />
              </button>
                )}
            </div>
          </div>

          {/* Статистики под снимката */}
          <div className="club-card-stats">
            <div className="club-card-stat">
              <FontAwesomeIcon icon={faUsers} className="club-card-stat-icon" />
              <span className="club-card-stat-value">{club.membership?.totalMembers || 0}</span>
              <span className="club-card-stat-label">{t('clubs.ClubCard.stats.members')}</span>
            </div>
            <div className="club-card-stat">
              <FontAwesomeIcon icon={faCalendarAlt} className="club-card-stat-icon" />
              <span className="club-card-stat-value">{club.activities?.regular?.length || 0}</span>
              <span className="club-card-stat-label">{t('clubs.ClubCard.stats.activities')}</span>
            </div>
            <div className="club-card-stat">
              <FontAwesomeIcon icon={faEye} className="club-card-stat-icon" />
              <span className="club-card-stat-value">{club.metadata?.views || 0}</span>
              <span className="club-card-stat-label">{t('clubs.ClubCard.stats.views')}</span>
            </div>
          </div>
        </div>

        {/* Съдържание */}
        <div className={`club-card-content ${isEven ? 'club-card-content-right' : 'club-card-content-left'}`}>
          
          {/* Header */}
          <div className="club-card-header">
            <h3 className="club-card-title">{club.name}</h3>
            {club.metadata?.rating && (
              <div className="club-card-rating">
                <div className="club-card-stars">
                  {renderStars(club.metadata.rating)}
                </div>
                <span className="club-card-rating-value">{club.metadata.rating}</span>
              </div>
            )}
          </div>

          {/* Локация */}
          {club.location && (
            <div className="club-card-location">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="club-card-location-icon" />
              <span>{club.location.address}, {club.location.city}</span>
            </div>
          )}

          {/* Описание */}
          <p className="club-card-description">
            {club.shortDescription}
          </p>

          {/* Средна секция */}
          <div className="club-card-middle">
            {/* Популярни дейности */}
            {club.activities?.regular?.length > 0 && (
              <div className="club-card-activities">
                <h4 className="club-card-activities-title">
                  <FontAwesomeIcon icon={faMusic} />
                  {t('clubs.ClubCard.activities.title')}
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
                      {t('clubs.ClubCard.activities.moreActivities', { 
                        count: club.activities.regular.length - 2 
                      })}
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
                  <span className="club-card-chairman-role">{t('clubs.ClubCard.chairman.title')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="club-card-footer">
            <div className="club-card-contacts">
              {club.contacts?.phone && (
                <a 
                  href={`tel:${club.contacts.phone}`} 
                  className="club-card-contact-item"
                  onClick={(e) => e.stopPropagation()}
                  title={t('clubs.ClubCard.contacts.phone', { phone: club.contacts.phone })}
                >
                  <FontAwesomeIcon icon={faPhone} />
                </a>
              )}
              {club.contacts?.email && (
                <a 
                  href={`mailto:${club.contacts.email}`} 
                  className="club-card-contact-item"
                  onClick={(e) => e.stopPropagation()}
                  title={t('clubs.ClubCard.contacts.email', { email: club.contacts.email })}
                >
                  <FontAwesomeIcon icon={faEnvelope} />
                </a>
              )}
              {club.contacts?.website && (
                <a 
                  href={club.contacts.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="club-card-contact-item"
                  onClick={(e) => e.stopPropagation()}
                  title={t('clubs.ClubCard.contacts.website', { website: club.contacts.website })}
                >
                  <FontAwesomeIcon icon={faGlobe} />
                </a>
              )}
            </div>
            
            <div className="club-card-meta">
              <div className="club-card-founded">
                {t('clubs.ClubCard.founded')}: {club.foundedYear}
              </div>
              <button className="club-card-view-btn">
                <span>{t('clubs.ClubCard.actions.viewMore')}</span>
                <FontAwesomeIcon icon={faArrowRight} className="club-card-arrow" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};