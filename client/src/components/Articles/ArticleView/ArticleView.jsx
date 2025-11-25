/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faUser,
  faChevronLeft,
  faChevronRight,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import {
  faFacebookF,
  faTwitter,
  faLinkedinIn,
  faTelegram
} from '@fortawesome/free-brands-svg-icons';
import './articleView.css';
import RecentArticles from './RecentArticles/RecentArticles';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useTranslation } from 'react-i18next';
import ImageSlider from './ImageSlider/ImageSlider';
import VideoPlayer from './VideoPlayer/VideoPlayer';
import { useLoading } from '../../contexts/LoadingContext';
import ScrollToTop from '../../ScrollToTop/ScrollToTop';
import { useArticleContext } from '../../contexts/ArticleContext';
import { renderHtml } from '../articleUtils/article-utils.jsx';
import { useArticleLimit } from '../../contexts/ArticleLimitContext';
import Pagination from '../Pagination/Pagination';
import { TextZoom } from '../../TextZoom/TextZoom.jsx';
import SEOHead from '../../SEO/SEOHead'; // ✅ Импортирай SEOHead

const ArticleView = () => {
  const { showAssistant } = useArticleLimit();
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [relatedArticle, setRelatedArticle] = useState(null);
  const [previousArticle, setPreviousArticle] = useState(null);
  const [nextArticle, setNextArticle] = useState(null);
  const [activeSectionSlides, setActiveSectionSlides] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const sectionsPerPage = 3;
  const { setIsLoading } = useLoading();
  const { trackArticle, getViewCount } = useAnalytics();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { getAllArticles, articlesLoaded, getArticleById, articles } = useArticleContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalStartIndex, setModalStartIndex] = useState(0);

  const metaData = useMemo(() => {
    if (!article) {
      return {
        title: 'Зареждане на статия... | Pensa Club',
        description: 'Зареждане на статия за дигитална грамотност',
        keywords: 'Pensa Club, статии, дигитална грамотност',
        image: 'https://pensa.club/images/iniciatives/iniciatives-2.jpg',
        publishedTime: null,
        modifiedTime: null
      };
    }
    const cleanSummary = article.summary?.replace(/<[^>]*>/g, '').trim() || '';
    const description = cleanSummary.substring(0, 160) + (cleanSummary.length > 160 ? '...' : '');

    // Извличане на keywords от tags
    const keywords = article.tags && article.tags.length > 0
      ? `${article.tags.join(', ')}, дигитална грамотност, пенсионери, Pensa Club`
      : 'дигитална грамотност, пенсионери, статии, Pensa Club';

    // Изображение
    const image = article.mainImage?.sources?.[0] || 'https://pensa.club/images/iniciatives/iniciatives-2.jpg';

    return {
      title: `${article.title} | Pensa Club`,
      description,
      keywords,
      image,
      publishedTime: article.publishDate,
      modifiedTime: article.updatedAt || article.publishDate
    };
  }, [article]);

  // ✅ STRUCTURED DATA ЗА СТАТИЯ (useMemo)
  const structuredData = useMemo(() => {
    if (!article) return null;

    const cleanSummary = article.summary?.replace(/<[^>]*>/g, '').trim() || '';

    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.title,
      "description": cleanSummary.substring(0, 200),
      "image": article.mainImage?.sources?.[0] || 'https://pensa.club/images/iniciatives/iniciatives-2.jpg',
      "author": {
        "@type": "Person",
        "name": article.author || "Pensa Club"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Pensa Club",
        "logo": {
          "@type": "ImageObject",
          "url": "https://pensa.club/logo.png"
        },
        "sameAs": [
          "https://www.facebook.com/profile.php?id=61578204366479"
        ]
      },
      "datePublished": article.publishDate,
      "dateModified": article.updatedAt || article.publishDate,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      },
      "keywords": article.tags?.join(', ') || "дигитална грамотност, пенсионери",
      "articleSection": "Дигитална грамотност",
      "inLanguage": i18n.language,
      "url": window.location.href
    };
  }, [article, i18n.language]);

  // ... останалият код БЕЗ ПРОМЯНА ...

  useEffect(() => {
    const handlePopState = () => {
      if (isModalOpen) {
        setIsModalOpen(false);
        document.body.style.overflow = 'auto';
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({
      top: document.querySelector('.article-body-view').offsetTop - 100,
      behavior: 'smooth'
    });
  };

  const openImageModal = (images, startIndex = 0) => {
    setModalImages(images);
    setModalStartIndex(startIndex);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = useCallback(() => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  }, []);

  const calculateTotalPages = (sections) => {
    if (!sections || sections.length === 0) return 1;
    return Math.ceil(sections.length / sectionsPerPage);
  };

  const getCurrentPageSections = () => {
    if (!article || !article.sections) return [];
    const startIndex = (currentPage - 1) * sectionsPerPage;
    const endIndex = startIndex + sectionsPerPage;
    return article.sections.slice(startIndex, endIndex);
  };

  const findAdjacentArticles = (allArticles, currentArticle) => {
    if (!currentArticle || !allArticles || allArticles.length === 0) return { prev: null, next: null };
    const sortedArticles = [...allArticles].sort((a, b) =>
      new Date(b.publishDate) - new Date(a.publishDate)
    );
    const currentIndex = sortedArticles.findIndex(a => a.id === currentArticle.id);
    if (currentIndex === -1) return { prev: null, next: null };
    const prev = currentIndex > 0 ? sortedArticles[currentIndex - 1] : null;
    const next = currentIndex < sortedArticles.length - 1 ? sortedArticles[currentIndex + 1] : null;
    return { prev, next };
  };

  const findRelatedArticle = (allArticles, currentArticle) => {
    if (!currentArticle || !currentArticle.tags || !allArticles || allArticles.length <= 1) {
      return null;
    }
    const calculateSimilarity = (article1, article2) => {
      if (!article1.tags || !article2.tags) return 0;
      const commonTags = article1.tags.filter(tag => article2.tags.includes(tag));
      if (commonTags.length === 0) return 0;
      const similarity = commonTags.length / Math.sqrt(article1.tags.length * article2.tags.length);
      return similarity;
    };
    const articlesWithSimilarity = allArticles
      .filter(a => a.id !== currentArticle.id)
      .map(article => ({
        article,
        similarity: calculateSimilarity(currentArticle, article)
      }))
      .filter(item => item.similarity > 0);
    articlesWithSimilarity.sort((a, b) => b.similarity - a.similarity);
    return articlesWithSimilarity.length > 0 ? articlesWithSimilarity[0].article : null;
  };

  const handleSectionSlideChange = (sectionIndex, slideIndex) => {
    setActiveSectionSlides(prev => ({
      ...prev,
      [sectionIndex]: slideIndex
    }));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [slug]);

  useEffect(() => {
    setCurrentUrl(window.location.origin + window.location.pathname);

    const loadArticle = async () => {
      setIsLoading(true);
      try {
        let articleId = null;
        if (articlesLoaded && articles.length > 0) {
          const cachedArticle = articles.find(a => a.slug === slug);
          if (cachedArticle) {
            articleId = cachedArticle.id;
          }
        }
        if (!articleId) {
          const allArticles = await getAllArticles();
          const foundArticle = allArticles.find(a => a.slug === slug);
          if (foundArticle) {
            articleId = foundArticle.id;
          }
        }
        if (articleId) {
          const foundArticle = await getArticleById(articleId);
          if (foundArticle.error && foundArticle.type === 'ARTICLE_LIMIT_REACHED') {
            showAssistant();
            const isDirectAccess = !document.referrer || document.referrer.indexOf(window.location.host) === -1;
            if (isDirectAccess) {
              navigate('/');
            } else {
              navigate('/articles');
            }
            return;
          }
          setArticle(foundArticle);
          if (articlesLoaded && articles.length > 0) {
            const { prev, next } = findAdjacentArticles(articles, foundArticle);
            setPreviousArticle(prev);
            setNextArticle(next);
            const related = findRelatedArticle(articles, foundArticle);
            setRelatedArticle(related);
          } else {
            const { prev, next } = findAdjacentArticles(articles, foundArticle);
            setPreviousArticle(prev);
            setNextArticle(next);
            const related = findRelatedArticle(articles, foundArticle);
            setRelatedArticle(related);
          }
          trackArticle(foundArticle.id, foundArticle.title);
        } else {
          console.error("Статията не е намерена:", slug);
        }
      } catch (error) {
        console.error("Грешка при зареждане на статията:", error);
        if (error.message === 'ARTICLE_LIMIT_REACHED' ||
          (error.response && error.response.status === 429)) {
          showAssistant();
          const isArticlesList = location.pathname === '/articles';
          if (!isArticlesList) {
            navigate('/articles');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadArticle();
  }, [slug, location.key, showAssistant, navigate]);

  useEffect(() => {
    if (article) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [article]);

  const shareOnFacebook = (e) => {
    e.preventDefault();
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(shareUrl, 'facebook-share', 'width=580,height=520');
  };

  const shareOnTwitter = (e) => {
    e.preventDefault();
    const text = article ? article.title : "";
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(shareUrl, 'twitter-share', 'width=550,height=420');
  };

  const shareOnLinkedIn = (e) => {
    e.preventDefault();
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(shareUrl, 'linkedin-share', 'width=550,height=420');
  };

  const shareOnTelegram = (e) => {
    e.preventDefault();
    const text = article ? article.title : "";
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, 'telegram-share', 'width=550,height=420');
  };

  if (!article) {
    return (
      <div className="article-not-found">
        <h2>{t('articles.articleView.articleNotFound')}</h2>
        <Link to="/articles" className="back-to-articles">
          {t('articles.articleView.backToArticles')}
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
      return (
        <div className="main-media-container">
          <div className="clickable-slider">
            <ImageSlider
              images={article.mainImage.sources}
              alt={article.mainImage.alt}
              onImageClick={() => openImageModal(article.mainImage.sources)}
            />
          </div>
          {article.mainImage.caption && (
            <div className="main-image-caption-container">
              <div className="main-image-caption" dangerouslySetInnerHTML={{ __html: article.mainImage.caption }} />
            </div>
          )}
        </div>
      );
    } else if (article.mainImage.type === 'video') {
      return (
        <div className="main-media-container">
          <VideoPlayer
            src={article.mainImage.videoUrl || article.mainImage.sources[0]}
            thumbnail={article.mainImage.thumbnail}
            alt={article.mainImage.alt}
            subtitles={article.mainImage.subtitles || []}
            downloadUrl={article.mainImage.downloadUrl}
            allowDownload={article.mainImage.allowDownload}
          />
          {article.mainImage.caption && (
            <div className="main-image-caption-container">
              <div className="main-image-caption" dangerouslySetInnerHTML={{ __html: article.mainImage.caption }} />
            </div>
          )}
        </div>
      );
    } else {
      return (
        <figure className="article-main-image">
          <img
            src={article.mainImage.sources[0]}
            alt={article.mainImage.alt}
            onClick={() => openImageModal(article.mainImage.sources)}
            style={{ cursor: 'pointer' }}
          />
          {article.mainImage.caption && (
            <figcaption dangerouslySetInnerHTML={{ __html: article.mainImage.caption }} />
          )}
        </figure>
      );
    }
  };

  const renderSectionImages = (section, sectionIndex) => {
    if (!section.sectionImages || section.sectionImages.length === 0) {
      if (section.image && section.image.src) {
        return (
          <figure className="section-figure">
            <img
              src={section.image.src}
              alt={section.image.alt || t('articles.articleView.imageFor', { title: section.title })}
              onClick={() => openImageModal([section.image.src])}
              style={{ cursor: 'pointer' }}
            />
            {section.image.caption && (
              <figcaption>{section.image.caption}</figcaption>
            )}
          </figure>
        );
      }
      return null;
    }
    if (section.sectionImages.length === 1) {
      const image = section.sectionImages[0];
      return (
        <figure className="section-figure">
          <img
            src={image.src}
            alt={image.alt || t('articles.articleView.imageFor', { title: section.title })}
            onClick={() => openImageModal([image.src])}
            style={{ cursor: 'pointer' }}
          />
          {image.caption && (
            <figcaption dangerouslySetInnerHTML={{ __html: image.caption }} />
          )}
        </figure>
      );
    }
    if (section.sectionImages.length > 1) {
      const sectionImageUrls = section.sectionImages.map(img => img.src);
      return (
        <div className="section-slider-container">
          <ImageSlider
            images={sectionImageUrls}
            alt={`${t('articles.articleView.imagesFor')} ${section.title}`}
            onSlideChange={(slideIndex) => handleSectionSlideChange(sectionIndex, slideIndex)}
            onImageClick={() => openImageModal(sectionImageUrls, activeSectionSlides[sectionIndex] || 0)}
          />
          {section.sectionImages[activeSectionSlides[sectionIndex] || 0]?.caption && (
            <div className="single-slider-caption-container">
              <div className="single-slide-caption">
                <div className="single-caption-content-view"
                  dangerouslySetInnerHTML={{
                    __html: section.sectionImages[activeSectionSlides[sectionIndex] || 0].caption
                  }}
                />
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <>
      {/* ✅ ЗАМЕНИ СТАРИЯ Helmet СЪС SEOHead */}
      <SEOHead
        title={metaData.title}
        description={metaData.description}
        keywords={metaData.keywords}
        image={metaData.image}
        type="article"
        publishedTime={metaData.publishedTime}
        modifiedTime={metaData.modifiedTime}
        structuredData={structuredData}
      />

      <TextZoom />
      <div className="article-main">
        <div className="articles-hero-view">
          <div className="hero-content-view"></div>
        </div>
        <div className="article-container">
          <div className="article-layout">
            <main className="article-content">
              <h1 className="article-title-view view">{article.title}</h1>
              <div className="article-meta-view">
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
              {relatedArticle && (
                <div className="related-article-link">
                  <Link to={`/articles/${relatedArticle.slug}`}>
                    {t('articles.articleView.relatedArticle')}: {relatedArticle.title}
                  </Link>
                </div>
              )}
              <div className="article-summary-view">{renderHtml(article.summary)}</div>

              <div className="article-body-view">
                {getCurrentPageSections().map((section, index) => {
                  const actualIndex = (currentPage - 1) * sectionsPerPage + index;
                  return (
                    <section key={actualIndex} className="article-section">
                      <h2 className="section-title">{section.title}</h2>
                      <div className="section-content">
                        <div dangerouslySetInnerHTML={{ __html: section.content }} />
                        {renderSectionImages(section, actualIndex)}
                      </div>
                    </section>
                  );
                })}

                {article.sections && article.sections.length > sectionsPerPage && (
                  <div className="article-pagination-wrapper">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={calculateTotalPages(article.sections)}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>

              {article.tags && article.tags.length > 0 && (
                <div className="article-tags-view">
                  {article.tags.map((tag, index) => (
                    <span key={index} className="article-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="article-social">
                <div className="social-text">{t('articles.articleView.share')}:</div>
                <div className="social-icons">
                  <button
                    className="social-icon facebook"
                    onClick={shareOnFacebook}
                    aria-label={t('articles.articleView.shareOnFacebook')}
                  >
                    <FontAwesomeIcon icon={faFacebookF} />
                  </button>
                  <button
                    className="social-icon twitter"
                    onClick={shareOnTwitter}
                    aria-label={t('articles.articleView.shareOnTwitter')}
                  >
                    <FontAwesomeIcon icon={faTwitter} />
                  </button>
                  <button
                    className="social-icon linkedin"
                    onClick={shareOnLinkedIn}
                    aria-label={t('articles.articleView.shareOnLinkedIn')}
                  >
                    <FontAwesomeIcon icon={faLinkedinIn} />
                  </button>
                  <button
                    className="social-icon telegram"
                    onClick={shareOnTelegram}
                    aria-label={t('articles.articleView.shareOnTelegram')}
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
                {previousArticle && (
                  <Link to={`/articles/${previousArticle.slug}`} className="prev-article">
                    <FontAwesomeIcon icon={faChevronLeft} />
                    <div className="nav-article-info">
                      <span className="nav-label">{t('articles.articleView.previousArticle')}</span>
                      <span className="nav-title">{previousArticle.title}</span>
                    </div>
                  </Link>
                )}

                {nextArticle && (
                  <Link to={`/articles/${nextArticle.slug}`} className="next-article">
                    <div className="nav-article-info">
                      <span className="nav-label">{t('articles.articleView.nextArticle')}</span>
                      <span className="nav-title">{nextArticle.title}</span>
                    </div>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </Link>
                )}
              </div>
            </main>

            <aside className="article-sidebar">
              <RecentArticles currentArticleId={article.id} allArticles={articles} />
            </aside>
          </div>
        </div>
        {isModalOpen && (
          <div className="image-modal-overlay-view" onClick={closeImageModal}>
            <div className="image-modal-content-view" onClick={e => e.stopPropagation()}>
              <button className="modal-close-btn-view" onClick={closeImageModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
              <ImageSlider images={modalImages} alt="Enlarged image" initialIndex={modalStartIndex} />
            </div>
          </div>
        )}
        <ScrollToTop />
      </div>
    </>
  );
};

export default ArticleView;