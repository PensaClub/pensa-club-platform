/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import './initiativesList.css';
import { useTranslation } from 'react-i18next';
import { InitiativeCard } from './InitiativeCard/InitiativeCard';
import { InitiativesSearch } from '../InitiativesSearch/InitiativesSearch';
import { InitiativesMap } from './InitiativesMap/InitiativesMap';
import { useInitiativeContext } from '../../contexts/InitiativeProvider';
import ScrollToTop from '../../ScrollToTop/ScrollToTop';
import { InitiativesHero } from './InitiativesHero/InitiativesHero';
import { SkeletonCardInitiative } from './SkeletonCardInitiative/SkeletonCardInitiative';

const InitiativesList = () => {
  const { t } = useTranslation();
  const [filteredInitiatives, setFilteredInitiatives] = useState([]);
  const { toggleBookmark, bookmarkedInitiatives } = useInitiativeContext();
  const [isFiltering, setIsFiltering] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // НОВО!

  const {
    initiatives,
    getAllInitiatives,
    loadMoreInitiatives,
    hasMore,
    isLoading
  } = useInitiativeContext();

  useEffect(() => {
    getAllInitiatives(1);
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Когато инициативите се заредят, спираме initial load
  useEffect(() => {
    if (initiatives.length > 0) {
      setIsInitialLoad(false);
    }
  }, [initiatives]);

  const handleBookmarkToggle = (initiativeId) => {
    toggleBookmark(initiativeId);
  };

  const handleFilter = (filtered) => {
    setFilteredInitiatives(filtered);
    setIsFiltering(filtered.length !== initiatives.length);
  };

  const handleMapToggle = (mapVisible) => {
    setShowMap(mapVisible);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadMoreInitiatives();
    }
  };

  useEffect(() => {
    if (!isFiltering) {
      setFilteredInitiatives(initiatives);
    }
  }, [initiatives, isFiltering]);

  const displayedInitiatives = isFiltering ? filteredInitiatives : initiatives;

  return (
    <div className="initiatives-list-container">
      <InitiativesHero />
      <div className="initiatives-before-container">
        <InitiativesSearch
          initiatives={initiatives}
          onFilter={handleFilter}
          onMapToggle={handleMapToggle}
          showMap={showMap}
        />
      </div>
      <div className="initiatives-main-container">
        {showMap && (
          <InitiativesMap
            initiatives={displayedInitiatives}
            onHide={() => setShowMap(false)}
          />
        )}

        {!showMap && (
          <>
            {/* Skeleton loading state - ПРОМЕНЕНО УСЛОВИЕ */}
            {isInitialLoad && initiatives.length === 0 ? (
              <div className="initiatives-cards-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCardInitiative key={index} />
                ))}
              </div>
            ) : displayedInitiatives.length > 0 ? (
              <>
                <div className="initiatives-cards-grid">
                  {displayedInitiatives.map((initiative, index) => (
                    <InitiativeCard
                      key={initiative.id}
                      initiative={initiative}
                      index={index}
                      isBookmarked={bookmarkedInitiatives.includes(initiative.id)}
                      onBookmarkToggle={handleBookmarkToggle}
                    />
                  ))}
                </div>

                {!isFiltering && hasMore && (
                  <div className="initiatives-load-more-section">
                    <button
                      className="initiatives-load-more-button"
                      onClick={handleLoadMore}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="initiatives-load-more-spinner"></div>
                          {t('initiatives.initiativesList.loading')}
                        </>
                      ) : (
                        t('initiatives.initiativesList.loadMore')
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : !isInitialLoad && (
              <div className="initiatives-no-results">
                <p>{t('initiatives.initiativesList.noResults')}</p>
              </div>
            )}
          </>
        )}

        <ScrollToTop />
      </div>
    </div>
  );
};

export default InitiativesList;