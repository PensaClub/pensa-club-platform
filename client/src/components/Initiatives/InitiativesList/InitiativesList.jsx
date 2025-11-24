/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from 'react';
import './initiativesList.css';
import { useTranslation } from 'react-i18next';
import { InitiativeCard } from './InitiativeCard/InitiativeCard';
import { InitiativesSearch } from '../InitiativesSearch/InitiativesSearch';
import { InitiativesMap } from './InitiativesMap/InitiativesMap';
import { useInitiativeContext } from '../../contexts/InitiativeProvider';
import ScrollToTop from '../../ScrollToTop/ScrollToTop';
import { InitiativesHero } from './InitiativesHero/InitiativesHero';
import { SkeletonCardInitiative } from './SkeletonCardInitiative/SkeletonCardInitiative';
import SEOHead from '../../SEO/SEOHead';

const InitiativesList = () => {
  const { t } = useTranslation();
  const [filteredInitiatives, setFilteredInitiatives] = useState([]);
  const { toggleBookmark, bookmarkedInitiatives } = useInitiativeContext();
  const [isFiltering, setIsFiltering] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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

  // ✅ META DATA
  const metaData = useMemo(() => {
    const title = t('initiatives.meta.title', {
      defaultValue: 'Инициативи за пенсионери | Pensa Club'
    });
    
    const description = t('initiatives.meta.description', {
      defaultValue: `Открийте ${initiatives.length} активни инициативи за дигитална грамотност и социално включване на пенсионери в България. Участвайте в проекти, споделете идеи, свързвайте се с общността.`
    });
    
    const keywords = t('initiatives.meta.keywords', {
      defaultValue: 'инициативи, пенсионери, дигитална грамотност, социално включване, проекти, общност, България, Pensa Club, активен живот, доброволчество'
    });

    const image = initiatives[0]?.mainImage?.src || '/images/iniciatives/iniciatives-2.jpg';

    return { title, description, keywords, image };
  }, [initiatives.length, initiatives, t]);

  // ✅ STRUCTURED DATA
  const structuredData = useMemo(() => {
    const initiativesToShow = displayedInitiatives.slice(0, 10);

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Инициативи за пенсионери - Pensa Club",
      "description": metaData.description,
      "url": "https://pensa.club/initiatives",
      "numberOfItems": displayedInitiatives.length,
      "itemListElement": initiativesToShow.map((initiative, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Event",
          "name": initiative.title,
          "description": initiative.shortDescription || initiative.summary,
          "url": `https://pensa.club/initiatives/${initiative.slug}`,
          "image": initiative.mainImage?.src || "https://pensa.club/images/iniciatives/iniciatives-2.jpg",
          ...(initiative.category && {
            "genre": initiative.category
          }),
          ...(initiative.location?.[0] && {
            "location": {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "BG"
              }
            }
          }),
          ...(initiative.startDate && {
            "startDate": initiative.startDate
          }),
          ...(initiative.endDate && {
            "endDate": initiative.endDate
          }),
          "organizer": {
            "@type": "Organization",
            "name": "Pensa Club",
            "url": "https://pensa.club"
          },
          "inLanguage": "bg"
        }
      }))
    };
  }, [displayedInitiatives, metaData.description]);

  return (
    <>
      {/* ✅ SEO HEAD */}
      <SEOHead
        title={metaData.title}
        description={metaData.description}
        keywords={metaData.keywords}
        image={metaData.image}
        type="website"
        structuredData={structuredData}
      />

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
    </>
  );
};

export default InitiativesList;