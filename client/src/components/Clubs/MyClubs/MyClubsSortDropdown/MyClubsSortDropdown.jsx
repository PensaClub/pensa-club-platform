// src/components/Profile/MyClubs/components/MyClubsSortDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faChevronDown, faCheck, faSortAmountDown } from '@fortawesome/free-solid-svg-icons';
import './myClubsSortDropdown.css';

const MyClubsSortDropdown = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(option => option.value === value);

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

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="myclubssort-dropdown" ref={dropdownRef}>
      <button
        className={`myclubssort-trigger ${isOpen ? 'myclubssort-trigger--active' : ''}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="myclubssort-trigger-content">
          <FontAwesomeIcon icon={faSortAmountDown} className="myclubssort-trigger-icon" />
          <span className="myclubssort-trigger-text">
            {selectedOption?.label || 'Sort'}
          </span>
        </div>
        <FontAwesomeIcon 
          icon={faChevronDown} 
          className={`myclubssort-trigger-arrow ${isOpen ? 'myclubssort-trigger-arrow--rotated' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="myclubssort-menu">
          <div className="myclubssort-menu-header">
            <span>Sort by</span>
          </div>
          <ul className="myclubssort-options" role="listbox">
            {options.map((option) => (
              <li key={option.value} className="myclubssort-option-wrapper">
                <button
                  className={`myclubssort-option ${
                    value === option.value ? 'myclubssort-option--selected' : ''
                  }`}
                  onClick={() => handleOptionClick(option.value)}
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                >
                  <span className="myclubssort-option-text">
                    {option.label}
                  </span>
                  {value === option.value && (
                    <FontAwesomeIcon 
                      icon={faCheck} 
                      className="myclubssort-option-check" 
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MyClubsSortDropdown;