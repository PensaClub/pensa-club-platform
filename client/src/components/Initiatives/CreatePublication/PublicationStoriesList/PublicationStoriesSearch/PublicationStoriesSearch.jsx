import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './publicationStoriesSearch.css';

export const PublicationStoriesSearch = ({ content, onFilter, contentType = 'publications' }) => {
  const { t } = useTranslation('content');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const filterContent = useCallback((term) => {
    if (!term.trim()) {
      onFilter(content);
      return;
    }

    const filtered = content.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(term.toLowerCase());
      const descMatch = (item.shortDescription || item.description || '').toLowerCase().includes(term.toLowerCase());
      const categoryMatch = (item.category || '').toLowerCase().includes(term.toLowerCase());
      const tagsMatch = item.tags?.some(tag => tag.toLowerCase().includes(term.toLowerCase())) || false;
      
      let sectionsMatch = false;
      if (contentType === 'stories' && item.sections) {
        sectionsMatch = item.sections.some(section => 
          section.title.toLowerCase().includes(term.toLowerCase()) ||
          section.content.toLowerCase().includes(term.toLowerCase())
        );
      }

      let authorMatch = false;
      if (contentType === 'publications') {
        authorMatch = (item.userEmail || '').toLowerCase().includes(term.toLowerCase());
      } else {
        authorMatch = (item.author || '').toLowerCase().includes(term.toLowerCase());
      }

      return titleMatch || descMatch || categoryMatch || tagsMatch || sectionsMatch || authorMatch;
    });

    onFilter(filtered);
  }, [content, onFilter, contentType]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      filterContent(searchTerm);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, filterContent]);

  const handleClearSearch = () => {
    setSearchTerm('');
    onFilter(content);
  };

  return (
    <div className="ps-search-new">
      <div className={`ps-search-input-wrapper ${isFocused ? 'focused' : ''} ${searchTerm ? 'has-value' : ''}`}>
        <div className="ps-search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        
        <input
          type="text"
          className="ps-search-input"
          placeholder={t(`publicationStories.search.${contentType}.placeholder`)}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {searchTerm && (
          <button
            className="ps-search-clear"
            onClick={handleClearSearch}
            title={t('publicationStories.search.clear')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        )}
      </div>
      
      {searchTerm && (
        <div className="ps-search-results-indicator">
          <span>{content.filter(item => {
            const titleMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
            const descMatch = (item.shortDescription || item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            return titleMatch || descMatch;
          }).length} results</span>
        </div>
      )}
    </div>
  );
};