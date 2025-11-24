import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { ClubsSearch } from './ClubsSearch/ClubsSearch';
import { ClubsMap } from './ClubsMap/ClubsMap';
import { ClubCard } from './ClubCard/ClubCard';
import { LoadingSpinner } from '../../common/LoadingSpinner/LoadingSpinner';
import { RecentArticles } from './RecentArticles/RecentArticles';
import { TextZoom } from '../../TextZoom/TextZoom';
import './allClubs.css';
import { useClubContext } from '../../contexts/ClubContext';
import ScrollToTop from '../../ScrollToTop/ScrollToTop';
import SEOHead from '../../SEO/SEOHead';

export const AllClubs = () => {
  const { t, i18n } = useTranslation();

  const { getAllClubs, isLoading } = useClubContext();

  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [showMap, setShowMap] = useState(true);
  const [selectedClub, setSelectedClub] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: '',
    city: '',
    category: '',
    sortBy: 'name'
  });
  const mapRef = useRef(null);

  // ✅ Заменяме fetchClubs да използва ClubContext
  const fetchClubs = useCallback(async () => {
    try {

      const response = await getAllClubs(false, 1, 500); // forceRefresh=false, page=1, limit=100

      // Обработваме response-а
      let clubsData = [];
      if (response?.clubs) {
        // Ако response има clubs array (пагиниран отговор)
        clubsData = response?.clubs;
      } else if (Array.isArray(response)) {
        // Ако response е директно array
        clubsData = response;
      } else {
        console.warn('Unexpected response format:', response);
        clubsData = [];
      }

      setClubs(clubsData);
      setFilteredClubs(clubsData);

      // Показваме информация за fallback ако има
      if (response?.isFromFallback) {
        console.info('📋 Using fallback mock data due to API error');
      }

    } catch (error) {
      console.error('❌ Error fetching clubs:', error);
      // В случай на грешка, се ползва fallback-ът от контекста
      setClubs([]);
      setFilteredClubs([]);
    }
  }, [getAllClubs]);

  useEffect(() => {
    fetchClubs();
  }, []);

  // Филтриране на клубове
  const handleFilterChange = useCallback((filters) => {
    setSearchFilters(filters);

let filtered = clubs.filter(club => club !== null && club !== undefined);

    // Търсене по име или описание
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(club =>
        club?.name?.toLowerCase().includes(searchLower) ||
        club?.shortDescription?.toLowerCase().includes(searchLower) ||
        club?.location?.city?.toLowerCase().includes(searchLower)
      );
    }

    // Филтриране по град
    if (filters?.city && filters.city !== 'all') {
      filtered = filtered.filter(club => club.location?.city === filters.city);
    }

    // Филтриране по категория
    if (filters?.category && filters.category !== 'all') {
      filtered = filtered.filter(club => club?.category === filters?.category);
    }

    // Сортиране
    filtered.sort((a, b) => {
      switch (filters?.sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'members':
          return (b.membership?.totalMembers || 0) - (a.membership?.totalMembers || 0);
        case 'rating':
          return (b.metadata?.rating || 0) - (a.metadata?.rating || 0);
        case 'newest':
          return new Date(b.metadata?.createdAt || 0) - new Date(a.metadata?.createdAt || 0);
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
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (mapRef.current) {
              const headerHeight = 90;
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
  
 // Функция за получаване на переведено име на категория
  const getCategoryLabel = useCallback((category) => {
    return t(`clubs.AllClubs.categories.${category}`, {
      defaultValue: category
    });
  }, [t]);

  // Мемоизирани градове и категории за филтрите
 const availableCities = useMemo(() => {
  return [...new Set(clubs
    .filter(club => club !== null && club !== undefined)
    .map(club => club.location?.city)
    .filter(Boolean))].sort();
}, [clubs]);

const availableCategories = useMemo(() => {
  return [...new Set(clubs
    .filter(club => club !== null && club !== undefined)
    .map(club => club.category)
    .filter(Boolean))].sort();
}, [clubs]);

 // Изчисляване на статистики
const statistics = useMemo(() => {
  // Филтрираме null/undefined клубове
  const validClubs = clubs.filter(club => club !== null && club !== undefined);
  
  const totalMembers = validClubs.reduce((sum, club) => sum + (club.membership?.totalMembers || 0), 0);
  const activeClubs = validClubs.filter(club => club?.status === 'active' || club?.metadata?.isActive).length;
  const cities = [...new Set(validClubs.map(club => club.location?.city).filter(Boolean))].length;

  return {
    totalClubs: validClubs.length,
    totalMembers,
    activeClubs,
    cities
  };
}, [clubs]);

  // ✅ META DATA - ДИНАМИЧНИ META TAGS
  const metaData = useMemo(() => {
    // Base keywords
    const baseKeywords = [
      'клубове за пенсионери',
      'Pensa Club',
      'дигитална грамотност',
      'социални клубове',
      'активни пенсионери',
      'клубове България'
    ];

    // Dynamic title based on filters
    let title = 'Клубове за пенсионери | Pensa Club';
    let description = `Открийте ${statistics.totalClubs} активни клуба за пенсионери в ${statistics.cities} града. Присъединете се към общността на Pensa Club и открийте нови приятели и възможности.`;

    // If there are active filters
    if (searchFilters.searchTerm || searchFilters.city !== 'all' || searchFilters.category !== 'all') {
      const filterParts = [];

      if (searchFilters.city && searchFilters.city !== 'all') {
        filterParts.push(searchFilters.city);
        baseKeywords.push(searchFilters.city.toLowerCase());
      }

      if (searchFilters.category && searchFilters.category !== 'all') {
        const categoryLabel = getCategoryLabel(searchFilters.category);
        filterParts.push(categoryLabel);
        baseKeywords.push(searchFilters.category.toLowerCase());
      }

      if (searchFilters.searchTerm) {
        filterParts.push(`"${searchFilters.searchTerm}"`);
        baseKeywords.push(searchFilters.searchTerm.toLowerCase());
      }

      title = `${filteredClubs.length} ${filteredClubs.length === 1 ? 'клуб' : 'клуба'} ${filterParts.join(' ')} | Pensa Club`;
      description = `Намерени ${filteredClubs.length} клуба за пенсионери ${filterParts.join(' ')}. Преглед на клубове, информация за членство и дейности.`;
    }

    return {
      title,
      description,
      keywords: baseKeywords.join(', '),
      image: '/images/iniciatives/iniciatives-2.jpg'
    };
  }, [statistics, filteredClubs.length, searchFilters, getCategoryLabel]);

  // ✅ STRUCTURED DATA - ITEMLIST + COLLECTIONPAGE
  const structuredData = useMemo(() => {
    const clubsToShow = filteredClubs.slice(0, 10);

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "name": metaData.title,
          "description": metaData.description,
          "url": "https://pensa.club/clubs",
          "inLanguage": i18n.language,
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Начало",
                "item": "https://pensa.club"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Клубове",
                "item": "https://pensa.club/clubs"
              }
            ]
          }
        },
        {
          "@type": "ItemList",
          "name": "Клубове за пенсионери - Pensa Club",
          "description": metaData.description,
          "url": "https://pensa.club/clubs",
          "numberOfItems": filteredClubs.length,
          "itemListElement": clubsToShow.map((club, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Organization",
              "name": club.name,
              "description": club.shortDescription,
              "url": `https://pensa.club/clubs/${club.slug}`,
              ...(club.location && {
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": club.location.address,
                  "addressLocality": club.location.city,
                  "postalCode": club.location.postalCode,
                  "addressCountry": "BG"
                }
              }),
              ...(club.foundedYear && {
                "foundingDate": club.foundedYear.toString()
              }),
              ...(club.membership?.totalMembers && {
                "numberOfEmployees": club.membership.totalMembers
              }),
              "memberOf": {
                "@type": "Organization",
                "name": "Pensa Club"
              }
            }
          }))
        }
      ]
    };
  }, [filteredClubs, metaData, i18n.language]);

  const handleClubSelectOnMap = useCallback((club) => {
    setSelectedClub(club);
    setShowMap(true);

    setTimeout(() => {
      if (mapRef.current) {
        const headerHeight = 90;
        const elementTop = mapRef.current.offsetTop - headerHeight;

        window.scrollTo({
          top: elementTop,
          behavior: 'smooth'
        });
      }
    }, 150);
  }, []);

   // Get current language for URLs and meta
  const currentLang = i18n.language;
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentUrl = `${currentOrigin}/${currentLang === 'bg' ? '' : currentLang + '/'}clubs`;

  if (isLoading) {
    return (
      <>
        <SEOHead
          title={t('clubs.AllClubs.loading.title', { defaultValue: 'Зареждане на клубове...' })}
          description={t('clubs.AllClubs.loading.description', { defaultValue: 'Моля, изчакайте. Зареждаме списъка с клубове.' })}
          keywords="клубове, пенсионери, Pensa Club"
          noindex={true}
        />
        <div className="all-clubs-loading-container">
          <LoadingSpinner />
          <p className="all-clubs-loading-text">{t('clubs.AllClubs.loading.text')}</p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Helmet и останалата част от компонента остават същите */}
      <SEOHead
        title={metaData.title}
        description={metaData.description}
        keywords={metaData.keywords}
        image={metaData.image}
        type="website"
        structuredData={structuredData}
      />

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
        <ScrollToTop />
      </div>
    </>
  );
};