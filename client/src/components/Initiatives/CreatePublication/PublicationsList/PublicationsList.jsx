/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import './publicationsList.css';
import { useTranslation } from 'react-i18next';
import { PublicationCard } from './PublicationCard/PublicationCard';
import { PublicationsSearch } from './PublicationsSearch/PublicationsSearch';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import ScrollToTop from '../../../ScrollToTop/ScrollToTop';
import { PublicationsHero } from './PublicationsHero/PublicationsHero';
import { SkeletonCardPublication } from './SkeletonCardPublication/SkeletonCardPublication';

const PublicationsList = () => {
  const { t } = useTranslation();
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const {
    getAllPublications,
    publications,
    isLoading
  } = useInitiativeContext();

  useEffect(() => {
    // Load only published publications (isDraft: false)
    getAllPublications(1, true, false);
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Stop initial load when publications are loaded
  useEffect(() => {
    if (publications.length > 0) {
      setIsInitialLoad(false);
    }
  }, [publications]);

  // Memoize the handleFilter function to prevent infinite loops
  const handleFilter = useCallback((filtered) => {
    setFilteredPublications(filtered);
    setIsFiltering(filtered.length !== publications.length);
  }, [publications.length]);

  useEffect(() => {
    if (!isFiltering) {
      setFilteredPublications(publications);
    }
  }, [publications, isFiltering]);

  const displayedPublications = isFiltering ? filteredPublications : publications;

  return (
    <div className="publications-list-container">
      <PublicationsHero />
      <div className="publications-before-container">
        <PublicationsSearch
          publications={publications}
          onFilter={handleFilter}
        />
      </div>
      <div className="publications-main-container">
        {/* Skeleton loading state */}
        {isInitialLoad && publications.length === 0 ? (
          <div className="publications-cards-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCardPublication key={index} />
            ))}
          </div>
        ) : displayedPublications.length > 0 ? (
          <>
            {/* Featured publication - first one gets special treatment */}
            {displayedPublications.length > 0 && (
              <div className="publications-featured-section">
                <PublicationCard
                  publication={displayedPublications[0]}
                  isFeatured={true}
                  index={0}
                />
              </div>
            )}

            {/* Regular publications grid - 3 per row */}
            {displayedPublications.length > 1 && (
              <div className="publications-cards-grid">
                {displayedPublications.slice(1).map((publication, index) => (
                  <PublicationCard
                    key={publication.id}
                    publication={publication}
                    isFeatured={false}
                    index={index + 1}
                  />
                ))}
              </div>
            )}
          </>
        ) : !isInitialLoad && (
          <div className="publications-no-results">
            <p>{t('publications.publicationsList.noResults')}</p>
          </div>
        )}

        <ScrollToTop />
      </div>
    </div>
  );
};

export default PublicationsList;
