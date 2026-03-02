import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './projectSearch.css';

const ProjectSearch = ({ onSearch, placeholder }) => {
    const { t } = useTranslation('content');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(searchTerm);
        } else {
            console.error('❌ onSearch function not provided!');
        }
    }, [searchTerm, onSearch]);

    const handleClear = useCallback(() => {
  
        setSearchTerm('');
        if (onSearch) {
            onSearch('');
        }
    }, [onSearch]);

    const handleInputChange = useCallback((e) => {
        const value = e.target.value;

        setSearchTerm(value);
        
        // ПРЕМАХНИ DEBOUNCE ЗАСЕГА - директно търси
        if (onSearch) {
            onSearch(value);
        } else {
            console.error('❌ onSearch function not provided!');
        }
    }, [onSearch]);

    return (
        <form className="proj-search" onSubmit={handleSubmit}>
            <div className={`proj-search__wrapper ${isFocused ? 'proj-search__wrapper--focused' : ''}`}>
                <div className="proj-search__icon">
                    <svg className="proj-search__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                    </svg>
                </div>
                
                <input
                    type="text"
                    className="proj-search__input"
                    placeholder={placeholder || t('projects.search.placeholder')}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                
                {searchTerm && (
                    <button
                        type="button"
                        className="proj-search__clear"
                        onClick={handleClear}
                        aria-label={t('projects.search.clear')}
                    >
                        <svg className="proj-search__clear-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                )}
            </div>
        </form>
    );
};

export default ProjectSearch;