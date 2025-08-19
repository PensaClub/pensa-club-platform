import React from 'react';
import { useTranslation } from 'react-i18next';
import './publicationStoriesFilters.css';

export const PublicationStoriesFilters = ({
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  selectedCategory,
  setSelectedCategory,
  contentCount,
  contentType = 'publications'
}) => {
  const { t } = useTranslation();

  const sortOptions = [
    { value: 'newest', label: t('publicationStories.filters.sort.newest') },
    { value: 'oldest', label: t('publicationStories.filters.sort.oldest') },
    { value: 'mostViewed', label: t('publicationStories.filters.sort.mostViewed') },
    { value: 'alphabetical', label: t('publicationStories.filters.sort.alphabetical') }
  ];

  const getCategoryOptions = () => {
    if (contentType === 'publications') {
      return [
        { value: 'all', label: t('publicationStories.filters.category.publications.all') },
        { value: 'ръководства', label: t('publicationStories.filters.category.publications.guides') },
        { value: 'безопасност', label: t('publicationStories.filters.category.publications.security') },
        { value: 'изследвания', label: t('publicationStories.filters.category.publications.research') },
        { value: 'политики', label: t('publicationStories.filters.category.publications.policy') }
      ];
    } else {
      return [
        { value: 'all', label: t('publicationStories.filters.category.stories.all') },
        { value: 'успешни истории', label: t('publicationStories.filters.category.stories.success') },
        { value: 'обучение', label: t('publicationStories.filters.category.stories.education') },
        { value: 'общност', label: t('publicationStories.filters.category.stories.community') },
        { value: 'технологии', label: t('publicationStories.filters.category.stories.technology') }
      ];
    }
  };

  const categoryOptions = getCategoryOptions();

  return (
    <div className="publication-stories-filters-modern">
      <div className="publication-stories-filters-top-row">
        <div className="publication-stories-filters-left">
          <div className="publication-stories-results-count">
            <span className="publication-stories-count-number">{contentCount}</span>
            <span className="publication-stories-count-text">{t(`publicationStories.filters.resultsCount.${contentType}`)}</span>
          </div>
        </div>

        <div className="publication-stories-filters-right">
          <div className="publication-stories-view-mode-toggle">
            <button
              className={`publication-stories-view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title={t('publicationStories.filters.viewMode.grid')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            <button
              className={`publication-stories-view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title={t('publicationStories.filters.viewMode.list')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="publication-stories-filters-bottom-row">
        <div className="publication-stories-filter-group">
          <label className="publication-stories-filter-label">{t('publicationStories.filters.category.label')}</label>
          <select
            className="publication-stories-filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="publication-stories-filter-group">
          <label className="publication-stories-filter-label">{t('publicationStories.filters.sort.label')}</label>
          <select
            className="publication-stories-filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};