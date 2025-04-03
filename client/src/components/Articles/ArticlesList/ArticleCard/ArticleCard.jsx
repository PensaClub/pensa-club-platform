
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImages, faPlayCircle, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import './articleCard.css';

export const ArticleCard = ({ article, featured = false }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('bg-BG', options);
  };

  // Проверява дали URL е външен (започва с http или https)
  const isExternalUrl = (url) => {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  };

  // Получава правилния URL източник (локален или външен)
  const getImageSource = () => {
    if (article.mainImage.type === 'video') {
      return article.mainImage.thumbnail;
    } else {
      // Ако първият източник е URL, връща го директно, иначе третира като локален път
      const source = article.mainImage.sources[0];
      return source;
    }
  };

  // Определя дали изображението е външен ресурс
  const isExternalResource = isExternalUrl(getImageSource());

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
                <span>{article.mainImage.sources.length} снимки</span>
              </div>
            )}
            {article.mainImage.type === 'video' && (
              <div className="media-badge video-badge">
                <FontAwesomeIcon icon={faPlayCircle} />
                <span>Видео</span>
              </div>
            )}
            {isExternalResource && (
              <div className="media-badge external-badge">
                <FontAwesomeIcon icon={faExternalLinkAlt} />
                <span>Външен източник</span>
              </div>
            )}
          </Link>
        </div>
        
        {article.mainImage.alt && (
          <div className="image-alt-caption">
            {article.mainImage.alt}
          </div>
        )}
        
        <div className="article-card-content">
          <Link to={`/articles/${article.slug}`} className="title-link">
            <h2 className="article-title">{article.title}</h2>
          </Link>
          
          <p className="article-excerpt">{article.summary}</p>
          
          <div className="article-tags-card">
            {article.tags && article.tags.map((tag, index) => (
              index < 3 && <span key={index} className="tag">{tag}</span>
            ))}
            {article.tags && article.tags.length > 3 && (
              <span className="tag-more">+{article.tags.length - 3}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};