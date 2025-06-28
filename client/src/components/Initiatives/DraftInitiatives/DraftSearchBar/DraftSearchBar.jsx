// DraftSearchBar/DraftSearchBar.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './draftSearchBar.css';

const DraftSearchBar = ({ onSearch, placeholder = "Търси в черновите..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="draft-search-container">
      <div className="draft-search-input-wrapper">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input
          type="text"
          className="draft-search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchTerm && (
          <button 
            className="clear-search-btn"
            onClick={clearSearch}
            type="button"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
    </div>
  );
};

export default DraftSearchBar;