/* eslint-disable react-hooks/exhaustive-deps */
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImages, faPlayCircle, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import './articleCard.css';
import { useAnalytics } from '../../../contexts/AnalyticsContext';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export const ArticleCard = ({ article, featured = false }) => {
  const { t } = useTranslation();
  const { getViewCount, loadArticleViewCounts } = useAnalytics();

  useEffect(() => {
    if (article) {
      loadArticleViewCounts([article.id]);
    }
  }, [article?.id]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('bg-BG', options);
  };

  const isExternalUrl = (url) => {

    if (url && url.includes('firebasestorage.googleapis.com')) {
      return false;
    }
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  };

  const getImageSource = () => {
    if (article.mainImage.type === 'video') {
      return article.mainImage.thumbnail;
    } else {
      const source = article.mainImage.sources[0];
      return source;
    }
  };

  const isExternalResource = isExternalUrl(getImageSource());

  const ViewsCounter = () => (
    <div className="article-card-views">
      <svg width="16" height="16" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M8 3.9c-6.7 0-8 5.1-8 5.1s2.2 4.1 7.9 4.1 8.1-4 8.1-4-1.3-5.2-8-5.2zM5.3 5.4c0.5-0.3 1.3-0.3 1.3-0.3s-0.5 0.9-0.5 1.6c0 0.7 0.2 1.1 0.2 1.1l-1.1 0.2c0 0-0.3-0.5-0.3-1.2 0-0.8 0.4-1.4 0.4-1.4zM7.9 12.1c-4.1 0-6.2-2.3-6.8-3.2 0.3-0.7 1.1-2.2 3.1-3.2-0.1 0.4-0.2 0.8-0.2 1.3 0 2.2 1.8 4 4 4s4-1.8 4-4c0-0.5-0.1-0.9-0.2-1.3 2 0.9 2.8 2.5 3.1 3.2-0.7 0.9-2.8 3.2-7 3.2z"></path>
      </svg>
      <span>{getViewCount(article.id)}</span>
    </div>
  );

  return (
    <div className="article-card-container">
      <div className="article-meta-top">
        <div className="meta-author">
          <span className="author-name">{article.author}</span>
        </div>
        <div className="meta-date">
          <span>{formatDate(article.publishDate)}</span>
        </div>
      </div>

      <div className={`article-card ${featured ? 'article-card-featured' : ''}`}>
        <div className="article-card-image-container">
          <Link to={`/articles/${article.slug}`}>
            <img
              src={getImageSource()}
              alt={article.title}
              className="article-image"
            />

            {article.mainImage.type === 'slider' && article.mainImage.sources.length > 1 && (
              <div className="media-badge slider-badge">
                <FontAwesomeIcon icon={faImages} />
                <span>{article.mainImage.sources.length} {t('articles.articleCard.photos')}</span>
              </div>
            )}
            {article.mainImage.type === 'video' && (
              <div className="media-badge video-badge">
                <FontAwesomeIcon icon={faPlayCircle} />
                <span>{t('articles.articleCard.video')}</span>
              </div>
            )}
            {isExternalResource && (
              <div className="media-badge external-badge">
                <FontAwesomeIcon icon={faExternalLinkAlt} />
                <span>{t('articles.articleCard.externalSource')}</span>
              </div>
            )}
          </Link>
        </div>

        {article.mainImage.alt && (
          <div
            className="image-alt-caption"
            dangerouslySetInnerHTML={{ __html: article.mainImage.alt }}
          />
        )}

        <div className="article-card-content">
          <Link to={`/articles/${article.slug}`} className="title-link">
            <h2 className="article-title">{article.title}</h2>
          </Link>

          <div
            className="article-excerpt"
            dangerouslySetInnerHTML={{ __html: article.summary }}
          />

          {!featured && (
            <div className="article-views-counter">
              <ViewsCounter />
            </div>
          )}

          {featured && (
            <div className="article-tags-card">
              {article.tags && article.tags.map((tag, index) => (
                index < 3 && <span key={index} className="tag">{tag}</span>
              ))}
              {article.tags && article.tags.length > 3 && (
                <span className="tag-more">+{article.tags.length - 3}</span>
              )}

              <ViewsCounter />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
