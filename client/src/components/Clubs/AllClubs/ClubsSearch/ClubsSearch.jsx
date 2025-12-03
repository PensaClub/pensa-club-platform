import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faMapMarkerAlt, 
  faFilter, 
  faMap,
  faTimes,
  faSort,
  faLayerGroup,
  faRoad,
  faMailBulk
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
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [addressSearch, setAddressSearch] = useState(''); // НОВО: търсене по адрес
  const [postalCodeSearch, setPostalCodeSearch] = useState(''); // НОВО: търсене по пощенски код
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Обработка на промени във филтрите
  const handleFilterUpdate = useCallback(() => {
    onFilterChange({
      searchTerm,
      addressSearch,      // НОВО
      postalCodeSearch,   // НОВО
      city: selectedCity,
      category: selectedCategory,
      sortBy
    });
  }, [searchTerm, addressSearch, postalCodeSearch, selectedCity, selectedCategory, sortBy, onFilterChange]);

  useEffect(() => {
    const debounceTimer = setTimeout(handleFilterUpdate, 300);
    return () => clearTimeout(debounceTimer);
  }, [handleFilterUpdate]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setAddressSearch('');
    setPostalCodeSearch('');
    setSelectedCity('all');
    setSelectedCategory('all');
    setSortBy('name');
  };

  const hasActiveFilters = searchTerm || addressSearch || postalCodeSearch || selectedCity !== 'all' || selectedCategory !== 'all';

  const getCategoryLabel = (category) => {
    return t(`clubs.ClubsSearch.categories.${category}`, { 
      defaultValue: t('clubs.ClubsSearch.categories.general') 
    });
  };

  const getResultsText = (count) => {
    return t('clubs.ClubsSearch.results', { 
      count, 
      defaultValue_other: `${count} резултата` 
    });
  };

  return (
    <div className="clubs-search-sidebar">
      <div className="clubs-search-header">
        <h3>{t('clubs.ClubsSearch.title')}</h3>
        <span className="clubs-search-results">{getResultsText(resultsCount)}</span>
      </div>

      {/* Търсачка по име */}
      <div className="clubs-search-section">
        <div className="clubs-search-input-wrapper">
          <FontAwesomeIcon icon={faSearch} className="clubs-search-icon" />
          <input
            type="text"
            placeholder={t('clubs.ClubsSearch.searchPlaceholder')}
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
          {t('clubs.ClubsSearch.filters.title')}
        </h4>

        {/* Град */}
        <div className="clubs-filter-group">
          <label>{t('clubs.ClubsSearch.filters.city.label')}</label>
          <div className="clubs-filter-select-wrapper">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="clubs-filter-icon" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="clubs-filter-select"
            >
              <option value="all">{t('clubs.ClubsSearch.filters.city.all')}</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* НОВО: Търсене по адрес/квартал/район */}
        <div className="clubs-filter-group">
         <label>{t('clubs.ClubsSearch.address.label')}</label>
          <div className="clubs-search-input-wrapper clubs-address-search">
            <FontAwesomeIcon icon={faRoad} className="clubs-search-icon" />
            <input
              type="text"
              placeholder={t('clubs.ClubsSearch.address.placeholder')}
              value={addressSearch}
              onChange={(e) => setAddressSearch(e.target.value)}
              className="clubs-search-input"
            />
            {addressSearch && (
              <button
                onClick={() => setAddressSearch('')}
                className="clubs-search-clear"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
          <span className="clubs-filter-hint">
            {t('clubs.ClubsSearch.address.hint')}
          </span>
        </div>

        {/* НОВО: Търсене по пощенски код */}
        <div className="clubs-filter-group">
          <label>{t('clubs.ClubsSearch.postalCode.label')}</label>
          <div className="clubs-search-input-wrapper clubs-postal-search">
            <FontAwesomeIcon icon={faMailBulk} className="clubs-search-icon" />
            <input
              type="text"
              placeholder={t('clubs.ClubsSearch.postalCode.placeholder')}
              value={postalCodeSearch}
              onChange={(e) => setPostalCodeSearch(e.target.value)}
              className="clubs-search-input"
              maxLength={4}
            />
            {postalCodeSearch && (
              <button
                onClick={() => setPostalCodeSearch('')}
                className="clubs-search-clear"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        </div>

        {/* Категория */}
        <div className="clubs-filter-group">
          <label>{t('clubs.ClubsSearch.filters.category.label')}</label>
          <div className="clubs-filter-select-wrapper">
            <FontAwesomeIcon icon={faLayerGroup} className="clubs-filter-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="clubs-filter-select"
            >
              <option value="all">{t('clubs.ClubsSearch.filters.category.all')}</option>
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
          <label>{t('clubs.ClubsSearch.filters.sort.label')}</label>
          <div className="clubs-filter-select-wrapper">
            <FontAwesomeIcon icon={faSort} className="clubs-filter-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="clubs-filter-select"
            >
              <option value="name">{t('clubs.ClubsSearch.filters.sort.name')}</option>
              <option value="members">{t('clubs.ClubsSearch.filters.sort.members')}</option>
              <option value="rating">{t('clubs.ClubsSearch.filters.sort.rating')}</option>
              <option value="newest">{t('clubs.ClubsSearch.filters.sort.newest')}</option>
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
          {showMap ? t('clubs.ClubsSearch.actions.hideMap') : t('clubs.ClubsSearch.actions.showMap')}
        </button>

        {hasActiveFilters && (
          <button 
            onClick={clearAllFilters} 
            className="clubs-action-btn clubs-clear-btn"
          >
            <FontAwesomeIcon icon={faTimes} />
            {t('clubs.ClubsSearch.actions.clearFilters')}
          </button>
        )}
      </div>

      {/* Последни публикации секция */}
      <div className="clubs-recent-section">
        <h4 className="clubs-recent-title">{t('clubs.ClubsSearch.recent.title')}</h4>
        <div className="clubs-recent-items">
          <div className="clubs-recent-item">
            <span className="clubs-recent-category">{t('clubs.ClubsSearch.recent.digitalLiteracy')}</span>
            <p className="clubs-recent-name">{t('clubs.ClubsSearch.recent.example1')}</p>
          </div>
          <div className="clubs-recent-item">
            <span className="clubs-recent-category">{t('clubs.ClubsSearch.recent.digitalLiteracy')}</span>
            <p className="clubs-recent-name">{t('clubs.ClubsSearch.recent.example2')}</p>
          </div>
          <div className="clubs-recent-item">
            <span className="clubs-recent-category">{t('clubs.ClubsSearch.recent.digitalLiteracy')}</span>
            <p className="clubs-recent-name">{t('clubs.ClubsSearch.recent.example3')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};