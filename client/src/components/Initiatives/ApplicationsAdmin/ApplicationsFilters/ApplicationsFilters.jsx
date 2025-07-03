/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './applicationsFilters.css';

export const ApplicationsFilters = ({ 
  applications, 
  onFilteredData, 
  onFiltersChange 
}) => {
  const { t } = useTranslation();
  
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedProject: 'all',
    dateRange: 'all', // 'all', 'today', 'week', 'month', 'custom'
    sortBy: 'appliedAt',
    sortDirection: 'desc'
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const uniqueProjects = [...new Set(applications.map(app => app.projectId))].sort();

  useEffect(() => {
    applyFilters();
  }, [filters, customDateRange, applications]);

 const applyFilters = () => {
  let filtered = [...applications];

  // Search filter с ПРИНУДИТЕЛНО конвертиране в string
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(app => {
      // 👇 ИЗПОЛЗВАЙ String() ЗА ПРИНУДИТЕЛНО КОНВЕРТИРАНЕ
      const fullName = `${app.firstName || ''} ${app.lastName || ''}`.toLowerCase();
      const email = String(app.email || '').toLowerCase();
      const projectId = String(app.projectId || '').toLowerCase(); // 👈 ТОВА Е КЛЮЧОВО!
      
      return fullName.includes(searchLower) ||
             email.includes(searchLower) ||
             projectId.includes(searchLower);
    });
  }

  // Project filter
  if (filters.selectedProject !== 'all') {
    filtered = filtered.filter(app => app.projectId === filters.selectedProject);
  }

  // Date filter
  if (filters.dateRange !== 'all') {
    const now = new Date();
    let filterDate;

    switch (filters.dateRange) {
      case 'today':
        filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filtered = filtered.filter(app => new Date(app.appliedAt) >= filterDate);
        break;
      case 'week':
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(app => new Date(app.appliedAt) >= filterDate);
        break;
      case 'month':
        filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(app => new Date(app.appliedAt) >= filterDate);
        break;
      case 'custom':
        if (customDateRange.startDate && customDateRange.endDate) {
          const startDate = new Date(customDateRange.startDate);
          const endDate = new Date(customDateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          filtered = filtered.filter(app => {
            const appDate = new Date(app.appliedAt);
            return appDate >= startDate && appDate <= endDate;
          });
        }
        break;
      default:
    }
  }

  // Sort с ПРИНУДИТЕЛНО конвертиране
  filtered.sort((a, b) => {
    let aValue, bValue;
    
    if (filters.sortBy === 'appliedAt') {
      aValue = new Date(a.appliedAt || 0);
      bValue = new Date(b.appliedAt || 0);
    } else if (filters.sortBy === 'name') {
      aValue = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
      bValue = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
    } else {
      // 👇 ПРИНУДИТЕЛНО КОНВЕРТИРАНЕ В STRING
      aValue = String(a[filters.sortBy] || '').toLowerCase();
      bValue = String(b[filters.sortBy] || '').toLowerCase();
    }
    
    if (filters.sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  onFilteredData(filtered);
  onFiltersChange(filters);
};

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      selectedProject: 'all',
      dateRange: 'all',
      sortBy: 'appliedAt',
      sortDirection: 'desc'
    });
    setCustomDateRange({
      startDate: '',
      endDate: ''
    });
    setIsAdvancedOpen(false);
  };

  const hasActiveFilters = () => {
    return filters.searchTerm || 
           filters.selectedProject !== 'all' || 
           filters.dateRange !== 'all' ||
           filters.sortBy !== 'appliedAt' ||
           filters.sortDirection !== 'desc';
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.selectedProject !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.sortBy !== 'appliedAt' || filters.sortDirection !== 'desc') count++;
    return count;
  };

  return (
    <div className="applications-filters-container">
      {/* Main Filter Row */}
      <div className="applications-filters-main-row">
        {/* Search */}
        <div className="applications-filters-search-group">
          <div className="applications-filters-search-wrapper">
            <span className="applications-filters-search-icon">🔍</span>
            <input
              type="text"
              placeholder={t('applications.filters.searchPlaceholder')}
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="applications-filters-search-input"
            />
            {filters.searchTerm && (
              <button
                onClick={() => handleFilterChange('searchTerm', '')}
                className="applications-filters-search-clear"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="applications-filters-quick-group">
          {/* Project Filter */}
          <select
            value={filters.selectedProject}
            onChange={(e) => handleFilterChange('selectedProject', e.target.value)}
            className="applications-filters-select"
          >
            <option value="all">{t('applications.filters.allProjects')}</option>
            {uniqueProjects.map(project => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="applications-filters-select"
          >
            <option value="all">{t('applications.filters.allTime')}</option>
            <option value="today">{t('applications.filters.today')}</option>
            <option value="week">{t('applications.filters.thisWeek')}</option>
            <option value="month">{t('applications.filters.thisMonth')}</option>
            <option value="custom">{t('applications.filters.customRange')}</option>
          </select>
        </div>

        {/* Controls */}
        <div className="applications-filters-controls-group">
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`applications-filters-advanced-btn ${isAdvancedOpen ? 'active' : ''}`}
          >
            <span className="applications-filters-advanced-icon">⚙️</span>
            {t('applications.filters.advanced')}
            <span className={`applications-filters-dropdown-arrow ${isAdvancedOpen ? 'open' : ''}`}>
              <svg width="12" height="12" viewBox="0 0 1024 1024">
                <path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 0 0 302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 0 0 0-50.4z"/>
              </svg>
            </span>
          </button>

          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="applications-filters-clear-btn"
            >
              <span className="applications-filters-clear-icon">🗑️</span>
              {t('applications.filters.clear')}
              <span className="applications-filters-clear-count">{getActiveFiltersCount()}</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <div className="applications-filters-advanced-panel">
          <div className="applications-filters-advanced-content">
            {/* Sort Options */}
            <div className="applications-filters-advanced-group">
              <label className="applications-filters-advanced-label">
                {t('applications.filters.sortBy')}
              </label>
              <div className="applications-filters-sort-controls">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="applications-filters-sort-select"
                >
                  <option value="appliedAt">{t('applications.filters.sortByDate')}</option>
                  <option value="name">{t('applications.filters.sortByName')}</option>
                  <option value="email">{t('applications.filters.sortByEmail')}</option>
                  <option value="projectId">{t('applications.filters.sortByProject')}</option>
                </select>
                
                <div className="applications-filters-sort-direction">
                  <button
                    onClick={() => handleFilterChange('sortDirection', 'desc')}
                    className={`applications-filters-sort-btn ${filters.sortDirection === 'desc' ? 'active' : ''}`}
                  >
                    ⬇️ {t('applications.filters.desc')}
                  </button>
                  <button
                    onClick={() => handleFilterChange('sortDirection', 'asc')}
                    className={`applications-filters-sort-btn ${filters.sortDirection === 'asc' ? 'active' : ''}`}
                  >
                    ⬆️ {t('applications.filters.asc')}
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <div className="applications-filters-advanced-group">
                <label className="applications-filters-advanced-label">
                  {t('applications.filters.customDateRange')}
                </label>
                <div className="applications-filters-date-range">
                  <input
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange(prev => ({
                      ...prev,
                      startDate: e.target.value
                    }))}
                    className="applications-filters-date-input"
                    placeholder={t('applications.filters.startDate')}
                  />
                  <span className="applications-filters-date-separator">—</span>
                  <input
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange(prev => ({
                      ...prev,
                      endDate: e.target.value
                    }))}
                    className="applications-filters-date-input"
                    placeholder={t('applications.filters.endDate')}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};