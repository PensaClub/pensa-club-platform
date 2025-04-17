/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
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
import RecentArticles from './RecentArticles/RecentArticles';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useTranslation } from 'react-i18next';
import ImageSlider from './ImageSlider/ImageSlider';
import VideoPlayer from './VideoPlayer/VideoPlayer';
import { useLoading } from '../../contexts/LoadingContext';
import ScrollToTop from '../../ScrollToTop/ScrollToTop';
import { useArticleContext } from '../../contexts/ArticleContext';
import { renderHtml } from '../articleUtils/article-utils';
import { useArticleLimit } from '../../contexts/ArticleLimitContext';

const ArticleView = () => {
  const { showAssistant } = useArticleLimit();

  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [relatedArticle, setRelatedArticle] = useState(null);
  const [previousArticle, setPreviousArticle] = useState(null);
  const [nextArticle, setNextArticle] = useState(null);
  const [activeSectionSlides, setActiveSectionSlides] = useState({});

  const { setIsLoading } = useLoading();
  const { trackArticle, getViewCount } = useAnalytics();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { getAllArticles, articlesLoaded,getArticleById, articles } = useArticleContext();

  // Функция за намиране на предишна и следваща статия
  const findAdjacentArticles = (allArticles, currentArticle) => {
    if (!currentArticle || !allArticles || allArticles.length === 0) return { prev: null, next: null };
    
    // Сортираме статиите по дата (от най-нови към най-стари)
    const sortedArticles = [...allArticles].sort((a, b) => 
      new Date(b.publishDate) - new Date(a.publishDate)
    );
    
    // Намираме индекса на текущата статия
    const currentIndex = sortedArticles.findIndex(a => a.id === currentArticle.id);
    
    if (currentIndex === -1) return { prev: null, next: null };
    
    // Определяме предишната статия (по-нова)
    const prev = currentIndex > 0 ? sortedArticles[currentIndex - 1] : null;
    
    // Определяме следващата статия (по-стара)
    const next = currentIndex < sortedArticles.length - 1 ? sortedArticles[currentIndex + 1] : null;
    
    return { prev, next };
  };

  // Функция за намиране на свързана статия по тагове
  const findRelatedArticle = (allArticles, currentArticle) => {
    if (!currentArticle || !currentArticle.tags || !allArticles || allArticles.length <= 1) {
      return null;
    }
    
    // Функция за изчисляване на сходство между две статии
    const calculateSimilarity = (article1, article2) => {
      if (!article1.tags || !article2.tags) return 0;
      
      // Брой общи тагове
      const commonTags = article1.tags.filter(tag => article2.tags.includes(tag));
      
      // Ако няма общи тагове, коефициентът е 0
      if (commonTags.length === 0) return 0;
      
      // Изчисляваме коефициент на сходство (колкото по-голям, толкова по-сходни са статиите)
      const similarity = commonTags.length / Math.sqrt(article1.tags.length * article2.tags.length);
      
      return similarity;
    };
    
    // Изчисляваме сходството за всички статии
    const articlesWithSimilarity = allArticles
      .filter(a => a.id !== currentArticle.id) // Изключваме текущата статия
      .map(article => ({
        article,
        similarity: calculateSimilarity(currentArticle, article)
      }))
      .filter(item => item.similarity > 0); // Премахваме статии без общи тагове
    
    // Сортираме по сходство (от най-високо към най-ниско)
    articlesWithSimilarity.sort((a, b) => b.similarity - a.similarity);
    
    // Връщаме най-сходната статия, ако има такава
    return articlesWithSimilarity.length > 0 ? articlesWithSimilarity[0].article : null;
  };

  // Функция за плъзгачите в секциите
  const handleSectionSlideChange = (sectionIndex, slideIndex) => {
    setActiveSectionSlides(prev => ({
      ...prev,
      [sectionIndex]: slideIndex
    }));
  };

  useEffect(() => {
    // Запазваме текущия URL за споделяне с абсолютен път
    setCurrentUrl(window.location.origin + window.location.pathname);
  
    const loadArticle = async () => {
      setIsLoading(true);
      
      try {
        // Първо проверяваме дали имаме статии в контекста за намиране на ID по slug
        let articleId = null;
        
        if (articlesLoaded && articles.length > 0) {
          // Търсим статията по slug в кешираните статии
          const cachedArticle = articles.find(a => a.slug === slug);
          if (cachedArticle) {
            articleId = cachedArticle.id;
          }
        }
        
        // Ако не намерим ID в кеша, правим заявка за всички статии
        if (!articleId) {
          const allArticles = await getAllArticles();
          const foundArticle = allArticles.find(a => a.slug === slug);
          if (foundArticle) {
            articleId = foundArticle.id;
          }
        }
        
        if (articleId) {
          // Зареждаме пълната информация за статията по ID
          const foundArticle = await getArticleById(articleId);
    
          if (foundArticle.error && foundArticle.type === 'ARTICLE_LIMIT_REACHED') {
            showAssistant();
            
            // По-надеждна логика за навигация
            const isDirectAccess = !document.referrer || document.referrer.indexOf(window.location.host) === -1;
            
            if (isDirectAccess) {
              // Ако е директен достъп (няма референт от нашия домейн)
              navigate('/');
            } else {
              // Вместо navigate(-1), отиваме към списъка със статии
              navigate('/articles');
            }
            
            return; // Прекратяваме изпълнението тук
          }
    
          setArticle(foundArticle);
          
          // Останалата част от кода...
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
          
          // Проследяване на посещението
          trackArticle(foundArticle.id, foundArticle.title);
        } else {
          console.error("Статията не е намерена:", slug);
        }
      } catch (error) {
        console.error("Грешка при зареждане на статията:", error);
      
        // Проверяваме за специфична грешка за лимит на статии
        if (error.message === 'ARTICLE_LIMIT_REACHED' || 
            (error.response && error.response.status === 429)) {
          
          // Показваме асистента
          showAssistant();
          
          // По-надеждна логика за навигация при грешка
          const isArticlesList = location.pathname === '/articles';
          
          if (!isArticlesList) {
            // Винаги навигираме към списъка със статии вместо назад,
            // което е по-надеждно от navigate(-1)
            navigate('/articles');
          }
          // Ако вече сме в списъка, просто оставаме там
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadArticle();
  }, [slug, location.key,showAssistant, navigate]);

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
          src={article.mainImage.videoUrl || article.mainImage.sources[0]}
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

  // Рендериране на снимките в секция
  const renderSectionImages = (section, sectionIndex) => {
    // Проверяваме дали има изображения в секцията
    if (!section.sectionImages || section.sectionImages.length === 0) {
      // Обработка за обратна съвместимост - ако имаме едно старо изображение
      if (section.image && section.image.src) {
        return (
          <figure className="section-figure">
            <img src={section.image.src} alt={section.image.alt || `Изображение към ${section.title}`} />
            {section.image.caption && (
              <figcaption>{section.image.caption}</figcaption>
            )}
          </figure>
        );
      }
      return null;
    }

    // Ако има само едно изображение, показваме го директно
    if (section.sectionImages.length === 1) {
      const image = section.sectionImages[0];
      return (
        <figure className="section-figure">
          <img src={image.src} alt={image.alt || `Изображение към ${section.title}`} />
          {image.caption && (
            <figcaption dangerouslySetInnerHTML={{ __html: image.caption }} />
          )}
        </figure>
      );
    }

    // Ако има повече от едно изображение, използваме слайдер
    return (
      <div className="section-slider-container">
        <ImageSlider 
          images={section.sectionImages.map(img => img.src)}
          alt={`Изображения към ${section.title}`}
          onSlideChange={(slideIndex) => handleSectionSlideChange(sectionIndex, slideIndex)}
        />
        
        {/* Показваме caption за текущия слайд */}
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
            <h1 className="article-title-view view">{article.title}</h1>

            <div className="article-summary-view">{renderHtml(article.summary)}</div>
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
                  Свързана статия: {relatedArticle.title}
                </Link>
              </div>
            )}

            <div className="article-body">
              {article.sections.map((section, index) => (
                <section key={index} className="article-section">
                  <h2 className="section-title">{section.title}</h2>
                  <div className="section-content">
                    <div dangerouslySetInnerHTML={{ __html: section.content }} />
                    {renderSectionImages(section, index)}
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
              {previousArticle && (
                <Link to={`/articles/${previousArticle.slug}`} className="prev-article">
                  <FontAwesomeIcon icon={faChevronLeft} />
                  <div className="nav-article-info">
                    <span className="nav-label">Предишна статия</span>
                    <span className="nav-title">{previousArticle.title}</span>
                  </div>
                </Link>
              )}

              {nextArticle && (
                <Link to={`/articles/${nextArticle.slug}`} className="next-article">
                  <div className="nav-article-info">
                    <span className="nav-label">Следваща статия</span>
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
      <ScrollToTop />
    </div>
  );
};

export default ArticleView;