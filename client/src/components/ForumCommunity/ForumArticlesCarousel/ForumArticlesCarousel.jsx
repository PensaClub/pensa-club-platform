import { useState, useEffect } from 'react';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { forumServiceFactory } from '../../Services/forumServiceFactory';
import { Clock } from 'lucide-react';
import './forumArticlesCarousel.css';

const ForumArticlesCarousel = () => {
  const [articles, setArticles] = useState([]);
  const navigate = useLocalizedNavigate();
  const service = forumServiceFactory();

  useEffect(() => {
    service.getRecentArticles().then(data => setArticles(data.articles || [])).catch(() => {});
  }, []);

  if (articles.length === 0) return null;

  const timeAgo = (date) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (days < 1) return 'днес';
    if (days === 1) return 'вчера';
    return `${days} д`;
  };

  return (
    <div className="fac-list">
      {articles.map(a => (
        <button key={a.id} className="fac-item" onClick={() => navigate(`/articles/${a.slug}`)}>
          {a.imageUrl && <img src={a.imageUrl} alt="" className="fac-thumb" loading="lazy" />}
          <div className="fac-info">
            <span className="fac-item-title">{a.title}</span>
            <span className="fac-date"><Clock size={10} /> {timeAgo(a.createdAt)}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ForumArticlesCarousel;
