import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFilter,
    faChevronDown,
    faCheck,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import './draftClubsFilterDropdown.css';

const DraftClubsFilterDropdown = ({ value, onChange, options = [] }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Close dropdown on escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => {
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }, [isOpen]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const handleClearFilter = (e) => {
        e.stopPropagation();
        onChange('all');
        setIsOpen(false);
    };

    // Find current option
    const currentOption = options.find(option => option.value === value);
    const hasActiveFilter = value && value !== 'all';

    // Group options by type
    const statusOptions = options.filter(opt => 
        ['all', 'complete', 'incomplete'].includes(opt.value)
    );
    
    const categoryOptions = options.filter(opt => 
        ['general', 'cultural', 'traditional', 'social', 'sports'].includes(opt.value)
    );

    return (
        <div className="draftclubsfilterdropdown-container" ref={dropdownRef}>
            <button
                type="button"
                className={`draftclubsfilterdropdown-trigger ${isOpen ? 'draftclubsfilterdropdown-open' : ''} ${hasActiveFilter ? 'draftclubsfilterdropdown-active' : ''}`}
                onClick={handleToggle}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <div className="draftclubsfilterdropdown-trigger-content">
                    <FontAwesomeIcon 
                        icon={faFilter} 
                        className="draftclubsfilterdropdown-icon"
                    />
                    <span className="draftclubsfilterdropdown-label">
                        {currentOption ? currentOption.label : t('draftClubsFilterDropdown.allDrafts')}
                    </span>
                    {hasActiveFilter && (
                        <div className="draftclubsfilterdropdown-active-indicator">
                            <span className="draftclubsfilterdropdown-badge">1</span>
                        </div>
                    )}
                </div>
                
                <div className="draftclubsfilterdropdown-actions">
                    {hasActiveFilter && (
                        <button
                            type="button"
                            className="draftclubsfilterdropdown-clear"
                            onClick={handleClearFilter}
                            title={t('draftClubsFilterDropdown.clearFilter')}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    )}
                    <FontAwesomeIcon 
                        icon={faChevronDown} 
                        className={`draftclubsfilterdropdown-arrow ${isOpen ? 'draftclubsfilterdropdown-arrow-up' : ''}`}
                    />
                </div>
            </button>

            {isOpen && (
                <div className="draftclubsfilterdropdown-menu">
                    <div className="draftclubsfilterdropdown-menu-content">
                        
                        {/* Status Group */}
                        {statusOptions.length > 0 && (
                            <div className="draftclubsfilterdropdown-group">
                                <div className="draftclubsfilterdropdown-group-header">
                                    <span className="draftclubsfilterdropdown-group-title">
                                        {t('draftClubsFilterDropdown.groups.status')}
                                    </span>
                                </div>
                                <div className="draftclubsfilterdropdown-group-options">
                                    {statusOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            className={`draftclubsfilterdropdown-option ${value === option.value ? 'draftclubsfilterdropdown-option-selected' : ''}`}
                                            onClick={() => handleSelect(option.value)}
                                        >
                                            <span className="draftclubsfilterdropdown-option-label">
                                                {option.label}
                                            </span>
                                            {value === option.value && (
                                                <FontAwesomeIcon 
                                                    icon={faCheck} 
                                                    className="draftclubsfilterdropdown-check"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Category Group */}
                        {categoryOptions.length > 0 && (
                            <div className="draftclubsfilterdropdown-group">
                                <div className="draftclubsfilterdropdown-group-header">
                                    <span className="draftclubsfilterdropdown-group-title">
                                        {t('draftClubsFilterDropdown.groups.category')}
                                    </span>
                                </div>
                                <div className="draftclubsfilterdropdown-group-options">
                                    {categoryOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            className={`draftclubsfilterdropdown-option ${value === option.value ? 'draftclubsfilterdropdown-option-selected' : ''}`}
                                            onClick={() => handleSelect(option.value)}
                                        >
                                            <span className="draftclubsfilterdropdown-option-label">
                                                {option.label}
                                            </span>
                                            {value === option.value && (
                                                <FontAwesomeIcon 
                                                    icon={faCheck} 
                                                    className="draftclubsfilterdropdown-check"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer with clear all option */}
                    {hasActiveFilter && (
                        <div className="draftclubsfilterdropdown-footer">
                            <button
                                type="button"
                                className="draftclubsfilterdropdown-clear-all"
                                onClick={() => handleSelect('all')}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                                {t('draftClubsFilterDropdown.clearAllFilters')}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Backdrop for mobile */}
            {isOpen && <div className="draftclubsfilterdropdown-backdrop" onClick={() => setIsOpen(false)} />}
        </div>
    );
};

export default DraftClubsFilterDropdown;