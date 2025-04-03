
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  faLinkedinIn 
} from '@fortawesome/free-brands-svg-icons';
import './articleView.css';
import { getArticleBySlug } from '../data/articlesData';
import RecentArticles from './RecentArticles/RecentArticles';

const ArticleView = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);
  useEffect(() => {
    // Симулираме API заявка чрез нашите мокнати данни
    setLoading(true);
    const foundArticle = getArticleBySlug(slug);
    
    setTimeout(() => {
      setArticle(foundArticle);
      setLoading(false);
      window.scrollTo(0, 0);
    }, 300);
  }, [slug]);
// da se sloji na6iqt loader
  if (loading) {
    return (
      <div className="article-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

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

  // Функция за рендериране на главното медия (снимка, слайдер или видео)
  const renderMainMedia = () => {
    if (article.mainImage.type === 'slider' && article.mainImage.sources.length > 1) {
      // Тук ще бъде слайдерът - за момента показваме само първата снимка
      return (
        <div className="article-main-image">
          <img src={article.mainImage.sources[0]} alt={article.mainImage.alt} />
          <div className="image-slider-indicator">
            <span>1/{article.mainImage.sources.length}</span>
          </div>
        </div>
      );
    } else if (article.mainImage.type === 'video') {
      // Тук ще бъде видео плейърът - за момента показваме thumbnail
      return (
        <div className="article-main-video">
          <img src={article.mainImage.thumbnail} alt={article.mainImage.alt} />
          <div className="video-play-button">
            <span>▶</span>
          </div>
        </div>
      );
    } else {
      // Обикновена снимка
      return (
        <div className="article-main-image">
          <img src={article.mainImage.sources[0]} alt={article.mainImage.alt} />
        </div>
      );
    }
  };

  return (
    <div className="article-main">
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
              <Link to="#" className="social-icon facebook">
                <FontAwesomeIcon icon={faFacebookF} />
              </Link>
              <Link to="#" className="social-icon twitter">
                <FontAwesomeIcon icon={faTwitter} />
              </Link>
              <Link to="#" className="social-icon linkedin">
                <FontAwesomeIcon icon={faLinkedinIn} />
              </Link>
            </div>
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
    </div>
  );
};

export default ArticleView;