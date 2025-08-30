// src/components/Profile/MyClubs/components/MyClubsCard.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faEdit,
  faUsers,
  faMapMarkerAlt,
  faCalendarAlt,
  faCheckCircle,
  faClock,
  faExclamationTriangle,
  faHeart,
  faEllipsisV
} from '@fortawesome/free-solid-svg-icons';
import './myClubsCard.css';

const MyClubsCard = ({ club, onView, onEdit, isOwner }) => {
  const { t } = useTranslation();

  const getStatusConfig = (status) => {
    const configs = {
      active: {
        label: t('profile.clubs.status.active'),
        icon: faCheckCircle,
        className: 'myclubscard-status--active'
      },
      inactive: {
        label: t('profile.clubs.status.inactive'),
        icon: faClock,
        className: 'myclubscard-status--inactive'
      },
      draft: {
        label: t('profile.clubs.status.draft'),
        icon: faExclamationTriangle,
        className: 'myclubscard-status--draft'
      }
    };
    return configs[status] || configs.draft;
  };

  const getCategoryConfig = (category) => {
    const configs = {
      general: {
        label: t('profile.clubs.categories.general'),
        className: 'myclubscard-category--general'
      },
      cultural: {
        label: t('profile.clubs.categories.cultural'),
        className: 'myclubscard-category--cultural'
      },
      traditional: {
        label: t('profile.clubs.categories.traditional'),
        className: 'myclubscard-category--traditional'
      },
      social: {
        label: t('profile.clubs.categories.social'),
        className: 'myclubscard-category--social'
      },
      sports: {
        label: t('profile.clubs.categories.sports'),
        className: 'myclubscard-category--sports'
      }
    };
    return configs[category] || configs.general;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bg-BG');
    } catch (e) {
      return '';
    }
  };

  const statusConfig = getStatusConfig(club.status);
  const categoryConfig = getCategoryConfig(club.category);

  return (
    <div className="myclubscard-wrapper">
      <div className="myclubscard-container">
        {/* Header Image */}
        <div className="myclubscard-header">
          <div className="myclubscard-image-container">
            <img
              src={club.mainImage || club.logo || '/images/placeholder-club.jpg'}
              alt={club.name}
              className="myclubscard-image"
              onError={(e) => {
                e.target.src = '/images/placeholder-club.jpg';
              }}
            />
            <div className="myclubscard-overlay">
              <div className="myclubscard-actions">
                <button
                  className="myclubscard-action-btn myclubscard-action-btn--primary"
                  onClick={() => onView(club)}
                  title={t('profile.clubs.actions.view')}
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
                {isOwner && (
                  <button
                    className="myclubscard-action-btn myclubscard-action-btn--secondary"
                    onClick={() => onEdit(club)}
                    title={t('profile.clubs.actions.edit')}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`myclubscard-status ${statusConfig.className}`}>
            <FontAwesomeIcon icon={statusConfig.icon} />
            <span>{statusConfig.label}</span>
          </div>
        </div>

        {/* Content */}
        <div className="myclubscard-content">
          {/* Title and Category */}
          <div className="myclubscard-title-section">
            <h3 className="myclubscard-title">{club.name}</h3>
            <span className={`myclubscard-category ${categoryConfig.className}`}>
              {categoryConfig.label}
            </span>
          </div>

          {/* Description */}
          <p className="myclubscard-description">
            {club.shortDescription || club.fullDescription?.substring(0, 120) + '...' || t('profile.clubs.noDescription')}
          </p>

          {/* Meta Information */}
          <div className="myclubscard-meta">
            {club.location?.city && (
              <div className="myclubscard-meta-item">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="myclubscard-meta-icon" />
                <span>{club.location.city}</span>
              </div>
            )}

            {club.membership?.totalMembers > 0 && (
              <div className="myclubscard-meta-item">
                <FontAwesomeIcon icon={faUsers} className="myclubscard-meta-icon" />
                <span>{club.membership.totalMembers} {t('profile.clubs.members')}</span>
              </div>
            )}

            {(club.metadata?.createdAt || club.createdAt) && (
              <div className="myclubscard-meta-item">
                <FontAwesomeIcon icon={faCalendarAlt} className="myclubscard-meta-icon" />
                <span>{formatDate(club.metadata?.createdAt || club.createdAt)}</span>
              </div>
            )}
          </div>

          {/* Footer Stats */}
          <div className="myclubscard-footer">
            <div className="myclubscard-stats">
              <div className="myclubscard-stat">
                <span className="myclubscard-stat-value">{club.metadata?.views || 0}</span>
                <span className="myclubscard-stat-label">{t('profile.clubs.views')}</span>
              </div>
              
              <div className="myclubscard-stat">
                <span className="myclubscard-stat-value">{club.membership?.totalMembers || 0}</span>
                <span className="myclubscard-stat-label">{t('profile.clubs.members')}</span>
              </div>

              <div className="myclubscard-stat">
                <span className="myclubscard-stat-value">{club.activities?.events?.length || 0}</span>
                <span className="myclubscard-stat-label">{t('profile.clubs.events')}</span>
              </div>
            </div>

            {/* Last Updated */}
            {(club.metadata?.updatedAt || club.updatedAt) && (
              <div className="myclubscard-last-updated">
                <span>{t('profile.clubs.lastUpdated')}: {formatDate(club.metadata?.updatedAt || club.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyClubsCard;