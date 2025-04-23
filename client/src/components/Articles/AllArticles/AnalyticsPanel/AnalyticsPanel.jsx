import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine, faEye, faCalendarAlt, faUser,
  faSync, faExclamationCircle, faClock, faEdit
} from "@fortawesome/free-solid-svg-icons";
import "./analyticsPanel.css";
import { useAnalytics } from "../../../contexts/AnalyticsContext";

const AnalyticsPanel = ({ articleId, articleTitle, articleData }) => {
  const { getViewCount, loadArticleViewCounts } = useAnalytics();
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  useEffect(() => {
    if (articleId) {
      loadArticleViewCounts([articleId]);
    }
  }, [articleId, loadArticleViewCounts]);

  const refreshAnalytics = async () => {
    setIsLoadingStats(true);
    await loadArticleViewCounts([articleId]);
    setIsLoadingStats(false);
  };

  // Форматиране на дата
  const formatDate = (dateString) => {
    if (!dateString) return 'Няма данни';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('bg-BG', options);
  };

  // Изчисляване на време от създаване до сега
  const calculateTimeAgo = (dateString) => {
    if (!dateString) return 'Няма данни';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days > 30) {
      const months = Math.floor(days / 30);
      return `${months} ${months === 1 ? 'месец' : 'месеца'} назад`;
    }
    return `${days} ${days === 1 ? 'ден' : 'дни'} назад`;
  };

  const viewCount = getViewCount(articleId) || 0;
  
  // Изчисляване на средно дневно посещения
  const calculateDailyViews = () => {
    if (!articleData || !articleData.publishDate) return 0;
    
    const publishDate = new Date(articleData.publishDate);
    const now = new Date();
    const diffDays = Math.max(1, Math.ceil((now - publishDate) / (1000 * 60 * 60 * 24)));
    
    return (viewCount / diffDays).toFixed(1);
  };
  
  // Брой редакции
  const getEditsCount = () => {
    if (!articleData) return 0;
    return articleData.edits ? articleData.edits.length : (articleData.updateAt ? 1 : 0);
  };

  return (
    <div className="analytics-panel">
      <div className="analytics-header">
        <h2><FontAwesomeIcon icon={faChartLine} /> Информация за статията</h2>
      </div>
      
      <div className="analytics-overview">
        <div className="metric-card primary">
          <div className="metric-icon">
            <FontAwesomeIcon icon={faEye} />
          </div>
          <div className="metric-content">
            <h3>Общо прегледи</h3>
            <div className="metric-value">{viewCount}</div>
          </div>
        </div>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div className="metric-content">
              <h3>Дневни прегледи</h3>
              <div className="metric-value">{calculateDailyViews()}</div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">
              <FontAwesomeIcon icon={faEdit} />
            </div>
            <div className="metric-content">
              <h3>Редакции</h3>
              <div className="metric-value">{getEditsCount()}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="analytics-section">
        <h3><FontAwesomeIcon icon={faCalendarAlt} /> Времева линия</h3>
        
        <div className="timeline-list">
          <div className="timeline-item">
            <div className="timeline-label">Създадена</div>
            <div className="timeline-value">{formatDate(articleData?.publishDate)}</div>
            <div className="timeline-ago">{calculateTimeAgo(articleData?.publishDate)}</div>
          </div>
          
          {articleData?.updateAt && (
            <div className="timeline-item">
              <div className="timeline-label">Последна редакция</div>
              <div className="timeline-value">{formatDate(articleData.updateAt)}</div>
              <div className="timeline-ago">{calculateTimeAgo(articleData.updateAt)}</div>
            </div>
          )}
        </div>
      </div>
      
      <div className="analytics-info">
        <p className="analytics-note">
          Данните за преглеждания се обновяват автоматично и се проследяват чрез Google Analytics (G-GE8XZREVM6).
        </p>
      </div>
      
      <button 
        className="refresh-button" 
        onClick={refreshAnalytics}
        disabled={isLoadingStats}
      >
        <FontAwesomeIcon icon={faSync} spin={isLoadingStats} /> 
        {isLoadingStats ? 'Обновяване...' : 'Обнови данните'}
      </button>
    </div>
  );
};

export default AnalyticsPanel;