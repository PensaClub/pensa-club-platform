import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './projectFilters.css';

const ProjectFilters = ({ 
    activeFilters, 
    onFiltersChange, 
    sortBy, 
    onSortChange 
}) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const filtersRef = useRef(null);

    // Quick filter options
    const quickFilters = [
        { key: 'active', label: t('projects.filters.quickActive'), icon: '⚡' },
        { key: 'canApply', label: t('projects.filters.quickCanApply'), icon: '👋' },
        { key: 'priority-high', label: t('projects.filters.quickHighPriority'), icon: '🔥' },
        { key: 'recent', label: t('projects.filters.quickRecent'), icon: '🆕' }
    ];

    // Filter options
    const filterOptions = {
        category: [
            { value: '', label: t('projects.filters.allCategories') },
            { value: 'digitalization', label: t('projects.categories.digitalization') },
            { value: 'education', label: t('projects.categories.education') },
            { value: 'healthcare', label: t('projects.categories.healthcare') },
            { value: 'environment', label: t('projects.categories.environment') },
            { value: 'social', label: t('projects.categories.social') },
            { value: 'culture', label: t('projects.categories.culture') },
            { value: 'sports', label: t('projects.categories.sports') }
        ],
        status: [
            { value: '', label: t('projects.filters.allStatuses') },
            { value: 'planned', label: t('projects.status.planned') },
            { value: 'active', label: t('projects.status.active') },
            { value: 'in-progress', label: t('projects.status.inProgress') },
            { value: 'completed', label: t('projects.status.completed') }
        ],
        priority: [
            { value: '', label: t('projects.filters.allPriorities') },
            { value: 'high', label: t('projects.priority.high') },
            { value: 'medium', label: t('projects.priority.medium') },
            { value: 'low', label: t('projects.priority.low') }
        ],
        initiative: [
            { value: '', label: t('projects.filters.allProjects') },
            { value: 'linked', label: t('projects.filters.linkedToInitiative') },
            { value: 'standalone', label: t('projects.filters.standalone') }
        ]
    };

    // Sort options
    const sortOptions = [
        { value: 'newest', label: t('projects.sort.newest'), icon: '🆕' },
        { value: 'oldest', label: t('projects.sort.oldest'), icon: '📅' },
        { value: 'priority', label: t('projects.sort.priority'), icon: '⭐' },
        { value: 'status', label: t('projects.sort.status'), icon: '📊' },
        { value: 'deadline', label: t('projects.sort.deadline'), icon: '⏰' },
        { value: 'budget', label: t('projects.sort.budget'), icon: '💰' }
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filtersRef.current && !filtersRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle filter change
    const handleFilterChange = (filterType, value) => {
        const newFilters = {
            ...activeFilters,
            [filterType]: value
        };
        onFiltersChange(newFilters);
    };

    // Handle quick filter
    const handleQuickFilter = (filterKey) => {
        let newFilters = { ...activeFilters };
        
        switch(filterKey) {
            case 'active':
                newFilters = { ...newFilters, status: newFilters.status === 'active' ? '' : 'active' };
                break;
            case 'canApply':
                newFilters = { ...newFilters, canApply: !newFilters.canApply };
                break;
            case 'priority-high':
                newFilters = { ...newFilters, priority: newFilters.priority === 'high' ? '' : 'high' };
                break;
            case 'recent':
                onSortChange(sortBy === 'newest' ? 'oldest' : 'newest');
                return;
            default:
                break;
        }
        
        onFiltersChange(newFilters);
    };

    // Clear all filters
    const clearAllFilters = () => {
        onFiltersChange({
            category: '',
            status: '',
            priority: '',
            initiative: '',
            canApply: false
        });
        onSortChange('newest');
    };

    // Check if any filters are active
    const hasActiveFilters = Object.values(activeFilters).some(value => 
        typeof value === 'boolean' ? value : value !== ''
    ) || sortBy !== 'newest';

    // Get active filters count
    const activeFiltersCount = Object.values(activeFilters).filter(value => 
        typeof value === 'boolean' ? value : value !== ''
    ).length;

    return (
        <div className="project-filters" ref={filtersRef}>
            {/* Quick Filters */}
            <div className="quick-filters">
                <div className="quick-filters-label">
                    <span className="label-icon">⚡</span>
                    <span className="label-text">{t('projects.filters.quickFilters')}</span>
                </div>
                
                <div className="quick-filters-buttons">
                    {quickFilters.map(filter => {
                        const isActive = 
                            (filter.key === 'active' && activeFilters.status === 'active') ||
                            (filter.key === 'canApply' && activeFilters.canApply) ||
                            (filter.key === 'priority-high' && activeFilters.priority === 'high') ||
                            (filter.key === 'recent' && sortBy === 'newest');
                        
                        return (
                            <button
                                key={filter.key}
                                className={`quick-filter-btn ${isActive ? 'active' : ''}`}
                                onClick={() => handleQuickFilter(filter.key)}
                            >
                                <span className="btn-icon">{filter.icon}</span>
                                <span className="btn-text">{filter.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Filters Toggle */}
            <div className="filters-header">
                <button 
                    className={`filters-toggle ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <span className="toggle-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
                        </svg>
                    </span>
                    <span className="toggle-text">
                        {t('projects.filters.advancedFilters')}
                        {activeFiltersCount > 0 && (
                            <span className="filters-count">({activeFiltersCount})</span>
                        )}
                    </span>
                    <span className={`toggle-arrow ${isExpanded ? 'rotated' : ''}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="6,9 12,15 18,9"/>
                        </svg>
                    </span>
                </button>

                {hasActiveFilters && (
                    <button 
                        className="clear-filters-btn"
                        onClick={clearAllFilters}
                    >
                        <span className="clear-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </span>
                        <span className="clear-text">{t('projects.filters.clearAll')}</span>
                    </button>
                )}
            </div>

            {/* Advanced Filters */}
            <div className={`advanced-filters ${isExpanded ? 'expanded' : ''}`}>
                <div className="filters-grid">
                    {/* Category Filter */}
                    <div className="filter-group">
                        <label className="filter-label">
                            <span className="label-icon">🏷️</span>
                            <span className="label-text">{t('projects.filters.category')}</span>
                        </label>
                        <div className="custom-select">
                            <button
                                className={`select-trigger ${openDropdown === 'category' ? 'open' : ''}`}
                                onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
                            >
                                <span className="select-value">
                                    {activeFilters.category 
                                        ? filterOptions.category.find(opt => opt.value === activeFilters.category)?.label
                                        : filterOptions.category[0].label
                                    }
                                </span>
                                <span className="select-arrow">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <polyline points="6,9 12,15 18,9"/>
                                    </svg>
                                </span>
                            </button>
                            
                            {openDropdown === 'category' && (
                                <div className="select-dropdown">
                                    {filterOptions.category.map(option => (
                                        <button
                                            key={option.value}
                                            className={`select-option ${option.value === activeFilters.category ? 'selected' : ''}`}
                                            onClick={() => {
                                                handleFilterChange('category', option.value);
                                                setOpenDropdown(null);
                                            }}
                                        >
                                            {option.label}
                                            {option.value === activeFilters.category && (
                                                <span className="check-icon">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="filter-group">
                        <label className="filter-label">
                            <span className="label-icon">📊</span>
                            <span className="label-text">{t('projects.filters.status')}</span>
                        </label>
                        <div className="custom-select">
                            <button
                                className={`select-trigger ${openDropdown === 'status' ? 'open' : ''}`}
                                onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                            >
                                <span className="select-value">
                                    {activeFilters.status 
                                        ? filterOptions.status.find(opt => opt.value === activeFilters.status)?.label
                                        : filterOptions.status[0].label
                                    }
                                </span>
                                <span className="select-arrow">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <polyline points="6,9 12,15 18,9"/>
                                    </svg>
                                </span>
                            </button>
                            
                            {openDropdown === 'status' && (
                                <div className="select-dropdown">
                                    {filterOptions.status.map(option => (
                                        <button
                                            key={option.value}
                                            className={`select-option ${option.value === activeFilters.status ? 'selected' : ''}`}
                                            onClick={() => {
                                                handleFilterChange('status', option.value);
                                                setOpenDropdown(null);
                                            }}
                                        >
                                            {option.label}
                                            {option.value === activeFilters.status && (
                                                <span className="check-icon">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Priority Filter */}
                    <div className="filter-group">
                        <label className="filter-label">
                            <span className="label-icon">⭐</span>
                            <span className="label-text">{t('projects.filters.priority')}</span>
                        </label>
                        <div className="custom-select">
                            <button
                                className={`select-trigger ${openDropdown === 'priority' ? 'open' : ''}`}
                                onClick={() => setOpenDropdown(openDropdown === 'priority' ? null : 'priority')}
                            >
                                <span className="select-value">
                                    {activeFilters.priority 
                                        ? filterOptions.priority.find(opt => opt.value === activeFilters.priority)?.label
                                        : filterOptions.priority[0].label
                                    }
                                </span>
                                <span className="select-arrow">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <polyline points="6,9 12,15 18,9"/>
                                    </svg>
                                </span>
                            </button>
                            
                            {openDropdown === 'priority' && (
                                <div className="select-dropdown">
                                    {filterOptions.priority.map(option => (
                                        <button
                                            key={option.value}
                                            className={`select-option ${option.value === activeFilters.priority ? 'selected' : ''}`}
                                            onClick={() => {
                                                handleFilterChange('priority', option.value);
                                                setOpenDropdown(null);
                                            }}
                                        >
                                            {option.label}
                                            {option.value === activeFilters.priority && (
                                                <span className="check-icon">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sort By */}
                    <div className="filter-group">
                        <label className="filter-label">
                            <span className="label-icon">🔄</span>
                            <span className="label-text">{t('projects.filters.sortBy')}</span>
                        </label>
                        <div className="custom-select">
                            <button
                                className={`select-trigger ${openDropdown === 'sort' ? 'open' : ''}`}
                                onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                            >
                                <span className="select-value">
                                    {sortOptions.find(opt => opt.value === sortBy)?.label}
                                </span>
                                <span className="select-arrow">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <polyline points="6,9 12,15 18,9"/>
                                    </svg>
                                </span>
                            </button>
                            
                            {openDropdown === 'sort' && (
                                <div className="select-dropdown">
                                    {sortOptions.map(option => (
                                        <button
                                            key={option.value}
                                            className={`select-option ${option.value === sortBy ? 'selected' : ''}`}
                                            onClick={() => {
                                                onSortChange(option.value);
                                                setOpenDropdown(null);
                                            }}
                                        >
                                            <span className="option-icon">{option.icon}</span>
                                            <span className="option-text">{option.label}</span>
                                            {option.value === sortBy && (
                                                <span className="check-icon">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Toggle Switches */}
                <div className="toggle-switches">
                    <div className="toggle-group">
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={activeFilters.canApply}
                                onChange={(e) => handleFilterChange('canApply', e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                            <span className="toggle-label">
                                <span className="toggle-icon">👋</span>
                                <span className="toggle-text">{t('projects.filters.canApplyOnly')}</span>
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectFilters;