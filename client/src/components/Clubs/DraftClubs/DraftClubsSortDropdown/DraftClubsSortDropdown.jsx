
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSort,
    faChevronDown,
    faCheck,
    faSortAmountDown,
    faSortAmountUp,
    faSortAlphaDown,
    faSortNumericDown,
    faPercentage
} from '@fortawesome/free-solid-svg-icons';
import './draftClubsSortDropdown.css';

const DraftClubsSortDropdown = ({ value, onChange, options = [] }) => {
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

    // Get icon for sort option
    const getSortIcon = (sortValue) => {
        const iconMap = {
            'newest': faSortAmountDown,
            'oldest': faSortAmountUp,
            'name': faSortAlphaDown,
            'category': faSortAlphaDown,
            'completion': faPercentage
        };
        return iconMap[sortValue] || faSortNumericDown;
    };

    // Find current option
    const currentOption = options.find(option => option.value === value);

    return (
        <div className="draftclubssortdropdown-container" ref={dropdownRef}>
            <button
                type="button"
                className={`draftclubssortdropdown-trigger ${isOpen ? 'draftclubssortdropdown-open' : ''}`}
                onClick={handleToggle}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <div className="draftclubssortdropdown-trigger-content">
                    <FontAwesomeIcon 
                        icon={faSort} 
                        className="draftclubssortdropdown-icon"
                    />
                    <span className="draftclubssortdropdown-label">
                        {currentOption ? currentOption.label : t('draftClubsSortDropdown.defaultSort')}
                    </span>
                </div>
                
                <FontAwesomeIcon 
                    icon={faChevronDown} 
                    className={`draftclubssortdropdown-arrow ${isOpen ? 'draftclubssortdropdown-arrow-up' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="draftclubssortdropdown-menu">
                    <div className="draftclubssortdropdown-menu-content">
                        
                        {/* Header */}
                        <div className="draftclubssortdropdown-header">
                            <span className="draftclubssortdropdown-header-title">
                                {t('draftClubsSortDropdown.sortBy')}
                            </span>
                        </div>

                        {/* Sort Options */}
                        <div className="draftclubssortdropdown-options">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`draftclubssortdropdown-option ${value === option.value ? 'draftclubssortdropdown-option-selected' : ''}`}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    <div className="draftclubssortdropdown-option-content">
                                        <FontAwesomeIcon 
                                            icon={getSortIcon(option.value)} 
                                            className="draftclubssortdropdown-option-icon"
                                        />
                                        <span className="draftclubssortdropdown-option-label">
                                            {option.label}
                                        </span>
                                    </div>
                                    {value === option.value && (
                                        <FontAwesomeIcon 
                                            icon={faCheck} 
                                            className="draftclubssortdropdown-check"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Description for current selection */}
                        {currentOption && (
                            <div className="draftclubssortdropdown-description">
                                <p>{t(`draftClubsSortDropdown.descriptions.${currentOption.value}`)}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Backdrop for mobile */}
            {isOpen && <div className="draftclubssortdropdown-backdrop" onClick={() => setIsOpen(false)} />}
        </div>
    );
};

export default DraftClubsSortDropdown;