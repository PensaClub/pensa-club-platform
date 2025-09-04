import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faTimes,
    faSpinner,
    faHistory,
    faFilter,
    faMicrophone,
    faKeyboard
} from '@fortawesome/free-solid-svg-icons';
import './adminSearchBar.css';

const AdminSearchBar = ({ value, onChange, placeholder, onAdvancedSearch }) => {
    const { t } = useTranslation();
    const [isFocused, setIsFocused] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    
    const inputRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Load search history from localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem('adminClubsSearchHistory');
        if (savedHistory) {
            try {
                setSearchHistory(JSON.parse(savedHistory));
            } catch (error) {
                console.error('Error loading search history:', error);
            }
        }

        // Check if voice recognition is available
        setIsVoiceEnabled('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    }, []);

    // Save search history to localStorage
    const saveSearchHistory = (term) => {
        if (!term.trim() || term.length < 2) return;

        const newHistory = [term, ...searchHistory.filter(item => item !== term)].slice(0, 10);
        setSearchHistory(newHistory);
        localStorage.setItem('adminClubsSearchHistory', JSON.stringify(newHistory));
    };

    // Handle search input change with debounce
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        onChange(newValue);

        // Show searching indicator for non-empty searches
        if (newValue.trim()) {
            setIsSearching(true);
            
            // Clear previous timeout
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            // Simulate search delay and save to history
            searchTimeoutRef.current = setTimeout(() => {
                setIsSearching(false);
                if (newValue.trim().length >= 2) {
                    saveSearchHistory(newValue.trim());
                }
            }, 500);
        } else {
            setIsSearching(false);
        }
    };

    // Handle input focus
    const handleFocus = () => {
        setIsFocused(true);
        if (searchHistory.length > 0 && !value.trim()) {
            setShowHistory(true);
        }
    };

    // Handle input blur
    const handleBlur = () => {
        // Delay blur to allow clicking on history items
        setTimeout(() => {
            setIsFocused(false);
            setShowHistory(false);
        }, 150);
    };

    // Clear search
    const handleClear = () => {
        onChange('');
        setIsSearching(false);
        inputRef.current?.focus();
    };

    // Select from history
    const handleHistorySelect = (term) => {
        onChange(term);
        setShowHistory(false);
        inputRef.current?.focus();
    };

    // Clear search history
    const clearSearchHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('adminClubsSearchHistory');
        setShowHistory(false);
    };

    // Voice search functionality
    const handleVoiceSearch = () => {
        if (!isVoiceEnabled) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'bg-BG';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsSearching(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onChange(transcript);
            saveSearchHistory(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsSearching(false);
        };

        recognition.onend = () => {
            setIsSearching(false);
        };

        recognition.start();
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            if (value) {
                handleClear();
            } else {
                inputRef.current?.blur();
            }
        } else if (e.key === 'ArrowDown' && showHistory) {
            // Handle history navigation (could be extended)
            e.preventDefault();
        }
    };

    return (
        <div className="adminsearchbar-container">
            <div className={`adminsearchbar-wrapper ${isFocused ? 'focused' : ''}`}>
                {/* Search Icon */}
                <div className="adminsearchbar-icon-left">
                    {isSearching ? (
                        <FontAwesomeIcon icon={faSpinner} spin className="adminsearchbar-spinner" />
                    ) : (
                        <FontAwesomeIcon icon={faSearch} className="adminsearchbar-search-icon" />
                    )}
                </div>

                {/* Search Input */}
                <input
                    ref={inputRef}
                    type="text"
                    className="adminsearchbar-input"
                    placeholder={placeholder || t('adminSearchBar.placeholder')}
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                />

                {/* Action Buttons */}
                <div className="adminsearchbar-actions">
                    {/* Voice Search Button */}
                    {isVoiceEnabled && (
                        <button
                            className="adminsearchbar-action-btn"
                            onClick={handleVoiceSearch}
                            title={t('adminSearchBar.voiceSearch')}
                            disabled={isSearching}
                        >
                            <FontAwesomeIcon icon={faMicrophone} />
                        </button>
                    )}

                    {/* Advanced Search Toggle */}
                    {onAdvancedSearch && (
                        <button
                            className={`adminsearchbar-action-btn ${showAdvanced ? 'active' : ''}`}
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            title={t('adminSearchBar.advancedSearch')}
                        >
                            <FontAwesomeIcon icon={faFilter} />
                        </button>
                    )}

                    {/* Clear Button */}
                    {value && (
                        <button
                            className="adminsearchbar-action-btn adminsearchbar-clear-btn"
                            onClick={handleClear}
                            title={t('adminSearchBar.clear')}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    )}
                </div>

                {/* Search History Dropdown */}
                {showHistory && searchHistory.length > 0 && (
                    <div className="adminsearchbar-history-dropdown">
                        <div className="adminsearchbar-history-header">
                            <FontAwesomeIcon icon={faHistory} />
                            <span>{t('adminSearchBar.recentSearches')}</span>
                            <button
                                className="adminsearchbar-history-clear"
                                onClick={clearSearchHistory}
                                title={t('adminSearchBar.clearHistory')}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <div className="adminsearchbar-history-list">
                            {searchHistory.map((term, index) => (
                                <button
                                    key={index}
                                    className="adminsearchbar-history-item"
                                    onClick={() => handleHistorySelect(term)}
                                >
                                    <FontAwesomeIcon icon={faHistory} />
                                    <span>{term}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Advanced Search Panel */}
            {showAdvanced && onAdvancedSearch && (
                <div className="adminsearchbar-advanced-panel">
                    <div className="adminsearchbar-advanced-header">
                        <FontAwesomeIcon icon={faFilter} />
                        <span>{t('adminSearchBar.advancedFilters')}</span>
                        <button
                            className="adminsearchbar-advanced-close"
                            onClick={() => setShowAdvanced(false)}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    <div className="adminsearchbar-advanced-content">
                        <div className="adminsearchbar-advanced-row">
                            <div className="adminsearchbar-advanced-field">
                                <label>{t('adminSearchBar.searchIn.label')}</label>
                                <select className="adminsearchbar-advanced-select">
                                    <option value="all">{t('adminSearchBar.searchIn.all')}</option>
                                    <option value="name">{t('adminSearchBar.searchIn.name')}</option>
                                    <option value="description">{t('adminSearchBar.searchIn.description')}</option>
                                    <option value="location">{t('adminSearchBar.searchIn.location')}</option>
                                    <option value="owner">{t('adminSearchBar.searchIn.owner')}</option>
                                </select>
                            </div>

                            <div className="adminsearchbar-advanced-field">
                                <label>{t('adminSearchBar.dateRange.label')}</label>
                                <select className="adminsearchbar-advanced-select">
                                    <option value="any">{t('adminSearchBar.dateRange.any')}</option>
                                    <option value="today">{t('adminSearchBar.dateRange.today')}</option>
                                    <option value="week">{t('adminSearchBar.dateRange.week')}</option>
                                    <option value="month">{t('adminSearchBar.dateRange.month')}</option>
                                    <option value="year">{t('adminSearchBar.dateRange.year')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="adminsearchbar-advanced-actions">
                            <button
                                className="adminsearchbar-advanced-btn adminsearchbar-advanced-btn--search"
                                onClick={() => {
                                    onAdvancedSearch();
                                    setShowAdvanced(false);
                                }}
                            >
                                <FontAwesomeIcon icon={faSearch} />
                                {t('adminSearchBar.search')}
                            </button>
                            
                            <button
                                className="adminsearchbar-advanced-btn adminsearchbar-advanced-btn--reset"
                                onClick={() => {
                                    handleClear();
                                    setShowAdvanced(false);
                                }}
                            >
                                {t('adminSearchBar.reset')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Keyboard Shortcuts Hint */}
            <div className="adminsearchbar-shortcuts">
                <div className="adminsearchbar-shortcut">
                    <FontAwesomeIcon icon={faKeyboard} />
                    <span>{t('adminSearchBar.shortcuts.esc')}</span>
                </div>
            </div>
        </div>
    );
};

export default AdminSearchBar;