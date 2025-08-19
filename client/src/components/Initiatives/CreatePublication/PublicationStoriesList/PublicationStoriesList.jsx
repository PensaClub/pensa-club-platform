/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import './publicationStoriesList.css';
import { useTranslation } from 'react-i18next';
import { PublicationStoriesCard } from './PublicationStoriesCard/PublicationStoriesCard';
import { PublicationStoriesSearch } from './PublicationStoriesSearch/PublicationStoriesSearch';
import { PublicationStoriesFilters } from './PublicationStoriesFilters/PublicationStoriesFilters';
import ScrollToTop from '../../../ScrollToTop/ScrollToTop';
import { PublicationStoriesHero } from './PublicationStoriesHero/PublicationStoriesHero';
import { SkeletonPublicationStoriesCard } from './SkeletonPublicationStoriesCard/SkeletonPublicationStoriesCard';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import { useAnalytics } from '../../../contexts/AnalyticsContext';

const PublicationStoriesList = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [filteredContent, setFilteredContent] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stories, setStories] = useState([]);

  // Определяваме типа съдържание от URL
  const contentType = useMemo(() => {
    if (location.pathname.includes('/publications')) return 'publications';
    if (location.pathname.includes('/stories')) return 'stories';
    return 'publications'; // default
  }, [location.pathname]);

  const {
    getAllPublications,
    publications,
    isLoading
  } = useInitiativeContext();

  const { 
    loadContentViewCounts, 
    getPublicationViewCount, 
    getStoryViewCount 
  } = useAnalytics();

  // Функция за зареждане на stories (ще трябва да добавиш getAllStories в InitiativeProvider)
  const getAllStories = useCallback(async () => {
    try {
      setIsInitialLoad(true);
      // TODO: Добави getAllStories функция в InitiativeProvider
      // const response = await storyService.getAllStories();
      // setStories(response.data || []);
      
      // Временно - ако няма API endpoint за stories, използваме празен масив
      console.warn('getAllStories функция не е имплементирана в InitiativeProvider');
      setStories([]);
    } catch (error) {
      console.error('Error loading stories:', error);
      setStories([]);
    } finally {
      setIsInitialLoad(false);
    }
  }, []);

  // Получаваме данните според типа
  const contentData = useMemo(() => {
    if (contentType === 'stories') {
      return stories || [];
    }
    return publications || [];
  }, [contentType, publications, stories]);

  useEffect(() => {
    // Зареждаме данни според типа
    if (contentType === 'publications') {
      getAllPublications(1, true, false);
    } else if (contentType === 'stories') {
      getAllStories();
    }
  }, [contentType]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Зареждаме view counts когато данните са готови
  useEffect(() => {
    if (contentData.length > 0) {
      setIsInitialLoad(false);
      const contentIds = contentData.map(item => item.id);
      if (contentType === 'publications') {
        loadContentViewCounts(contentIds, 'publication');
      } else {
        loadContentViewCounts(contentIds, 'story');
      }
    }
  }, [contentData, loadContentViewCounts, contentType]);

  const handleFilter = useCallback((filtered) => {
    setFilteredContent(filtered);
    setIsFiltering(filtered.length !== contentData.length);
  }, [contentData.length]);

  // Сортиране според типа съдържание
  const sortedContent = useMemo(() => {
    const contentToSort = isFiltering ? filteredContent : contentData;
    
    switch (sortBy) {
      case 'newest':
        return [...contentToSort].sort((a, b) => 
          new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)
        );
      case 'oldest':
        return [...contentToSort].sort((a, b) => 
          new Date(a.publishedAt || a.createdAt) - new Date(b.publishedAt || b.createdAt)
        );
      case 'mostViewed':
        return [...contentToSort].sort((a, b) => {
          const aViews = contentType === 'publications' 
            ? getPublicationViewCount(a.id) 
            : getStoryViewCount(a.id);
          const bViews = contentType === 'publications' 
            ? getPublicationViewCount(b.id) 
            : getStoryViewCount(b.id);
          return bViews - aViews;
        });
      case 'alphabetical':
        return [...contentToSort].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return contentToSort;
    }
  }, [filteredContent, contentData, isFiltering, sortBy, getPublicationViewCount, getStoryViewCount, contentType]);

  useEffect(() => {
    if (!isFiltering) {
      setFilteredContent(contentData);
    }
  }, [contentData, isFiltering]);

  const displayedContent = sortedContent;

  return (
    <div className="publication-stories-list-modern">
      <PublicationStoriesHero contentType={contentType} />
      
      <div className="publication-stories-search-section">
        <div className="publication-stories-search-container">
          <PublicationStoriesSearch
            content={contentData}
            onFilter={handleFilter}
            contentType={contentType}
          />
          <PublicationStoriesFilters
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            contentCount={displayedContent.length}
            contentType={contentType}
          />
        </div>
      </div>

      <div className="publication-stories-content-section">
        <div className="publication-stories-content-wrapper">
          {/* Loading state */}
          {(isInitialLoad || isLoading) && contentData.length === 0 ? (
            <div className={`publication-stories-skeleton-grid ${viewMode}`}>
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonPublicationStoriesCard key={index} viewMode={viewMode} />
              ))}
            </div>
          ) : displayedContent.length > 0 ? (
            <>
              {/* Featured content - първото получава специално третиране в grid режим */}
              {viewMode === 'grid' && displayedContent.length > 0 && (
                <div className="publication-stories-featured-section">
                  <div className="publication-stories-featured-wrapper">
                    <PublicationStoriesCard
                      content={displayedContent[0]}
                      isFeatured={true}
                      viewMode="featured"
                      contentType={contentType}
                      index={0}
                    />
                  </div>
                </div>
              )}

              {/* Content grid/list */}
              <div className={`publication-stories-cards-container ${viewMode}`}>
                {viewMode === 'grid' ? (
                  <div className="publication-stories-cards-grid">
                    {displayedContent.slice(displayedContent.length > 0 ? 1 : 0).map((content, index) => (
                      <PublicationStoriesCard
                        key={content.id}
                        content={content}
                        isFeatured={false}
                        viewMode="grid"
                        contentType={contentType}
                        index={index + 1}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="publication-stories-cards-list">
                    {displayedContent.map((content, index) => (
                      <PublicationStoriesCard
                        key={content.id}
                        content={content}
                        isFeatured={false}
                        viewMode="list"
                        contentType={contentType}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : !isInitialLoad && !isLoading && (
            <div className="publication-stories-no-results">
              <div className="publication-stories-no-results-content">
                <div className="publication-stories-no-results-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    {contentType === 'publications' ? (
                      <>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                      </>
                    ) : (
                      <>
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="2"/>
                      </>
                    )}
                  </svg>
                </div>
                <h3>{t(`publicationStories.noResults.${contentType}.title`)}</h3>
                <p>{t(`publicationStories.noResults.${contentType}.description`)}</p>
              </div>
            </div>
          )}
        </div>

        <ScrollToTop />
      </div>
    </div>
  );
};

export default PublicationStoriesList;