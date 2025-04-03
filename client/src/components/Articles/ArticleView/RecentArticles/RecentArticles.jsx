import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import './recentArticles.css';
import { getRecentArticles } from '../../data/articlesData';

const RecentArticles = ({ currentArticleId }) => {
  const [recentArticles, setRecentArticles] = useState([]);

  useEffect(() => {
    // Получаваме всички скорошни статии, но изключваме текущата
    const articles = getRecentArticles(6).filter(
      article => article.id !== currentArticleId
    ).slice(0, 5); // Вземаме максимум 5 статии
    
    setRecentArticles(articles);
  }, [currentArticleId]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('bg-BG', options);
  };

  return (
    <div className="recent-articles">
      <h3 className="recent-articles-title">Последни публикации</h3>
      
      <div className="recent-articles-list">
        {recentArticles.map(article => (
          <div className="recent-article-item" key={article.id}>
            <Link to={`/articles/${article.slug}`} className="recent-article-link">
              <div className="recent-article-image">
                <img 
                  src={article.mainImage.type === 'video' ? 
                    article.mainImage.thumbnail : 
                    article.mainImage.sources[0]} 
                  alt={article.title} 
                />
              </div>
              <div className="recent-article-content">
                <h4 className="recent-article-title">{article.title}</h4>
                <div className="recent-article-date">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <span>{formatDate(article.publishDate)}</span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentArticles;