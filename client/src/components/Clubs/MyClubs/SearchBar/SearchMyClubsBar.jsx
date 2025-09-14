import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import './searchMyClubsBar.css';

const SearchMyClubsBar = ({ value, onChange, placeholder, onSearch }) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync with parent value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleSearch = () => {
    onChange(localValue);
    if (onSearch) onSearch();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="searchmyclubs-bar">
      <div className="searchmyclubs-input-wrapper">
        <FontAwesomeIcon icon={faSearch} className="searchmyclubs-icon" />
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="searchmyclubs-input"
        />
        {localValue && (
          <button
            onClick={handleClear}
            className="searchmyclubs-clear-button"
            type="button"
            title="Clear search"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
        <button
          onClick={handleSearch}
          className="searchmyclubs-search-button"
          type="button"
          title="Search"
        >
          <FontAwesomeIcon icon={faSearch} />
          <span className="searchmyclubs-search-text">Search</span>
        </button>
      </div>
      {localValue && localValue !== value && (
        <div className="searchmyclubs-hint">
          Press Enter or click Search to find results
        </div>
      )}
    </div>
  );
};

export default SearchMyClubsBar;