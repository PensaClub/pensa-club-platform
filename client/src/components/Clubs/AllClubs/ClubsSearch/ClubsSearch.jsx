// components/Clubs/AllClubs/ClubsSearch/ClubsSearch.jsx
import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faMapMarkerAlt, 
  faFilter, 
  faMap,
  faTimes,
  faSort,
  faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import './clubsSearch.css';

export const ClubsSearch = ({ 
  onFilterChange, 
  availableCities, 
  availableCategories, 
  resultsCount,
  showMap,
  onToggleMap 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Обработка на промени във филтрите
  const handleFilterUpdate = useCallback(() => {
    onFilterChange({
      searchTerm,
      city: selectedCity,
      category: selectedCategory,
      sortBy
    });
  }, [searchTerm, selectedCity, selectedCategory, sortBy, onFilterChange]);

  useEffect(() => {
    const debounceTimer = setTimeout(handleFilterUpdate, 300);
    return () => clearTimeout(debounceTimer);
  }, [handleFilterUpdate]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCity('all');
    setSelectedCategory('all');
    setSortBy('name');
  };

  const hasActiveFilters = searchTerm || selectedCity !== 'all' || selectedCategory !== 'all';

  const getCategoryLabel = (category) => {
    const labels = {
      'cultural': 'Културни',
      'general': 'Общи',
      'sports': 'Спортни',
      'educational': 'Образователни'
    };
    return labels[category] || category;
  };

  return (
    <div className="clubs-search-sidebar">
      <div className="clubs-search-header">
        <h3>Търсене</h3>
        <span className="clubs-search-results">{resultsCount} резултата</span>
      </div>

      {/* Търсачка */}
      <div className="clubs-search-section">
        <div className="clubs-search-input-wrapper">
          <FontAwesomeIcon icon={faSearch} className="clubs-search-icon" />
          <input
            type="text"
            placeholder="Търси клуб..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="clubs-search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="clubs-search-clear"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </div>

      {/* Филтри */}
      <div className="clubs-search-filters">
        <h4 className="clubs-search-filters-title">
          <FontAwesomeIcon icon={faFilter} />
          Филтри
        </h4>

        {/* Град */}
        <div className="clubs-filter-group">
          <label>Град</label>
          <div className="clubs-filter-select-wrapper">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="clubs-filter-icon" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="clubs-filter-select"
            >
              <option value="all">Всички градове</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Категория */}
        <div className="clubs-filter-group">
          <label>Категория</label>
          <div className="clubs-filter-select-wrapper">
            <FontAwesomeIcon icon={faLayerGroup} className="clubs-filter-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="clubs-filter-select"
            >
              <option value="all">Всички категории</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Сортиране */}
        <div className="clubs-filter-group">
          <label>Сортиране</label>
          <div className="clubs-filter-select-wrapper">
            <FontAwesomeIcon icon={faSort} className="clubs-filter-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="clubs-filter-select"
            >
              <option value="name">По име</option>
              <option value="members">По членове</option>
              <option value="rating">По рейтинг</option>
              <option value="newest">Най-нови</option>
            </select>
          </div>
        </div>
      </div>

      {/* Действия */}
      <div className="clubs-search-actions">
        <button
          onClick={onToggleMap}
          className={`clubs-action-btn ${showMap ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faMap} />
          {showMap ? 'Скрий картата' : 'Покажи на карта'}
        </button>

        {hasActiveFilters && (
          <button 
            onClick={clearAllFilters} 
            className="clubs-action-btn clubs-clear-btn"
          >
            <FontAwesomeIcon icon={faTimes} />
            Изчисти филтрите
          </button>
        )}
      </div>

      {/* Последни публикации секция (като от снимката) */}
      <div className="clubs-recent-section">
        <h4 className="clubs-recent-title">Последни публикации</h4>
        <div className="clubs-recent-items">
          {/* Примерни последни клубове */}
          <div className="clubs-recent-item">
            <span className="clubs-recent-category">ДИГИТАЛНА ГРАМОТНОСТ</span>
            <p className="clubs-recent-name">Наемете сега с онлайн отстъпка</p>
          </div>
          <div className="clubs-recent-item">
            <span className="clubs-recent-category">ДИГИТАЛНА ГРАМОТНОСТ</span>
            <p className="clubs-recent-name">тест1000</p>
          </div>
          <div className="clubs-recent-item">
            <span className="clubs-recent-category">ДИГИТАЛНА ГРАМОТНОСТ</span>
            <p className="clubs-recent-name">тест1001</p>
          </div>
        </div>
      </div>
    </div>
  );
};