import { useState, useEffect } from 'react';
import './initiativesList.css';
import { useTranslation } from 'react-i18next';
import { InitiativeCard } from './InitiativeCard/InitiativeCard';
import { InitiativesSearch } from '../InitiativesSearch/InitiativesSearch';
import { InitiativesMap } from './InitiativesMap/InitiativesMap'; // Нов импорт
import { useInitiativeContext } from '../../contexts/InitiativeProvider';
import ScrollToTop from '../../ScrollToTop/ScrollToTop';
import { InitiativesHero } from './InitiativesHero/InitiativesHero';

const InitiativesList = () => {
  const { t } = useTranslation();
  const [filteredInitiatives, setFilteredInitiatives] = useState([]);
  // const [bookmarkedInitiatives, setBookmarkedInitiatives] = useState([]);
  const { toggleBookmark, bookmarkedInitiatives } = useInitiativeContext();

  const [isFiltering, setIsFiltering] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const {
    initiatives,
    getAllInitiatives,
    loadMoreInitiatives,
    hasMore,
    isLoading
  } = useInitiativeContext();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }, []);

  // // Зареждане на bookmarks от localStorage
  // useEffect(() => {
  //   const saved = localStorage.getItem('bookmarkedInitiatives');
  //   if (saved) {
  //     setBookmarkedInitiatives(JSON.parse(saved));
  //   }
  // }, []);

  // // Запазване на bookmarks в localStorage
  // useEffect(() => {
  //   localStorage.setItem('bookmarkedInitiatives', JSON.stringify(bookmarkedInitiatives));
  // }, [bookmarkedInitiatives]);

  const handleBookmarkToggle = (initiativeId) => {
    toggleBookmark(initiativeId);
  };

  const handleFilter = (filtered) => {
    setFilteredInitiatives(filtered);
    setIsFiltering(filtered.length !== initiatives.length);
  };

  // Нова функция за управление на картата
  const handleMapToggle = (mapVisible) => {
    setShowMap(mapVisible);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadMoreInitiatives();
    }
  };

  useEffect(() => {
    getAllInitiatives(1);
  }, []);

  useEffect(() => {
    if (!isFiltering) {
      setFilteredInitiatives(initiatives);
    }
  }, [initiatives, isFiltering]);

  if (isLoading && initiatives.length === 0) {
    return (
      <div className="initiatives-loading-wrapper">
        <div className="initiatives-loading-spinner"></div>
        <p>{t('initiatives.initiativesList.loading')}</p>
      </div>
    );
  }

  const displayedInitiatives = isFiltering ? filteredInitiatives : initiatives;

  return (
    <div className="initiatives-list-container">
      <InitiativesHero />
        <div className="initiatives-before-container">

          {/* Search & Filters */}
          <InitiativesSearch
            initiatives={initiatives}
            onFilter={handleFilter}
            onMapToggle={handleMapToggle} // Нов prop
            showMap={showMap} // Нов prop
          />
        </div>
      <div className="initiatives-main-container">

        {/* Map Section - показва се само ако showMap е true */}
        {showMap && (
          <InitiativesMap
            initiatives={displayedInitiatives}
            onHide={() => setShowMap(false)}
          />
        )}

        {/* Initiatives Grid - скрива се когато картата е показана */}
        {!showMap && displayedInitiatives.length > 0 ? (
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

            {/* Load More Button - показва се само ако няма активни филтри и има още данни */}
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
        ) : !showMap && displayedInitiatives.length === 0 && (
          <div className="initiatives-no-results">
            <p>{t('initiatives.initiativesList.noResults')}</p>
          </div>
        )}

        <ScrollToTop />
      </div>
    </div>
  );
};
export default InitiativesList;