import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faEye,
  faImages,
  faVideo,
  faCalendarAlt,
  faUser,
  faLink,
  faExternalLinkAlt,
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import './singleArticleCard.css';
import { useAnalytics } from '../../../contexts/AnalyticsContext';
import { useArticleContext } from '../../../contexts/ArticleContext';

export const SingleArticleCard = ({ article }) => {
  const { getViewCount } = useAnalytics();
  const { deleteArticle } = useArticleContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('bg-BG', options);
  };

  const isExternalUrl = (url) => {
    if (!url) return false;
    if (url.includes('firebasestorage.googleapis.com')) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const getImageSource = () => {
    if (article.mainImage.type === 'video') {
      return article.mainImage.thumbnail;
    } else {
      return article.mainImage.sources[0] || '';
    }
  };

  const isExternalResource = isExternalUrl(getImageSource());

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    const plainText = text.replace(/<[^>]*>?/gm, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substr(0, maxLength) + '...';
  };

  const handleDelete = async () => {
    const success = await deleteArticle(article.id);
    if (success) {
      setShowDeleteConfirm(false);
    }
  };

  const toggleActive = (e) => {
    e.stopPropagation();
    setIsActive(!isActive);
  };

  return (
    <div
      className={`single-article-card ${isActive ? 'active' : ''}`}
      onClick={toggleActive}
    >
      <div className="article-image-container">
        <img
          src={getImageSource() || '/default-article-image.jpg'}
          alt={article.title}
          className="article-thumbnail"
        />

        <div className="article-badges">
          {article.mainImage.type === 'slider' && article.mainImage.sources.length > 1 && (
            <span className="article-badge slider-badge">
              <FontAwesomeIcon icon={faImages} />
              <span>{article.mainImage.sources.length} снимки</span>
            </span>
          )}

          {article.mainImage.type === 'video' && (
            <span className="article-badge video-badge">
              <FontAwesomeIcon icon={faVideo} />
              <span>Видео</span>
            </span>
          )}

          {isExternalResource && (
            <span className="article-badge external-badge">
              <FontAwesomeIcon icon={faExternalLinkAlt} />
              <span>Външен източник</span>
            </span>
          )}
        </div>

        {/* Бутони в долните ъгли - показват се само когато картата е активна */}
        {isActive && (
          <>
            <Link
              to={`/profile/article-edit/${article.id}`}
              className="article-card-edit-btn"
              onClick={(e) => e.stopPropagation()}
            >
              <FontAwesomeIcon icon={faEdit} />
              <span>Редактирай</span>
            </Link>

            <button
              className="article-card-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
              <span>Изтрий</span>
            </button>
          </>
        )}
      </div>

      <div className="article-content">
        <h3 className="article-title">{article.title}</h3>

        <div className="article-meta">
          <div className="meta-item">
            <FontAwesomeIcon icon={faUser} className="meta-icon" />
            <span>{article.author}</span>
          </div>

          <div className="meta-item">
            <FontAwesomeIcon icon={faCalendarAlt} className="meta-icon" />
            <span>{formatDate(article.publishDate)}</span>
          </div>

          <div className="meta-item views">
            <FontAwesomeIcon icon={faEye} className="meta-icon" />
            <span>{getViewCount(article.id)} прегледа</span>
          </div>
        </div>

        <p className="article-summary">{truncateText(article.summary, 120)}</p>

        <div className="article-footer">
          <div className="article-tags">
            {article.tags && article.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="article-tag">{tag}</span>
            ))}
            {article.tags && article.tags.length > 3 && (
              <span className="tag-more">+{article.tags.length - 3}</span>
            )}
          </div>

          <div className="article-links">
            <a
              href={`/articles/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="preview-link"
              onClick={(e) => e.stopPropagation()}
            >
              <FontAwesomeIcon icon={faLink} />
              <span>Преглед</span>
            </a>
          </div>
        </div>
      </div>

      {/* Модален прозорец за потвърждение на изтриването */}
      {showDeleteConfirm && (
        <div className="delete-modal-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="delete-modal">
            <h4>Потвърждение за изтриване</h4>
            <p>Сигурни ли сте, че искате да изтриете статията "{article.title}"?</p>
            <div className="delete-modal-buttons">
              <button className="cancel-button" onClick={() => setShowDeleteConfirm(false)}>Отказ</button>
              <button className="confirm-button" onClick={handleDelete}>Изтрий</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
