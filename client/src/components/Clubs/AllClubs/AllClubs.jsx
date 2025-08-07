// components/Clubs/AllClubs/AllClubs.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { ClubsSearch } from './ClubsSearch/ClubsSearch';
import { ClubsMap } from './ClubsMap/ClubsMap';
import { ClubCard } from './ClubCard/ClubCard';
import { LoadingSpinner } from '../../common/LoadingSpinner/LoadingSpinner';
import './allClubs.css';
import { mockClubsData } from '../data/mockClubsData';
import { RecentArticles } from './RecentArticles/RecentArticles';
import { TextZoom } from '../../TextZoom/TextZoom';

export const AllClubs = () => {
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
      console.error('Грешка при зареждане на клубове:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
            
            // Алтернативно: използване на scrollIntoView
            // mapRef.current.scrollIntoView({ 
            //   behavior: 'smooth', 
            //   block: 'start',
            //   inline: 'nearest'
            // });
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
            
            // Алтернативно: използване на scrollIntoView
            // mapRef.current.scrollIntoView({ 
            //   behavior: 'smooth', 
            //   block: 'start',
            //   inline: 'nearest'
            // });
          }
        }, 150);
}, []);

  // Генериране на динамични мета данни
  const metaData = useMemo(() => {
    const baseTitle = "Всички клубове на пенсионерите в България";
    const baseDescription = "Открийте своето място в общността! Разгледайте всички клубове за пенсионери в България.";
    
    if (searchFilters.searchTerm || searchFilters.city || searchFilters.category) {
      const filterParts = [];
      if (searchFilters.city && searchFilters.city !== 'all') {
        filterParts.push(`в ${searchFilters.city}`);
      }
      if (searchFilters.category && searchFilters.category !== 'all') {
        const categoryNames = {
          'cultural': 'културни',
          'sports': 'спортни', 
          'general': 'общи',
          'traditional': 'традиционни'
        };
        filterParts.push(categoryNames[searchFilters.category] || searchFilters.category);
      }
      if (searchFilters.searchTerm) {
        filterParts.push(`"${searchFilters.searchTerm}"`);
      }

      const filteredTitle = `Клубове за пенсионери ${filterParts.join(' ')} - ${filteredClubs.length} резултата`;
      const filteredDescription = `Намерени са ${filteredClubs.length} клуба за пенсионери ${filterParts.join(' ')}. Разгледайте подробна информация, контакти и дейности.`;
      
      return {
        title: filteredTitle,
        description: filteredDescription
      };
    }

    return {
      title: `${baseTitle} - ${statistics.totalClubs} клуба, ${statistics.totalMembers} членове`,
      description: `${baseDescription} ${statistics.totalClubs} активни клуба в ${statistics.cities} града с общо ${statistics.totalMembers} членове.`
    };
  }, [searchFilters, filteredClubs.length, statistics]);

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Зареждане на клубове... | Клубове на пенсионерите</title>
          <meta name="description" content="Моля изчакайте, зареждаме списъка с всички клубове за пенсионери в България." />
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="all-clubs-loading-container">
          <LoadingSpinner />
          <p className="all-clubs-loading-text">Зареждаме клубовете...</p>
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
        <meta name="keywords" content="клубове за пенсионери, третата възраст, активно стареене, социални дейности, България, общност, приятелства, здраве, култура, спорт" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaData.title} />
        <meta property="og:description" content={metaData.description} />
        <meta property="og:image" content="/images/og-clubs-list.jpg" />
        <meta property="og:url" content={`${window.location.origin}/clubs`} />
        <meta property="og:site_name" content="Клубове на пенсионерите" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaData.title} />
        <meta name="twitter:description" content={metaData.description} />
        <meta name="twitter:image" content="/images/twitter-clubs-list.jpg" />
        
        {/* Additional meta tags */}
        <meta name="author" content="Клубове на пенсионерите" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`${window.location.origin}/clubs`} />
        
        {/* Structured data for better SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": metaData.title,
            "description": metaData.description,
            "url": `${window.location.origin}/clubs`,
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
                "memberOf": "Клубове на пенсионерите в България"
              }))
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Начало",
                  "item": window.location.origin
                },
                {
                  "@type": "ListItem", 
                  "position": 2,
                  "name": "Всички клубове",
                  "item": `${window.location.origin}/clubs`
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
                  Открийте своето място в общността
                </h1>
                <p className="all-clubs-subtitle">
                  "Заедно сме по-силни" - всеки клуб е портал към нови приятелства и възможности
                </p>
              </div>
              
              {/* Статистики отдясно */}
              <div className="all-clubs-stats">
                <div className="stat-card-clubs">
                  <div className="stat-value">{statistics.totalClubs}</div>
                  <div className="stat-label">Клуба</div>
                </div>
                <div className="stat-card-clubs">
                  <div className="stat-value">{statistics.totalMembers}</div>
                  <div className="stat-label">Членове</div>
                </div>
                <div className="stat-card-clubs">
                  <div className="stat-value">{statistics.activeClubs}</div>
                  <div className="stat-label">Активни</div>
                </div>
                <div className="stat-card-clubs">
                  <div className="stat-value">{statistics.cities}</div>
                  <div className="stat-label">Града</div>
                </div>
              </div>
            </div>
            <div className="all-clubs-decorative-line"></div>
          </div>

          {/* Карта на цялата ширина - ако е включена */}
          {showMap && (
            <div  id="clubs-map-section"
              ref={mapRef}
              className="all-clubs-map-full-width">
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
                      <h3>Няма намерени клубове</h3>
                      <p>Опитайте с различни критерии за търсене</p>
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