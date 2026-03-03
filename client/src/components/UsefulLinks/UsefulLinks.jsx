import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import SEOHead from '../SEO/SEOHead';
import { useUsefulLinksContext } from '../contexts/UsefulLinksContext';
import { useAuthContext } from '../contexts/UserContext';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import UsefulLinksHero from './UsefulLinksHero/UsefulLinksHero';
import UsefulLinksSearch from './UsefulLinksSearch/UsefulLinksSearch';
import UsefulLinksCategory from './UsefulLinksCategory/UsefulLinksCategory';
import UsefulLinksCard from './UsefulLinksCard/UsefulLinksCard';
import { Loader } from '../Loader/Loader';
import './usefulLinks.css';

const UsefulLinks = () => {
  const { t, i18n } = useTranslation('useful-links');
  const { isAdmin, isModerator } = useAuthContext();
  const navigate = useLocalizedNavigate();
  const isStaff = isAdmin || isModerator;
  const {
    publicLinks,
    allCategories,
    isLoading,
    isLoadingMore,
    hasMore,
    fetchPublicLinks,
    fetchMorePublicLinks,
  } = useUsefulLinksContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const loadMoreRef = useRef(null);
  const lang = i18n.language;

  // Initial load + reload on filter change
  useEffect(() => {
    fetchPublicLinks(searchTerm, selectedCategory || '');
  }, [searchTerm, selectedCategory]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          fetchMorePublicLinks();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, fetchMorePublicLinks]);

  const handleCategoryChange = useCallback((cat) => {
    setSelectedCategory(cat);
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${t('page.title')} | Pensa Club`,
    "description": t('page.subtitle'),
    "url": "https://pensa.club/useful-links",
    "image": "https://pensa.club/images/usefull-links.webp",
    "publisher": {
      "@type": "Organization",
      "name": "Pensa Club",
      "url": "https://pensa.club",
      "logo": {
        "@type": "ImageObject",
        "url": "https://pensa.club/images/homePage/logo-2.png"
      }
    },
    "about": {
      "@type": "Thing",
      "name": t('page.subtitle')
    },
    "inLanguage": lang
  };

  return (
    <>
      <SEOHead
        title={`${t('page.title')} | Pensa Club`}
        description={t('page.subtitle')}
        keywords={t('page.keywords', { defaultValue: 'полезни връзки, сайтове за пенсионери, онлайн ресурси, здраве, финанси, държавни услуги, образование, технологии, Pensa Club' })}
        image="/images/pensa-club-card.png"
        structuredData={structuredData}
      />

      <div className="ul-page">
        <div className="ul-bg-decoration">
          <div className="ul-bg-blob ul-bg-blob-1"></div>
          <div className="ul-bg-blob ul-bg-blob-2"></div>
          <div className="ul-bg-pattern"></div>
        </div>

        <UsefulLinksHero />

        <UsefulLinksSearch onSearch={setSearchTerm} />
        <UsefulLinksCategory
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          links={publicLinks}
          allCategories={allCategories}
        />

        <div className="ul-container">
          {isStaff && (
            <div className="ul-admin-bar">
              <button className="ul-admin-add-btn" onClick={() => navigate('/admin/useful-links/create')}>
                <FontAwesomeIcon icon={faPlus} />
                {t('page.addLink', { defaultValue: 'Нова връзка' })}
              </button>
            </div>
          )}
          {isLoading ? (
            <Loader />
          ) : publicLinks.length > 0 ? (
            <>
              <div className="ul-masonry">
                {publicLinks.map(link => (
                  <UsefulLinksCard key={link.id} link={link} />
                ))}
              </div>

              {hasMore && (
                <div ref={loadMoreRef} className="ul-load-more-sentinel">
                  <div className="ul-load-more-spinner"></div>
                </div>
              )}
            </>
          ) : (
            <div className="ul-no-results">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
                <path d="M8 11h6" />
              </svg>
              <p>{t('page.noResults')}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UsefulLinks;
