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
import { ViewedPublicationsManager } from '../../../../utils/viewedPublications';

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
  const [viewedPublications, setViewedPublications] = useState([]);

  // Pagination states
  const [paginationInfo, setPaginationInfo] = useState(null);
  const [paginationLoading, setPaginationLoading] = useState(false);

  const contentType = useMemo(() => {
    if (location.pathname.includes('/publications')) return 'publications';
    if (location.pathname.includes('/stories')) return 'stories';
    return 'publications';
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

  const getAllStories = useCallback(async () => {
    try {
      setIsInitialLoad(true);
      console.warn('getAllStories функция не е имплементирана в InitiativeProvider');
      setStories([]);
    } catch (error) {
      console.error('Error loading stories:', error);
      setStories([]);
    } finally {
      setIsInitialLoad(false);
    }
  }, []);

  const contentData = useMemo(() => {
    if (contentType === 'stories') {
      return stories || [];
    }
    return publications || [];
  }, [contentType, publications, stories]);

  // Load initial data
  useEffect(() => {
    if (contentType === 'publications') {
      loadPage(1);
    } else if (contentType === 'stories') {
      getAllStories();
    }
  }, [contentType]);

  // Load specific page
  const loadPage = useCallback(async (page) => {
    try {
      setPaginationLoading(true);
      const response = await getAllPublications(page, true, false); // ВИНАГИ forceRefresh за нова страница

      if (response && response.pagination) {
        setPaginationInfo(response.pagination);
      }
    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      setPaginationLoading(false);
    }
  }, [getAllPublications]);

  // Initialize viewed publications САМО ВЕДНЪЖ
  useEffect(() => {
    if (contentData.length > 0) {
      setIsInitialLoad(false);

      // Зареждаме само реално разгледани публикации (не инициализираме с фалшиви)
      const existingViewed = ViewedPublicationsManager.getViewedPublications();
      setViewedPublications(existingViewed);

      const contentIds = contentData.map(item => item.id);
      if (contentType === 'publications') {
        loadContentViewCounts(contentIds, 'publication');
      } else {
        loadContentViewCounts(contentIds, 'story');
      }
    }
  }, [contentData, contentType]);

  // Проверяваме за нови viewed publications периодично
  useEffect(() => {
    const checkForNewViewed = () => {
      const currentViewed = ViewedPublicationsManager.getViewedPublications();
      if (currentViewed.length !== viewedPublications.length) {
        setViewedPublications(currentViewed);
      }
    };

    const interval = setInterval(checkForNewViewed, 2000);
    return () => clearInterval(interval);
  }, [viewedPublications.length]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const handleFilter = useCallback((filtered) => {
    setFilteredContent(filtered);
    setIsFiltering(filtered.length !== contentData.length);
  }, [contentData.length]);

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
  }, [filteredContent, contentData, isFiltering, sortBy, contentType]);

  useEffect(() => {
    if (!isFiltering) {
      setFilteredContent(contentData);
    }
  }, [contentData, isFiltering]);

  const displayedContent = sortedContent;
  const featuredPublication = displayedContent[0];
  const remainingPublications = displayedContent.slice(1);

  // 🔧 ПОПРАВЕНА ЛОГИКА - ВИНАГИ показваме всички останали публикации
  const allPublicationsForGrid = displayedContent;

  // Recently Viewed - показваме само ако има РЕАЛНО разгледани публикации
  const shouldShowRecentlyViewed = viewedPublications.length > 0;

  // Филтрираме recently viewed да не включва featured публикацията
  const filteredViewedPublications = viewedPublications.filter(viewed =>
    viewed.id !== featuredPublication?.id
  );

  // Pagination component
  const renderPagination = () => {
    if (!paginationInfo || paginationInfo.totalPages <= 1) return null;

    const { page: currentPage, totalPages } = paginationInfo;
    const pages = [];

    // Показваме максимум 7 страници наведнъж
    let startPage = Math.max(1, currentPage - 3);
    let endPage = Math.min(totalPages, currentPage + 3);

    // Ако сме в началото, показваме повече страници напред
    if (currentPage <= 4) {
      endPage = Math.min(totalPages, 7);
    }

    // Ако сме в края, показваме повече страници назад
    if (currentPage > totalPages - 4) {
      startPage = Math.max(1, totalPages - 6);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="ps-pagination-numbers">
        <button
          className={`ps-pagination-btn ps-pagination-prev ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={() => currentPage > 1 && loadPage(currentPage - 1)}
          disabled={currentPage === 1 || paginationLoading}
        >
          ‹ {t('publicationStories.pagination.previous')}
        </button>

        <div className="ps-pagination-pages">
          {/* Първа страница */}
          {startPage > 1 && (
            <>
              <button
                className="ps-pagination-page"
                onClick={() => loadPage(1)}
                disabled={paginationLoading}
              >
                1
              </button>
              {startPage > 2 && <span className="ps-pagination-ellipsis">...</span>}
            </>
          )}

          {/* Страници */}
          {pages.map(pageNum => (
            <button
              key={pageNum}
              className={`ps-pagination-page ${pageNum === currentPage ? 'active' : ''}`}
              onClick={() => pageNum !== currentPage && loadPage(pageNum)}
              disabled={paginationLoading}
            >
              {pageNum}
            </button>
          ))}

          {/* Последна страница */}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="ps-pagination-ellipsis">...</span>}
              <button
                className="ps-pagination-page"
                onClick={() => loadPage(totalPages)}
                disabled={paginationLoading}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          className={`ps-pagination-btn ps-pagination-next ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={() => currentPage < totalPages && loadPage(currentPage + 1)}
          disabled={currentPage === totalPages || paginationLoading}
        >
          {t('publicationStories.pagination.next')} ›
        </button>
      </div>
    );
  };

  return (
    <div className="ps-layout-new">
      <PublicationStoriesHero contentType={contentType} />

      {/* Toolbar */}
      <div className="ps-toolbar">
        <div className="ps-toolbar-container">
          <div className="ps-toolbar-left">
            <PublicationStoriesSearch
              content={contentData}
              onFilter={handleFilter}
              contentType={contentType}
            />
          </div>
          <div className="ps-toolbar-right">
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
      </div>

      {/* Main Content */}
      <div className="ps-main-content">
        <div className="ps-content-wrapper">
          {(isInitialLoad || isLoading) && contentData.length === 0 ? (
            <div className="ps-skeleton-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonPublicationStoriesCard key={index} viewMode="grid" />
              ))}
            </div>
          ) : displayedContent.length > 0 ? (
            <>
              {/* Featured Publication */}
              {featuredPublication && (
                <section className="ps-featured-section">
                  <h2 className="ps-section-title">
                    {t('publicationStories.sections.featured')}
                  </h2>
                  <div className="ps-featured-wrapper">
                    <PublicationStoriesCard
                      content={featuredPublication}
                      isFeatured={true}
                      viewMode="featured"
                      contentType={contentType}
                      index={0}
                    />
                  </div>
                </section>
              )}

              {/* Recently Viewed Section - САМО ако има реално разгледани */}
              {shouldShowRecentlyViewed && filteredViewedPublications.length > 0 && (
                <section className="ps-recently-viewed-section">
                  <h2 className="ps-section-title">
                    {t('publicationStories.sections.recentlyViewed')}
                  </h2>
                  <div className="ps-recently-viewed-grid">
                    {filteredViewedPublications.map((publication, index) => (
                      <PublicationStoriesCard
                        key={`viewed-${publication.id}`}
                        content={publication}
                        isFeatured={false}
                        viewMode="compact"
                        contentType={contentType}
                        index={index}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* All Publications Section - ВИНАГИ се показва */}
              <section className="ps-all-publications-section">
                <h2 className="ps-section-title">
                  {t('publicationStories.sections.allPublications')}
                </h2>
                {allPublicationsForGrid.length > 0 ? (
                  <div className={`ps-content-${viewMode}`}> {/* 🔧 ПРОМЕНЕНО */}
                    {allPublicationsForGrid.map((content, index) => (
                      <PublicationStoriesCard
                        key={content.id}
                        content={content}
                        isFeatured={false}
                        viewMode={viewMode === 'list' ? 'list' : 'standard'} 
                        contentType={contentType}
                        index={index + 1}
                      />
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                    Няма други публикации на тази страница.
                  </p>
                )}

                {/* Pagination */}
                {renderPagination()}
              </section>

              {/* Pagination Info */}
              {paginationInfo && (
                <div className="ps-pagination-info">
                  <span>
                    {t('publicationStories.pagination.showing')} {((paginationInfo.page - 1) * 6) + 1} - {Math.min(paginationInfo.page * 6, paginationInfo.totalPublications)} {t('publicationStories.pagination.of')} {paginationInfo.totalPublications} {t(`publicationStories.pagination.${contentType}`)}
                  </span>
                </div>
              )}
            </>
          ) : !isInitialLoad && !isLoading && (
            <div className="ps-empty-state">
              <div className="ps-empty-icon">
                {contentType === 'publications' ? (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" />
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ) : (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="2" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </div>
              <h3>{t(`publicationStories.noResults.${contentType}.title`)}</h3>
              <p>{t(`publicationStories.noResults.${contentType}.description`)}</p>
            </div>
          )}
        </div>
        <ScrollToTop />
      </div>
    </div>
  );
};

export default PublicationStoriesList;