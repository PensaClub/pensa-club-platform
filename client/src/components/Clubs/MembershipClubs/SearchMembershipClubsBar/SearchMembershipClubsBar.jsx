import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import './searchMembershipClubsBar.css';

const SearchMembershipClubsBar = ({ value, onChange, placeholder }) => {
    const { t } = useTranslation();
    const [isFocused, setIsFocused] = useState(false);

    const handleClear = () => {
        onChange('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            handleClear();
        }
    };

    return (
        <div className={`searchmembershipclubsbar-container ${isFocused ? 'searchmembershipclubsbar-container--focused' : ''}`}>
            <div className="searchmembershipclubsbar-input-wrapper">
                <FontAwesomeIcon 
                    icon={faSearch} 
                    className="searchmembershipclubsbar-search-icon" 
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || t('searchMembershipClubsBar.defaultPlaceholder')}
                    className="searchmembershipclubsbar-input"
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="searchmembershipclubsbar-clear-btn"
                        title={t('searchMembershipClubsBar.clear')}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                )}
            </div>
            
            {value && (
                <div className="searchmembershipclubsbar-results-info">
                    <span>{t('searchMembershipClubsBar.searching')} "{value}"</span>
                </div>
            )}
        </div>
    );
};

export default SearchMembershipClubsBar;