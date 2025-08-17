


import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faEye, faDownload, faBookmark } from '@fortawesome/free-solid-svg-icons';
import './publicationCard.css';

export const PublicationCard = ({ publication, isFeatured = false, index }) => {
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryTranslation = (categoryKey) => {
    if (!categoryKey) return t('publications.categories.other');

    const translationKey = `publications.categories.${categoryKey}`;
    const translation = t(translationKey);

    if (translation === translationKey) {
      return categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
    }

    return translation;
  };

  const getDefaultImage = () => {
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1e293b"/>
        <text x="50%" y="50%" font-family="Arial" font-size="18" fill="#64748b" text-anchor="middle" dy=".3em">
          ${t('publications.preview.noImageAvailable')}
        </text>
      </svg>
    `)}`;
  };

  if (isFeatured) {
    return (
      <div className="publication-card featured">
        <div className="publication-card-image">
          <img
            src={publication.image?.src || getDefaultImage()}
            alt={publication.image?.alt || publication.title}
            onError={(e) => {
              e.target.src = getDefaultImage();
            }}
          />
          <div className="publication-card-overlay">
            <span className="publication-card-category">
              {getCategoryTranslation(publication.category)}
            </span>
          </div>
        </div>
        <div className="publication-card-content">
          <div className="publication-card-meta">
            <span className="publication-card-date">
              {formatDate(publication.publishedAt)}
            </span>
            {publication.readTime && (
              <span className="publication-card-read-time">
                <FontAwesomeIcon icon={faClock} />
                {publication.readTime}
              </span>
            )}
          </div>
          <h2 className="publication-card-title">
            <Link to={`/publications/${publication.slug}`}>
              {publication.title}
            </Link>
          </h2>
          <p className="publication-card-description">
            {publication.shortDescription}
          </p>
          <div className="publication-card-stats">
            {publication.views !== undefined && (
              <span className="publication-card-stat">
                <FontAwesomeIcon icon={faEye} />
                {publication.views}
              </span>
            )}
            {publication.downloads !== undefined && (
              <span className="publication-card-stat">
                <FontAwesomeIcon icon={faDownload} />
                {publication.downloads}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="publication-card">
      <div className="publication-card-image">
        <img
          src={publication.image?.src || getDefaultImage()}
          alt={publication.image?.alt || publication.title}
          onError={(e) => {
            e.target.src = getDefaultImage();
          }}
        />
        <div className="publication-card-overlay">
          <span className="publication-card-category">
            {getCategoryTranslation(publication.category)}
          </span>
        </div>
      </div>
      <div className="publication-card-content">
        <div className="publication-card-meta">
          <span className="publication-card-date">
            {formatDate(publication.publishedAt)}
          </span>
          {publication.readTime && (
            <span className="publication-card-read-time">
              <FontAwesomeIcon icon={faClock} />
              {publication.readTime}
            </span>
          )}
        </div>
        <h3 className="publication-card-title">
          <Link to={`/publications/${publication.slug}`}>
            {publication.title}
          </Link>
        </h3>
        <p className="publication-card-description">
          {publication.shortDescription}
        </p>
        <div className="publication-card-stats">
          {publication.views !== undefined && (
            <span className="publication-card-stat">
              <FontAwesomeIcon icon={faEye} />
              {publication.views}
            </span>
          )}
          {publication.downloads !== undefined && (
            <span className="publication-card-stat">
              <FontAwesomeIcon icon={faDownload} />
              {publication.downloads}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
