import { useState, useEffect } from 'react';
import './initiativesSearch.css';
import { useTranslation } from 'react-i18next';
import '../InitiativesList/initiativesList.css';

export const InitiativesSearch = ({ initiatives, onFilter }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Извличане на уникални стойности за филтрите
  const categories = [...new Set(initiatives.map(init => init.category))];
  const statuses = [...new Set(initiatives.map(init => init.status))];
  const locations = [...new Set(initiatives.map(init => init.location.address))];

  // Филтриране
  useEffect(() => {
    let filtered = initiatives;

    if (searchTerm.trim()) {
      filtered = filtered.filter(initiative =>
        initiative.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        initiative.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(initiative => initiative.category === selectedCategory);
    }

    if (selectedStatus) {
      filtered = filtered.filter(initiative => initiative.status === selectedStatus);
    }

    if (selectedLocation) {
      filtered = filtered.filter(initiative => initiative.location.address === selectedLocation);
    }

    if (showOpenOnly) {
      filtered = filtered.filter(initiative => initiative.campaignStatus === 'open');
    }

    onFilter(filtered);
  }, [searchTerm, selectedCategory, selectedStatus, selectedLocation, showOpenOnly, initiatives, onFilter]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedLocation('');
    setShowOpenOnly(false);
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedStatus || selectedLocation || showOpenOnly;

  const getStatusLabel = (status) => {
    switch(status) {
      case 'active': return t('initiatives.initiativesList.statusActive');
      case 'planned': return t('initiatives.initiativesList.statusPlanned');
      case 'completed': return t('initiatives.initiativesList.statusCompleted');
      default: return status;
    }
  };

  return (
    <div className="project-search-container">
      {/* Main Title */}
      <div className="search-main-title">
        <h1>{t('initiatives.initiativesList.title')}</h1>
      </div>

      {/* Search Bar with Checkbox */}
      <div className="search-bar-section">
        <div className="search-input-wrapper initiatives-search-wrapper">
          <svg className="search-icon initiatives-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <input
            type="text"
            placeholder={t('initiatives.initiativesList.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="main-search-input initiatives-search-input"
          />
        </div>
        
        <label className="show-active-checkbox">
          <input
            type="checkbox"
            checked={showOpenOnly}
            onChange={(e) => setShowOpenOnly(e.target.checked)}
          />
          <span>{t('initiatives.initiativesList.showOpenClosed')}</span>
        </label>
      </div>

      {/* Filter Dropdowns */}
      <div className="filter-dropdowns">
        <div className="dropdown-item initiatives-dropdown-item">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-dropdown initiatives-filter-dropdown"
          >
            <option value="">{t('initiatives.initiativesList.areasSupport')}</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <svg className="dropdown-chevron initiatives-dropdown-chevron" width="12" height="8" viewBox="0 0 12 8">
            <path d="M1 1L6 6L11 1" stroke="#dc2626" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>

        <div className="dropdown-item initiatives-dropdown-item">
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-dropdown initiatives-filter-dropdown"
          >
            <option value="">{t('initiatives.initiativesList.targetAudience')}</option>
            {statuses.map(status => (
              <option key={status} value={status}>{getStatusLabel(status)}</option>
            ))}
          </select>
          <svg className="dropdown-chevron initiatives-dropdown-chevron" width="12" height="8" viewBox="0 0 12 8">
            <path d="M1 1L6 6L11 1" stroke="#dc2626" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>

        <div className="dropdown-item initiatives-dropdown-item">
          <select 
            value={selectedLocation} 
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="filter-dropdown initiatives-filter-dropdown"
          >
            <option value="">{t('initiatives.initiativesList.searchRecommendations')}</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
          <svg className="dropdown-chevron initiatives-dropdown-chevron" width="12" height="8" viewBox="0 0 12 8">
            <path d="M1 1L6 6L11 1" stroke="#dc2626" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
      </div>

      {/* Results Header */}
      <div className="results-header">
        <h2 className="results-count">
          {initiatives.filter(init => {
            let filtered = initiatives;
            if (searchTerm.trim()) {
              filtered = filtered.filter(initiative =>
                initiative.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                initiative.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
              );
            }
            if (selectedCategory) {
              filtered = filtered.filter(initiative => initiative.category === selectedCategory);
            }
            if (selectedStatus) {
              filtered = filtered.filter(initiative => initiative.status === selectedStatus);
            }
            if (selectedLocation) {
              filtered = filtered.filter(initiative => initiative.location.address === selectedLocation);
            }
            if (showOpenOnly) {
              filtered = filtered.filter(initiative => initiative.campaignStatus === 'open');
            }
            return filtered;
          }).length} {t('initiatives.initiativesList.projectsIn')} {locations.length} {t('initiatives.initiativesList.countries')}
        </h2>
        
        <button 
          className={`show-map-btn ${showMap ? 'active' : ''}`}
          onClick={() => setShowMap(!showMap)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M8 .5A7.76 7.76 0 0 0 0 8a7.76 7.76 0 0 0 8 7.5A7.76 7.76 0 0 0 16 8 7.76 7.76 0 0 0 8 .5zm6.71 6.8L13.48 7c-.25-.07-.27-.09-.29-.12-.15-.2-.32-.47-.48-.73 0-.09-.13-.23-.16-.31s.35-.6.51-.84a2.43 2.43 0 0 1 .59-.45 5.87 5.87 0 0 1 1.06 2.75zM8 1.75l-.09.17a.19.19 0 0 1 0-.1c0 .06-.15.15-.25.25l-.3.29a.85.85 0 0 0-.08 1.08h-.12a1.05 1.05 0 0 0-.81.42 1.27 1.27 0 0 0-.2 1.07V5a3 3 0 0 0-.43.11l-.24.08-.64.21a1.2 1.2 0 0 0-.81.8 1 1 0 0 0 .2.93 5.67 5.67 0 0 0 1.38 1.09 4.17 4.17 0 0 0 1.67.65h1.68a1.2 1.2 0 0 1 1.04.51.49.49 0 0 1 .13.43.77.77 0 0 1-.15.35 2.71 2.71 0 0 0-.95 1.61 11.11 11.11 0 0 1-.48 1.38c-.12.31-.23.61-.31.85a3.32 3.32 0 0 1-1-.08 3.28 3.28 0 0 0-.5-2.12 2.24 2.24 0 0 1-.53-1.42 2.11 2.11 0 0 0-1.47-2.29 10.81 10.81 0 0 1-2.9-2.64A6.79 6.79 0 0 1 8 1.75zM1.25 8a5.64 5.64 0 0 1 .12-1.16 10.29 10.29 0 0 0 2.94 2.42c.6.22.69.45.69 1.12a3.45 3.45 0 0 0 .86 2.27A3.05 3.05 0 0 1 6 14a6.35 6.35 0 0 1-4.75-6zm8.32 6.08c0-.15.12-.32.18-.48a10.2 10.2 0 0 0 .55-1.6 1.55 1.55 0 0 1 .54-.86 1.91 1.91 0 0 0 .57-1.3 1.71 1.71 0 0 0-.47-1.27 2.45 2.45 0 0 0-2-.9H7.35a4.77 4.77 0 0 1-2-1.11l.47-.16.27-.08a.79.79 0 0 1 .38-.07l.09.15a.64.64 0 0 0 .81.29.65.65 0 0 0 .34-.8v-.18c-.11-.3-.24-.72-.32-1A1.42 1.42 0 0 0 8.68 4a1 1 0 0 0-.18-1 3.44 3.44 0 0 0 .33-.34 1 1 0 0 0 .22-.8 6.93 6.93 0 0 1 3.73 1.8 3 3 0 0 0-.79.7 9.14 9.14 0 0 0-.64 1.09 1.46 1.46 0 0 0 .24 1.39c.18.31.38.61.56.86a1.58 1.58 0 0 0 1 .58c.22.06 1 .22 1.55.33a6.44 6.44 0 0 1-5.13 5.47z"/>
          </svg>
          {showMap ? t('initiatives.initiativesList.hideMap') : t('initiatives.initiativesList.showMap')}
        </button>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="clear-filters-section">
          <button onClick={clearAllFilters} className="clear-filters-link">
            {t('initiatives.initiativesList.clearFilters')}
          </button>
        </div>
      )}
    </div>
  );
};