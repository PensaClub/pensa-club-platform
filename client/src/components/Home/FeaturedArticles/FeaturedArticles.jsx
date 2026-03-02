
import { useMemo } from "react";
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import "./featuredArticles.css";
import { useArticleContext } from "../../contexts/ArticleContext";
import { useTranslation } from "react-i18next";

export const FeaturedArticles = () => {
  const { t } = useTranslation('home');
  const { articles, articlesLoaded } = useArticleContext();

  // Use articles from context (PlatformStats already loads them)
  const featuredArticles = useMemo(() => {
    if (!articles || articles.length === 0) return [];
    return [...articles]
      .filter(article => article.mainImage)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  }, [articles]);

  // Функция за URL на изображение
  const getImageUrl = (article) => {
    if (!article || !article.mainImage) return '';

    if (article.mainImage.type === 'video') {
      return article.mainImage.thumbnail || '';
    } else {
      return (article.mainImage.sources && article.mainImage.sources.length > 0)
        ? article.mainImage.sources[0]
        : '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const cleanAndTruncateText = (html, length) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = doc.body.textContent || "";
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  if (featuredArticles.length === 0) {
    return null;
  }

  return (
    <section className="inspiration-section">
      <svg className="wave-transition" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
        <path fillRule="evenodd" d="M0,0 C320,80 640,120 960,120 C1280,120 1600,80 1920,0 L1920,120 L0,120 Z" />
      </svg>
      <svg className="second-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
        <path fillRule="evenodd" d="M0,10 C200,30 400,80 720,90 C1040,100 1320,70 1920,10 L1920,120 L0,120 Z" />
      </svg>

      <div className="inspiration-bg"></div>
      <div className="inspiration-pattern"></div>
      <div className="inspiration-decor decor-blob-1"></div>
      <div className="inspiration-decor decor-blob-2"></div>
      <div className="inspiration-decor decor-blob-3"></div>

      <div className="inspiration-container">
        <div className="inspiration-header">
          <h2 className="inspiration-title">
            {t('home.featuredArticles.title')}
          </h2>
          <p className="inspiration-subtitle">
            {t('home.featuredArticles.subtitle')}
          </p>
        </div>

        <div className="inspiration-stream">
          <div className="stream-line"></div>

          <div className="stream-articles">
            {featuredArticles.map((article, index) => (
              <article key={article.id} className="stream-article">
                <div className="stream-marker"></div>

                <Link to={`/articles/${article.slug}`} className="stream-image-container">
                  <div className="stream-image-wrap">
                    <img
                      src={getImageUrl(article)}
                      alt={article.title}
                      className="stream-image"
                      loading="lazy"
                    />
                    <div className="stream-image-accent"></div>
                  </div>
                </Link>

                <div className="stream-content">
                  <div className="article-meta">
                    <span className="article-date">
                      {formatDate(article.publishDate)}
                    </span>
                  </div>

                  <h3 className="article-title">{article.title}</h3>

                  <p className="article-excerpt-home">
                    {cleanAndTruncateText(article.summary, 220)}
                  </p>

                  <Link to={`/articles/${article.slug}`} className="article-link">
                    <span>{t('home.featuredArticles.readMore')}</span>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path
                        d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="inspiration-footer">
          <Link to="/articles" className="inspiration-all-link">
            <span>{t('home.featuredArticles.viewAllArticles')}</span>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z"
                fill="currentColor"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};
