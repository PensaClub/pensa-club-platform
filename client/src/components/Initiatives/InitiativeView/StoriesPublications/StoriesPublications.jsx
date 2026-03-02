import React, { useState } from 'react';
import './storiesPublications.css';
import { useTranslation } from 'react-i18next';
import { truncateText } from '../../../../utils/truncateText';

export const StoriesPublications = ({ stories = [], publications = [], showInProjectView = false }) => {
  const { t } = useTranslation('content');
  const [visibleCount, setVisibleCount] = useState(6);

  // Комбинирани stories и publications с тип
  const allItems = [
    ...stories.map(item => ({ ...item, type: 'story' })),
    ...publications.map(item => ({ ...item, type: 'publication' }))
  ].sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));

  const visibleItems = allItems.slice(0, visibleCount);
  const hasMore = allItems.length > visibleCount;

  const loadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const getTypeLabel = (type) => {
    return type === 'story' 
      ? t('initiatives.storiesPublications.story') 
      : t('initiatives.storiesPublications.publication');
  };

  const getTypeColor = (type) => {
    return type === 'story' ? '#E26020' : '#1B8B8A';
  };

  if (allItems.length === 0) {
    return null;
  }

  // Условни CSS класове за project view
  const containerClass = showInProjectView 
    ? 'stories-publications project-view-stories-publications' 
    : 'stories-publications';
  
  const gridClass = showInProjectView 
    ? 'stories-grid project-view-stories-grid' 
    : 'stories-grid';
  
  const cardClass = showInProjectView 
    ? 'story-card project-view-story-card' 
    : 'story-card';
  
  const imageClass = showInProjectView 
    ? 'story-image project-view-story-image' 
    : 'story-image';

  return (
    <section id="stories" className={containerClass}>
      <h2 className="section-title">
        {t('initiatives.storiesPublications.title')}
      </h2>
      
      <div className={gridClass}>
        {visibleItems.map((item, index) => (
          <article key={`${item.id}-${index}`|| index} className={cardClass}>
            {item.image && (
              <div className={imageClass}>
                <img src={item.image.src} alt={item.image.alt} />
                <div className="story-type-badge" style={{ backgroundColor: getTypeColor(item.type) }}>
                  {getTypeLabel(item.type)}
                </div>
                
                {/* Добавяме caption ако съществува */}
                {item.image.caption && (
                  <div className={showInProjectView 
                    ? 'story-image-caption project-view-stories-image-caption' 
                    : 'story-image-caption'}>
                    {item.image.caption}
                  </div>
                )}
              </div>
            )}
            
            <div className="story-content">
              <h3 className="story-title">
                <a href={item.link || '#'} className="story-link">
                  {item.title}
                </a>
              </h3>
              
              <p className="story-description">
                {truncateText(item.description, 60) || item.excerpt}
              </p>
              
              <div className="story-meta">
                <span className="story-date">
                  {new Date(item.publishedAt || item.createdAt).toLocaleDateString('bg-BG')}
                </span>
                
                {item.author && (
                  <span className="story-author">
                    {t('initiatives.storiesPublications.by', 'от')} {item.author}
                  </span>
                )}
              </div>
              
              <a href={item.link || '#'} className="read-more-link">
                <span className="read-icon">👁️</span>
                {t('initiatives.storiesPublications.readMore')}
              </a>
            </div>
          </article>
        ))}
      </div>
      
      {hasMore && (
        <div className="load-more-section">
          <button onClick={loadMore} className="load-more-btn">
            <span className="plus-icon">+</span>
            {t('initiatives.storiesPublications.loadMore')}
          </button>
        </div>
      )}
    </section>
  );
};