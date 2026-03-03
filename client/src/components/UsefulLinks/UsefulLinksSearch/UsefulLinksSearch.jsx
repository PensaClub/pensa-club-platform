import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './usefulLinksSearch.css';

const UsefulLinksSearch = ({ onSearch }) => {
  const { t } = useTranslation('useful-links');
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(inputValue);
    }, 400);
    return () => clearTimeout(timeout);
  }, [inputValue]);

  return (
    <div className="uls-search-wrapper">
      <div className="uls-search-container">
        <svg className="uls-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          className="uls-search-input"
          placeholder={t('page.searchPlaceholder')}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        {inputValue && (
          <button className="uls-clear-btn" onClick={() => setInputValue('')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default UsefulLinksSearch;
