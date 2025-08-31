// src/components/Profile/DraftClubs/SearchBar/SearchDraftClubsBar.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import './searchDraftClubsBar.css';

const SearchDraftClubsBar = ({ value, onChange, placeholder }) => {
    const { t } = useTranslation();
    const [isFocused, setIsFocused] = useState(false);
    const [localValue, setLocalValue] = useState(value || '');

    // Sync with external value changes
    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        
        // Debounced update to parent
        const timeoutId = setTimeout(() => {
            onChange(newValue);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    const handleClear = () => {
        setLocalValue('');
        onChange('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            handleClear();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            onChange(localValue);
        }
    };

    return (
        <div className={`searchdraftclubsbar-container ${isFocused ? 'searchdraftclubsbar-focused' : ''}`}>
            <div className="searchdraftclubsbar-icon-wrapper">
                <FontAwesomeIcon 
                    icon={faSearch} 
                    className="searchdraftclubsbar-search-icon"
                />
            </div>
            
            <input
                type="text"
                className="searchdraftclubsbar-input"
                placeholder={placeholder || t('searchDraftClubsBar.defaultPlaceholder')}
                value={localValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
            
            {localValue && (
                <button
                    type="button"
                    className="searchdraftclubsbar-clear-btn"
                    onClick={handleClear}
                    title={t('searchDraftClubsBar.clearSearch')}
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            )}

            {localValue && (
                <div className="searchdraftclubsbar-search-info">
                    <span className="searchdraftclubsbar-search-term">
                        {t('searchDraftClubsBar.searchingFor')}: "{localValue}"
                    </span>
                </div>
            )}
        </div>
    );
};

export default SearchDraftClubsBar;