import React, { useState, useEffect } from 'react';
import { LocalizedLink as Link } from '../../../../LocalizedLink/LocalizedLink';
import { useTranslation } from 'react-i18next';
import './publicationStoriesCard.css';
import { useAnalytics } from '../../../../contexts/AnalyticsContext';
import { ViewedPublicationsManager } from '../../../../../utils/viewedPublications';
import { ViewedStoriesManager } from '../../../../../utils/viewedStories';
import { getResizedUrl } from '../../../../../utils/firebaseImageResize';

export const PublicationStoriesCard = ({
  content,
  isFeatured = false,
  viewMode = 'standard',
  contentType = 'stories',
  index
}) => {
  const { t } = useTranslation('content');
  const {
    trackStoryOrPublication,
    getPublicationViewCount,
    getStoryViewCount
  } = useAnalytics();
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    const count = contentType === 'publications'
      ? getPublicationViewCount(content.id)
      : getStoryViewCount(content.id);
    setViewCount(count);
  }, [content.id, getPublicationViewCount, getStoryViewCount, contentType]);

  const handleCardClick = () => {
    // Track analytics
    trackStoryOrPublication(content.id, content.title, contentType === 'publications' ? 'publication' : 'story');

    // Add to viewed content
    if (contentType === 'publications') {
      ViewedPublicationsManager.addViewedPublication(content);
    } else {
      ViewedStoriesManager.addViewedStory(content);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text, limit) => {
    if (!text) return '';
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '...';
  };

  const getTextLimits = () => {
    switch (viewMode) {
      case 'featured':
        return { title: 100, description: 200 };
      case 'compact':
        return { title: 50, description: 100 };
      case 'list':
        return { title: 80, description: 150 };
      case 'standard':
      default:
        return { title: 60, description: 120 };
    }
  };

  const limits = getTextLimits();

  const getReadingTime = (content) => {
    if (contentType === 'publications') {
      return content.readTime || '5 мин';
    }
    if (!content.sections) return '5 мин';
    const totalWords = content.sections.reduce((total, section) => {
      return total + (section.content ? section.content.split(' ').length : 0);
    }, 0);
    const wordsPerMinute = 200;
    return `${Math.max(1, Math.ceil(totalWords / wordsPerMinute))} мин`;
  };

  const getImageSrc = () => {
    if (contentType === 'publications') {
      return content.image?.src;
    }
    return content.image?.src;
  };

  const getImageAlt = () => {
    if (contentType === 'publications') {
      return content.image?.alt || content.title;
    }
    return content.image?.alt || content.title;
  };

  const getCategory = () => {
    if (contentType === 'publications') {
      return content.category;
    }
    return content.category || 'История';
  };

  const getAuthor = () => {
    if (contentType === 'publications') {
      return content.author || content.userEmail;
    }
    return {
      name: content.author || 'Автор',
      email: content.authorEmail,
      avatar: content.authorImage
    };
  };

  const getLinkPath = () => {
    return `/${contentType}/${content.slug || content.id}`;
  };

  // 🔧 ОБНОВЕН cardClassName с поддръжка за list view
  const cardClassName = `ps-card-new ${viewMode} ${contentType}`;
  const author = getAuthor();

  return (
    <article className={cardClassName}>
      <Link
        to={getLinkPath()}
        className="ps-card-link"
        onClick={handleCardClick}
      >
        <div className="ps-card-image-wrapper">
          {getImageSrc() ? (
            (() => {
              const original = getImageSrc();
              return (
                <img
                  src={getResizedUrl(original, isFeatured ? 1200 : 600)}
                  alt={getImageAlt()}
                  className="ps-card-image"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (original && e.target.src !== original) e.target.src = original;
                  }}
                />
              );
            })()
          ) : (
            <div className="ps-card-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                {contentType === 'publications' ? (
                  <>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                  </>
                ) : (
                  <>
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="2"/>
                  </>
                )}
              </svg>
            </div>
          )}

          {getCategory() && (
            <div className="ps-card-category">
              {getCategory()}
            </div>
          )}
        </div>

        <div className="ps-card-content">
          <div className="ps-card-meta">
            <span className="ps-card-date">
              {formatDate(content.publishedAt || content.createdAt)}
            </span>
            <span className="ps-card-reading-time">
              {getReadingTime(content)}
            </span>
            <span className="ps-card-views">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {viewCount}
            </span>
          </div>

          <h3 className="ps-card-title">
            {truncateText(content.title, limits.title)}
          </h3>

          <p className="ps-card-description">
            {truncateText(
              content.shortDescription || content.description,
              limits.description
            )}
          </p>

          {/* 🔧 ОБНОВЕНА ЛОГИКА за показване на автора */}
          {author && viewMode !== 'compact' && (
            <div className="ps-card-author">
              <div className="ps-author-info">
                {typeof author === 'object' && author.avatar ? (
                  <img
                    src={getResizedUrl(author.avatar, 200)}
                    alt={author.name}
                    className="ps-author-avatar"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      if (author.avatar && e.target.src !== author.avatar) e.target.src = author.avatar;
                    }}
                  />
                ) : (
                  <div className="ps-author-avatar-placeholder">
                    {typeof author === 'object' ? author.name?.charAt(0) : author?.charAt(0)}
                  </div>
                )}
                <span className="ps-author-name">
                  {typeof author === 'object' ? author.name : author}
                </span>
              </div>
            </div>
          )}

          {/*  footer */}
          {viewMode !== 'compact' && viewMode !== 'list' && (
            <div className="ps-card-footer">
              <span className="ps-read-more-text">
                {t(`publicationStories.card.${contentType}.readMore`)}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </span>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
};
