import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt,
  faUser,
  faArrowRight,
  faNewspaper
} from '@fortawesome/free-solid-svg-icons';
import './recentArticles.css';
import { useArticleContext } from '../../../contexts/ArticleContext';

export const RecentArticles = () => {
  const { t, i18n } = useTranslation('clubs');
  const navigate = useNavigate();
  const { getAllArticles, articles, articlesLoaded } = useArticleContext();
  const [recentArticles, setRecentArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        if (!articlesLoaded) {
          await getAllArticles();
        }
        setRecentArticles(articles.slice(0, 5));
      } catch (error) {
        console.error(t('clubs.RecentArticles.errors.loadingArticles'), error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [articles, articlesLoaded, t]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'en' ? 'en-US' : 
                   'de-DE';
    
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getImageSource = (article) => {
    if (article.mainImage) {
      if (article.mainImage.thumbnail) {
        return article.mainImage.thumbnail;
      }
      if (article.mainImage.sources && article.mainImage.sources.length > 0) {
        return article.mainImage.sources[0];
      }
    }
    return null;
  };

  const handleArticleClick = (slug) => {
    navigate(`/articles/${slug}`);
  };

  if (isLoading) {
    return (
      <div className="clubs-articles-loading">
        <div className="clubs-articles-skeleton">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="clubs-skeleton-item">
              <div className="clubs-skeleton-image"></div>
              <div className="clubs-skeleton-content">
                <div className="clubs-skeleton-title"></div>
                <div className="clubs-skeleton-meta"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="clubs-articles-widget">
      <div className="clubs-articles-header">
        <h3>
          <FontAwesomeIcon icon={faNewspaper} />
          {t('clubs.RecentArticles.title')}
        </h3>
        <button 
          className="clubs-articles-view-all"
          onClick={() => navigate('/articles')}
        >
          {t('clubs.RecentArticles.viewAll')}
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      <div className="clubs-articles-list">
        {recentArticles.map((article) => (
          <article 
            key={article.id}
            className="clubs-article-item"
            onClick={() => handleArticleClick(article.slug)}
          >
            <div className="clubs-article-image">
              {getImageSource(article) ? (
                <img 
                  src={getImageSource(article)} 
                  alt={article.title}
                  loading="lazy"
                />
              ) : (
                <div className="clubs-article-placeholder">
                  <FontAwesomeIcon icon={faNewspaper} />
                </div>
              )}
            </div>

            <div className="clubs-article-content">
              <h4 className="clubs-article-title">{article.title}</h4>
              
              <div className="clubs-article-meta">
                <div className="clubs-article-date">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <span>{formatDate(article.publishDate)}</span>
                </div>
                {article.author && (
                  <div className="clubs-article-author">
                    <FontAwesomeIcon icon={faUser} />
                    <span>{article.author}</span>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {recentArticles.length === 0 && !isLoading && (
        <div className="clubs-articles-empty">
          <p>{t('clubs.RecentArticles.noArticles')}</p>
        </div>
      )}
    </div>
  );
};