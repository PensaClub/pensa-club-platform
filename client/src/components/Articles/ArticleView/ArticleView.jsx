/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faUser,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import {
  faFacebookF,
  faTwitter,
  faLinkedinIn,
  faTelegram
} from '@fortawesome/free-brands-svg-icons';
import './articleView.css';
import { getArticleBySlug } from '../data/articlesData';
import RecentArticles from './RecentArticles/RecentArticles';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useTranslation } from 'react-i18next';
import ImageSlider from './ImageSlider/ImageSlider';
import VideoPlayer from './VideoPlayer/VideoPlayer';
import { useLoading } from '../../contexts/LoadingContext';
import ScrollToTop from '../../ScrollToTop/ScrollToTop';

const ArticleView = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('');

  const { setIsLoading } = useLoading();
  const { trackArticle, getViewCount } = useAnalytics();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    // Запазваме текущия URL за споделяне с абсолютен път
    setCurrentUrl(window.location.origin + window.location.pathname);

    setIsLoading(true);
    const foundArticle = getArticleBySlug(slug);

    setTimeout(() => {
      setArticle(foundArticle);
      setIsLoading(false);

      // Проследяване на посещението след зареждане на статията
      if (foundArticle) {
        trackArticle(foundArticle.id, foundArticle.title);
      }
    }, 20);
  }, [slug, setIsLoading]);

  useEffect(() => {
    if (article) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [article]);

  // Директно споделяне чрез отваряне на нов прозорец със съответния URL
  const shareOnFacebook = (e) => {
    e.preventDefault();
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(shareUrl, 'facebook-share', 'width=580,height=520');
  };

  // Споделяне в Twitter
  const shareOnTwitter = (e) => {
    e.preventDefault();
    const text = article ? article.title : "";
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(shareUrl, 'twitter-share', 'width=550,height=420');
  };

  // Споделяне в LinkedIn
  const shareOnLinkedIn = (e) => {
    e.preventDefault();
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(shareUrl, 'linkedin-share', 'width=550,height=420');
  };

  // Споделяне в Telegram
  const shareOnTelegram = (e) => {
    e.preventDefault();
    const text = article ? article.title : "";
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, 'telegram-share', 'width=550,height=420');
  };

  if (!article) {
    return (
      <div className="article-not-found">
        <h2>Статията не е намерена</h2>
        <Link to="/articles" className="back-to-articles">
          Към всички статии
        </Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('bg-BG', options);
  };

  const renderMainMedia = () => {
    if (article.mainImage.type === 'slider' && article.mainImage.sources.length > 1) {
      return <ImageSlider images={article.mainImage.sources} alt={article.mainImage.alt} />;
    } else if (article.mainImage.type === 'video') {
      return (
        <VideoPlayer
          src={article.mainImage.sources[0]}
          thumbnail={article.mainImage.thumbnail}
          alt={article.mainImage.alt}
          subtitles={article.mainImage.subtitles || []}
          downloadUrl={article.mainImage.downloadUrl}
          allowDownload={article.mainImage.allowDownload}
        />
      );
    } else {
      return (
        <div className="article-main-image">
          <img src={article.mainImage.sources[0]} alt={article.mainImage.alt} />
        </div>
      );
    }
  };

  return (
    <div className="article-main">
      <div className="articles-hero-view">
        <div className="hero-content-view">
        </div>
      </div>
      <div className="article-container">

        <div className="article-layout">
          <main className="article-content">
            <h1 className="article-title view">{article.title}</h1>

            <div className="article-summary">
              {article.summary}
            </div>
            <div className="article-meta">
              <div className="meta-item">
                <FontAwesomeIcon icon={faUser} />
                <span>{article.author}</span>
              </div>
              <div className="meta-item">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>{formatDate(article.publishDate)}</span>
              </div>
            </div>
            {renderMainMedia()}

            {article.relatedArticle && (
              <div className="related-article-link">
                <Link to={`/articles/${article.relatedArticle.slug}`}>
                  Свързана статия: {article.relatedArticle.title}
                </Link>
              </div>
            )}

            <div className="article-body">
              {article.sections.map((section, index) => (
                <section key={index} className="article-section">
                  <h2 className="section-title">{section.title}</h2>
                  <div className="section-content">
                    <p>{section.content}</p>

                    {section.image && (
                      <figure className="section-figure">
                        <img
                          src={section.image.src}
                          alt={section.image.alt}
                        />
                        {section.image.caption && (
                          <figcaption>{section.image.caption}</figcaption>
                        )}
                      </figure>
                    )}
                  </div>
                </section>
              ))}
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="article-tags">
                {article.tags.map((tag, index) => (
                  <span key={index} className="article-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="article-social">
              <div className="social-text">Споделете:</div>
              <div className="social-icons">
                <button
                  className="social-icon facebook"
                  onClick={shareOnFacebook}
                  aria-label="Споделете във Facebook"
                >
                  <FontAwesomeIcon icon={faFacebookF} />
                </button>
                <button
                  className="social-icon twitter"
                  onClick={shareOnTwitter}
                  aria-label="Споделете в Twitter"
                >
                  <FontAwesomeIcon icon={faTwitter} />
                </button>
                <button
                  className="social-icon linkedin"
                  onClick={shareOnLinkedIn}
                  aria-label="Споделете в LinkedIn"
                >
                  <FontAwesomeIcon icon={faLinkedinIn} />
                </button>
                <button
                  className="social-icon telegram"
                  onClick={shareOnTelegram}
                  aria-label="Споделете в Telegram"
                >
                  <FontAwesomeIcon icon={faTelegram} />
                </button>
              </div>
              {article && (
                <div className="article-view-count">
                  <svg width="16" height="16" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" d="M8 3.9c-6.7 0-8 5.1-8 5.1s2.2 4.1 7.9 4.1 8.1-4 8.1-4-1.3-5.2-8-5.2zM5.3 5.4c0.5-0.3 1.3-0.3 1.3-0.3s-0.5 0.9-0.5 1.6c0 0.7 0.2 1.1 0.2 1.1l-1.1 0.2c0 0-0.3-0.5-0.3-1.2 0-0.8 0.4-1.4 0.4-1.4zM7.9 12.1c-4.1 0-6.2-2.3-6.8-3.2 0.3-0.7 1.1-2.2 3.1-3.2-0.1 0.4-0.2 0.8-0.2 1.3 0 2.2 1.8 4 4 4s4-1.8 4-4c0-0.5-0.1-0.9-0.2-1.3 2 0.9 2.8 2.5 3.1 3.2-0.7 0.9-2.8 3.2-7 3.2z"></path>
                  </svg>
                  <span>{getViewCount(article.id)} {t('articles.views')}</span>
                </div>
              )}
            </div>

            <div className="article-navigation">
              {article.previousArticle && (
                <Link to={`/articles/${article.previousArticle.slug}`} className="prev-article">
                  <FontAwesomeIcon icon={faChevronLeft} />
                  <div className="nav-article-info">
                    <span className="nav-label">Предишна статия</span>
                    <span className="nav-title">{article.previousArticle.title}</span>
                  </div>
                </Link>
              )}

              {article.nextArticle && (
                <Link to={`/articles/${article.nextArticle.slug}`} className="next-article">
                  <div className="nav-article-info">
                    <span className="nav-label">Следваща статия</span>
                    <span className="nav-title">{article.nextArticle.title}</span>
                  </div>
                  <FontAwesomeIcon icon={faChevronRight} />
                </Link>
              )}
            </div>

          </main>

          <aside className="article-sidebar">
            <RecentArticles currentArticleId={article.id} />
          </aside>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default ArticleView;