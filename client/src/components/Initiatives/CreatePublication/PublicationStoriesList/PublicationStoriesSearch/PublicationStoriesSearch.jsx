import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './publicationStoriesSearch.css';

export const PublicationStoriesSearch = ({ content, onFilter, contentType = 'publications' }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

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
      
      // За stories търсим и в sections
      let sectionsMatch = false;
      if (contentType === 'stories' && item.sections) {
        sectionsMatch = item.sections.some(section => 
          section.title.toLowerCase().includes(term.toLowerCase()) ||
          section.content.toLowerCase().includes(term.toLowerCase())
        );
      }

      // За publications търсим и в автор
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
    setIsSearchActive(false);
    onFilter(content);
  };

  const getResultsCount = () => {
    if (!searchTerm.trim()) return content.length;
    
    const filtered = content.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = (item.shortDescription || item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = (item.category || '').toLowerCase().includes(searchTerm.toLowerCase());
      const tagsMatch = item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) || false;
      
      let sectionsMatch = false;
      if (contentType === 'stories' && item.sections) {
        sectionsMatch = item.sections.some(section => 
          section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          section.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      let authorMatch = false;
      if (contentType === 'publications') {
        authorMatch = (item.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        authorMatch = (item.author || '').toLowerCase().includes(searchTerm.toLowerCase());
      }

      return titleMatch || descMatch || categoryMatch || tagsMatch || sectionsMatch || authorMatch;
    });

    return filtered.length;
  };

  return (
    <div className="publication-stories-search-modern">
      <div className="publication-stories-search-wrapper">
        <div className="publication-stories-search-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        
        <input
          type="text"
          className="publication-stories-search-input"
          placeholder={t(`publicationStories.search.${contentType}.placeholder`)}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsSearchActive(!!e.target.value);
          }}
          onFocus={() => setIsSearchActive(true)}
          onBlur={() => setIsSearchActive(!!searchTerm)}
        />
        
        {searchTerm && (
          <button
            className="publication-stories-search-clear"
            onClick={handleClearSearch}
            title={t('publicationStories.search.clear')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        )}
      </div>
      
      {isSearchActive && searchTerm && (
        <div className="publication-stories-search-info">
          <div className="publication-stories-search-info-content">
            <span className="publication-stories-search-info-text">
              {t('publicationStories.search.searching')} "<strong>{searchTerm}</strong>"
            </span>
            <span className="publication-stories-search-results-count">
              {getResultsCount()} {t(`publicationStories.search.results.${contentType}`)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};