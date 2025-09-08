import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFilter,
    faChevronDown,
    faCheckCircle,
    faExclamationCircle,
    faFileAlt,
    faPause,
    faBan,
    faShieldAlt,
    faTimes,
    faUsers
} from '@fortawesome/free-solid-svg-icons';
import './adminClubFilters.css';

const AdminClubFilters = ({ value, onChange, stats }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    // Filter options with counts
    const filterOptions = [
        {
            value: 'all',
            label: t('adminClubFilters.options.all'),
            icon: faUsers,
            count: stats?.total || 0,
            color: '#3b82f6',
            bgColor: '#dbeafe'
        },
        {
            value: 'active',
            label: t('adminClubFilters.options.active'),
            icon: faCheckCircle,
            count: stats?.active || 0,
            color: '#10b981',
            bgColor: '#d1fae5'
        },
        {
            value: 'inactive',
            label: t('adminClubFilters.options.inactive'),
            icon: faExclamationCircle,
            count: stats?.inactive || 0,
            color: '#f59e0b',
            bgColor: '#fef3c7'
        },
        {
            value: 'draft',
            label: t('adminClubFilters.options.draft'),
            icon: faFileAlt,
            count: stats?.draft || 0,
            color: '#6b7280',
            bgColor: '#f3f4f6'
        },
        {
            value: 'suspended',
            label: t('adminClubFilters.options.suspended'),
            icon: faPause,
            count: stats?.suspended || 0,
            color: '#ef4444',
            bgColor: '#fef2f2'
        },
        {
            value: 'rejected',
            label: t('adminClubFilters.options.rejected'),
            icon: faBan,
            count: stats?.rejected || 0,
            color: '#dc2626',
            bgColor: '#fef2f2'
        },
        {
            value: 'verified',
            label: t('adminClubFilters.options.verified'),
            icon: faCheckCircle,
            count: stats?.verified || 0,
            color: '#8b5cf6',
            bgColor: '#ede9fe'
        },
        {
            value: 'unverified',
            label: t('adminClubFilters.options.unverified'),
            icon: faShieldAlt,
            count: stats?.unverified || 0,
            color: '#64748b',
            bgColor: '#f8fafc'
        },
        {
            value: 'pending',
            label: t('adminClubFilters.options.pending'),
            icon: faExclamationCircle,
            count: (stats?.draft || 0) + (stats?.inactive || 0),
            color: '#f59e0b',
            bgColor: '#fef3c7'
        }
    ];

    const currentFilter = filterOptions.find(option => option.value === value) || filterOptions[0];

    const handleOptionSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const handleClearFilter = (e) => {
        e.stopPropagation();
        onChange('all');
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleClickOutside = (e) => {
        if (!e.target.closest('.adminclubfilters-container')) {
            setIsOpen(false);
        }
    };

    // Close dropdown when clicking outside
    if (typeof document !== 'undefined') {
        document.addEventListener('click', handleClickOutside);
    }

    return (
        <div className="adminclubfilters-container">
            <div className="adminclubfilters-wrapper">
                {/* Filter Button */}
                <button
                    className={`adminclubfilters-button ${isOpen ? 'active' : ''}`}
                    onClick={toggleDropdown}
                >
                    <div className="adminclubfilters-button-content">
                        <FontAwesomeIcon icon={faFilter} className="adminclubfilters-filter-icon" />
                        
                        <div className="adminclubfilters-current-filter">
                            <div 
                                className="adminclubfilters-current-icon"
                                style={{ 
                                    backgroundColor: currentFilter.bgColor,
                                    color: currentFilter.color 
                                }}
                            >
                                <FontAwesomeIcon icon={currentFilter.icon} />
                            </div>
                            
                            <div className="adminclubfilters-current-text">
                                <span className="adminclubfilters-current-label">
                                    {currentFilter.label}
                                </span>
                                <span className="adminclubfilters-current-count">
                                    {currentFilter.count.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Clear Filter Button */}
                        {value !== 'all' && (
                            <button
                                className="adminclubfilters-clear-btn"
                                onClick={handleClearFilter}
                                title={t('adminClubFilters.clearFilter')}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        )}

                        <FontAwesomeIcon 
                            icon={faChevronDown} 
                            className={`adminclubfilters-chevron ${isOpen ? 'rotated' : ''}`}
                        />
                    </div>
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="adminclubfilters-dropdown">
                        <div className="adminclubfilters-dropdown-header">
                            <FontAwesomeIcon icon={faFilter} />
                            <span>{t('adminClubFilters.filterBy')}</span>
                        </div>

                        <div className="adminclubfilters-options">
                            {filterOptions.map((option) => (
                                <button
                                    key={option.value}
                                    className={`adminclubfilters-option ${
                                        option.value === value ? 'selected' : ''
                                    } ${option.count === 0 ? 'disabled' : ''}`}
                                    onClick={() => handleOptionSelect(option.value)}
                                    disabled={option.count === 0 && option.value !== 'all'}
                                >
                                    <div className="adminclubfilters-option-content">
                                        <div 
                                            className="adminclubfilters-option-icon"
                                            style={{ 
                                                backgroundColor: option.bgColor,
                                                color: option.color 
                                            }}
                                        >
                                            <FontAwesomeIcon icon={option.icon} />
                                        </div>
                                        
                                        <div className="adminclubfilters-option-text">
                                            <span className="adminclubfilters-option-label">
                                                {option.label}
                                            </span>
                                            <span className="adminclubfilters-option-description">
                                                {t(`adminClubFilters.descriptions.${option.value}`)}
                                            </span>
                                        </div>

                                        <div className="adminclubfilters-option-count">
                                            <span 
                                                className="adminclubfilters-count-badge"
                                                style={{ 
                                                    backgroundColor: option.count > 0 ? option.color : '#e2e8f0',
                                                    color: option.count > 0 ? 'white' : '#64748b'
                                                }}
                                            >
                                                {option.count.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {option.value !== 'all' && stats?.total > 0 && (
                                        <div className="adminclubfilters-option-progress">
                                            <div 
                                                className="adminclubfilters-progress-bar"
                                                style={{ backgroundColor: option.bgColor }}
                                            >
                                                <div 
                                                    className="adminclubfilters-progress-fill"
                                                    style={{ 
                                                        width: `${(option.count / stats.total) * 100}%`,
                                                        backgroundColor: option.color 
                                                    }}
                                                />
                                            </div>
                                            <span className="adminclubfilters-progress-percentage">
                                                {Math.round((option.count / stats.total) * 100)}%
                                            </span>
                                        </div>
                                    )}

                                    {/* Selection Indicator */}
                                    {option.value === value && (
                                        <div className="adminclubfilters-selection-indicator">
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="adminclubfilters-dropdown-footer">
                            <button
                                className="adminclubfilters-footer-btn"
                                onClick={() => handleOptionSelect('all')}
                            >
                                {t('adminClubFilters.viewAll')}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div 
                    className="adminclubfilters-backdrop"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminClubFilters;