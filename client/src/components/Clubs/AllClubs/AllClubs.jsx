// components/Clubs/AllClubs/AllClubs.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ClubsSearch } from './ClubsSearch/ClubsSearch';
import { ClubsMap } from './ClubsMap/ClubsMap';
import { ClubCard } from './ClubCard/ClubCard';
import { LoadingSpinner } from '../../common/LoadingSpinner/LoadingSpinner';
import './allClubs.css';
import { mockClubsData } from '../data/mockClubsData';
import { RecentArticles } from './RecentArticles/RecentArticles';

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
    setShowMap(prev => !prev);
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

  if (isLoading) {
    return (
      <div className="all-clubs-loading-container">
        <LoadingSpinner />
        <p className="all-clubs-loading-text">Зареждаме клубовете...</p>
      </div>
    );
  }

  return (
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
              <h2 className="all-clubs-main-title">
                Открийте своето място в общността
              </h2>
              <p className="all-clubs-subtitle">
                "Заедно сме по-силни" - всеки клуб е портал към нови приятелства и възможности
              </p>
            </div>
            
            {/* Статистики отдясно */}
            <div className="all-clubs-stats">
              <div className="stat-card-clubs">
                {/* <div className="stat-icon">🏛️</div> */}
                <div className="stat-value">{statistics.totalClubs}</div>
                <div className="stat-label">Клуба</div>
              </div>
              <div className="stat-card-clubs">
                {/* <div className="stat-icon">👥</div> */}
                <div className="stat-value">{statistics.totalMembers}</div>
                <div className="stat-label">Членове</div>
              </div>
              <div className="stat-card-clubs">
                {/* <div className="stat-icon">☀️</div> */}
                <div className="stat-value">{statistics.activeClubs}</div>
                <div className="stat-label">Активни</div>
              </div>
              <div className="stat-card-clubs">
                {/* <div className="stat-icon">📍</div> */}
                <div className="stat-value">{statistics.cities}</div>
                <div className="stat-label">Града</div>
              </div>
            </div>
          </div>
          <div className="all-clubs-decorative-line"></div>
        </div>

        {/* Карта на цялата ширина - ако е включена */}
        {showMap && (
          <div className="all-clubs-map-full-width">
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
  );
};