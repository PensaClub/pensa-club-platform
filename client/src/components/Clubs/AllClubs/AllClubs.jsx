import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { ClubsSearch } from './ClubsSearch/ClubsSearch';
import { ClubsMap } from './ClubsMap/ClubsMap';
import { ClubCard } from './ClubCard/ClubCard';
import { LoadingSpinner } from '../../common/LoadingSpinner/LoadingSpinner';
import './allClubs.css';
import { mockClubsData } from '../data/mockClubsData';
import { RecentArticles } from './RecentArticles/RecentArticles';
import { TextZoom } from '../../TextZoom/TextZoom';

export const AllClubs = () => {
  const { t, i18n } = useTranslation();
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: '',
    city: '',
    category: '',
    sortBy: 'name'
  });
  const mapRef = useRef(null);
  
  // Симулираме заявка към сървър
  const fetchClubs = useCallback(async () => {
    setIsLoading(true);
    try {
      // Симулираме network delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      setClubs(mockClubsData);
      setFilteredClubs(mockClubsData);
    } catch (error) {
      console.error(t('clubs.AllClubs.errors.loadingClubs'), error);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  // Филтриране на клубове
  const handleFilterChange = useCallback((filters) => {
    setSearchFilters(filters);
    
    let filtered = [...clubs];

    // Търсене по име или описание
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(club =>
        club.name.toLowerCase().includes(searchLower) ||
        club.shortDescription.toLowerCase().includes(searchLower) ||
        club.location.city.toLowerCase().includes(searchLower)
      );
    }

    // Филтриране по град
    if (filters.city && filters.city !== 'all') {
      filtered = filtered.filter(club => club.location.city === filters.city);
    }

    // Филтриране по категория
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(club => club.category === filters.category);
    }

    // Сортиране
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'members':
          return b.membership.totalMembers - a.membership.totalMembers;
        case 'rating':
          return b.metadata.rating - a.metadata.rating;
        case 'newest':
          return new Date(b.metadata.createdAt) - new Date(a.metadata.createdAt);
        default:
          return 0;
      }
    });

    setFilteredClubs(filtered);
  }, [clubs]);

  const handleClubSelect = useCallback((club) => {
    setSelectedClub(club);
  }, []);

  const toggleMapView = useCallback(() => {
    setShowMap(prev => {
      const newShowMap = !prev;
      
      if (newShowMap) {
        // Използваме requestAnimationFrame за по-гладко скролване
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (mapRef.current) {
              const headerHeight = 90; // височината на sticky header-а
              const elementTop = mapRef.current.offsetTop - headerHeight;
              
              window.scrollTo({
                top: elementTop,
                behavior: 'smooth'
              });
            }
          }, 150);
        });
      }
      
      return newShowMap;
    });
  }, []);

  // Мемоизирани градове и категории за филтрите
  const availableCities = useMemo(() => {
    return [...new Set(clubs.map(club => club.location.city))].sort();
  }, [clubs]);

  const availableCategories = useMemo(() => {
    return [...new Set(clubs.map(club => club.category))].sort();
  }, [clubs]);

  // Изчисляване на статистики
  const statistics = useMemo(() => {
    const totalMembers = clubs.reduce((sum, club) => sum + club.membership.totalMembers, 0);
    const activeClubs = clubs.filter(club => club.metadata.isActive).length;
    const cities = [...new Set(clubs.map(club => club.location.city))].length;
    
    return {
      totalClubs: clubs.length,
      totalMembers,
      activeClubs,
      cities
    };
  }, [clubs]);

  const handleClubSelectOnMap = useCallback((club) => {
    setSelectedClub(club);
    setShowMap(true);
    
    setTimeout(() => {
      if (mapRef.current) {
        const headerHeight = 90; // височината на sticky header-а
        const elementTop = mapRef.current.offsetTop - headerHeight;
        
        window.scrollTo({
          top: elementTop,
          behavior: 'smooth'
        });
      }
    }, 150);
  }, []);

  // Функция за получаване на переведено име на категория
  const getCategoryLabel = useCallback((category) => {
    return t(`clubs.AllClubs.categories.${category}`, { 
      defaultValue: category 
    });
  }, [t]);

  // Генериране на динамични мета данни
  const metaData = useMemo(() => {
    const baseTitle = t('clubs.AllClubs.meta.baseTitle');
    const baseDescription = t('clubs.AllClubs.meta.baseDescription');
    
    if (searchFilters.searchTerm || searchFilters.city || searchFilters.category) {
      const filterParts = [];
      if (searchFilters.city && searchFilters.city !== 'all') {
        filterParts.push(t('clubs.AllClubs.meta.inCity', { city: searchFilters.city }));
      }
      if (searchFilters.category && searchFilters.category !== 'all') {
        filterParts.push(getCategoryLabel(searchFilters.category));
      }
      if (searchFilters.searchTerm) {
        filterParts.push(`"${searchFilters.searchTerm}"`);
      }

      const filteredTitle = t('clubs.AllClubs.meta.filteredTitle', {
        filters: filterParts.join(' '),
        count: filteredClubs.length
      });
      const filteredDescription = t('clubs.AllClubs.meta.filteredDescription', {
        count: filteredClubs.length,
        filters: filterParts.join(' ')
      });
      
      return {
        title: filteredTitle,
        description: filteredDescription
      };
    }

    return {
      title: t('clubs.AllClubs.meta.fullTitle', {
        baseTitle,
        totalClubs: statistics.totalClubs,
        totalMembers: statistics.totalMembers
      }),
      description: t('clubs.AllClubs.meta.fullDescription', {
        baseDescription,
        totalClubs: statistics.totalClubs,
        cities: statistics.cities,
        totalMembers: statistics.totalMembers
      })
    };
  }, [searchFilters, filteredClubs.length, statistics, t, getCategoryLabel]);

  // Get current language for URLs and meta
  const currentLang = i18n.language;
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentUrl = `${currentOrigin}/${currentLang === 'bg' ? '' : currentLang + '/'}clubs`;

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>{t('clubs.AllClubs.loading.title')}</title>
          <meta name="description" content={t('clubs.AllClubs.loading.description')} />
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="all-clubs-loading-container">
          <LoadingSpinner />
          <p className="all-clubs-loading-text">{t('clubs.AllClubs.loading.text')}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{metaData.title}</title>
        <meta name="description" content={metaData.description} />
        
        {/* Keywords */}
        <meta name="keywords" content={t('clubs.AllClubs.meta.keywords')} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaData.title} />
        <meta property="og:description" content={metaData.description} />
        <meta property="og:image" content="/images/og-clubs-list.jpg" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:site_name" content={t('clubs.AllClubs.meta.siteName')} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaData.title} />
        <meta name="twitter:description" content={metaData.description} />
        <meta name="twitter:image" content="/images/twitter-clubs-list.jpg" />
        
        {/* Additional meta tags */}
        <meta name="author" content={t('clubs.AllClubs.meta.siteName')} />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={currentUrl} />
        
        {/* Structured data for better SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": metaData.title,
            "description": metaData.description,
            "url": currentUrl,
            "inLanguage": currentLang,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": statistics.totalClubs,
              "itemListElement": filteredClubs.slice(0, 5).map((club, index) => ({
                "@type": "Organization",
                "position": index + 1,
                "name": club.name,
                "description": club.shortDescription,
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": club.location.address,
                  "addressLocality": club.location.city,
                  "postalCode": club.location.postalCode,
                  "addressCountry": "BG"
                },
                "foundingDate": club.foundedYear.toString(),
                "memberOf": t('clubs.AllClubs.meta.memberOf')
              }))
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": t('common.navigation.home'),
                  "item": currentOrigin
                },
                {
                  "@type": "ListItem", 
                  "position": 2,
                  "name": t('clubs.AllClubs.breadcrumb'),
                  "item": currentUrl
                }
              ]
            }
          })}
        </script>
      </Helmet>
      
      <TextZoom />
      <div className="all-clubs-container">
        {/* Фонов слой със снимки */}
        <div className="all-clubs-bg-layer">
          <div className="all-clubs-bg-gradient"></div>
          <div className="all-clubs-bg-images">
            <div 
              className="bg-image bg-image-1" 
              style={{ backgroundImage: `url('/images/homePage/about-img.webp')` }}
            ></div>
            <div 
              className="bg-image bg-image-2" 
              style={{ backgroundImage: `url('/images/homePage/hero-img.jpg')` }}
            ></div>
            <div 
              className="bg-image bg-image-3" 
              style={{ backgroundImage: `url('/images/homePage/old-people-sectinon-2.webp')` }}
            ></div>
            <div 
              className="bg-image bg-image-4" 
              style={{ backgroundImage: `url('/images/homePage/test1.webp')` }}
            ></div>
          </div>
          <div className="decorative-elements">
            <span className="warm-dot"></span>
            <span className="warm-dot"></span>
            <span className="warm-dot"></span>
            <span className="warm-dot"></span>
            <span className="warm-dot"></span>
          </div>
        </div>

        {/* Основен контент */}
        <div className="all-clubs-content-wrapper">
          {/* Заглавие секция със статистики */}
          <div className="all-clubs-header-section">
            <div className="all-clubs-header-container">
              <div className="all-clubs-header-content">
                <h1 className="all-clubs-main-title">
                  {t('clubs.AllClubs.header.title')}
                </h1>
                <p className="all-clubs-subtitle">
                  {t('clubs.AllClubs.header.subtitle')}
                </p>
              </div>
              
              {/* Статистики отдясно */}
              <div className="all-clubs-stats">
                <div className="stat-card-clubs">
                  <div className="stat-value">{statistics.totalClubs}</div>
                  <div className="stat-label">{t('clubs.AllClubs.stats.clubs')}</div>
                </div>
                <div className="stat-card-clubs">
                  <div className="stat-value">{statistics.totalMembers}</div>
                  <div className="stat-label">{t('clubs.AllClubs.stats.members')}</div>
                </div>
                <div className="stat-card-clubs">
                  <div className="stat-value">{statistics.activeClubs}</div>
                  <div className="stat-label">{t('clubs.AllClubs.stats.active')}</div>
                </div>
                <div className="stat-card-clubs">
                  <div className="stat-value">{statistics.cities}</div>
                  <div className="stat-label">{t('clubs.AllClubs.stats.cities')}</div>
                </div>
              </div>
            </div>
            <div className="all-clubs-decorative-line"></div>
          </div>

          {/* Карта на цялата ширина - ако е включена */}
          {showMap && (
            <div id="clubs-map-section" ref={mapRef} className="all-clubs-map-full-width">
              <ClubsMap
                clubs={filteredClubs}
                selectedClub={selectedClub}
                onClubSelect={handleClubSelect}
              />
            </div>
          )}

          {/* Основен layout контейнер */}
          <div className="all-clubs-layout-wrapper">
            <div className="all-clubs-main-layout">
              {/* Лява странична лента - последни статии */}
              <aside className="all-clubs-sidebar-left">
                <div className="sidebar-content-sticky">
                  <RecentArticles />
                </div>
              </aside>

              {/* Централен панел - списък с клубове */}
              <main className="all-clubs-main-content">
                <div className="all-clubs-list-container">
                  {filteredClubs.length === 0 ? (
                    <div className="all-clubs-no-clubs-found">
                      <div className="all-clubs-no-clubs-icon">🏛️</div>
                      <h3>{t('clubs.AllClubs.noResults.title')}</h3>
                      <p>{t('clubs.AllClubs.noResults.subtitle')}</p>
                    </div>
                  ) : (
                    <div className="all-clubs-grid">
                      {filteredClubs.map((club, index) => (
                        <div 
                          key={club.id}
                          className="club-card-wrapper"
                        >
                          <ClubCard
                            club={club}
                            index={index}
                            isSelected={selectedClub?.id === club.id}
                            onSelect={() => handleClubSelect(club)}
                            onSelectOnMap={() => handleClubSelectOnMap(club)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </main>

              {/* Дясна странична лента - търсене и филтри */}
              <aside className="all-clubs-sidebar-right">
                <div className="sidebar-content-sticky">
                  <ClubsSearch
                    onFilterChange={handleFilterChange}
                    availableCities={availableCities}
                    availableCategories={availableCategories}
                    resultsCount={filteredClubs.length}
                    showMap={showMap}
                    onToggleMap={toggleMapView}
                  />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};