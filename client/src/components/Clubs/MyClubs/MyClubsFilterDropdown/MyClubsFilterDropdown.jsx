import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons';
import './myClubsFilterDropdown.css';

const MyClubsFilterDropdown = ({ value, onChange, options }) => {
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
    <div className="myclunsfilter-dropdown" ref={dropdownRef}>
      <button
        className={`myclunsfilter-trigger ${isOpen ? 'myclunsfilter-trigger--active' : ''}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="myclunsfilter-trigger-content">
          <FontAwesomeIcon icon={faFilter} className="myclunsfilter-trigger-icon" />
          <span className="myclunsfilter-trigger-text">
            {selectedOption?.label || 'Filter'}
          </span>
        </div>
        <FontAwesomeIcon 
          icon={faChevronDown} 
          className={`myclunsfilter-trigger-arrow ${isOpen ? 'myclunsfilter-trigger-arrow--rotated' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="myclunsfilter-menu">
          <div className="myclunsfilter-menu-header">
            <span>Filter by</span>
          </div>
          <ul className="myclunsfilter-options" role="listbox">
            {options.map((option) => (
              <li key={option.value} className="myclunsfilter-option-wrapper">
                <button
                  className={`myclunsfilter-option ${
                    value === option.value ? 'myclunsfilter-option--selected' : ''
                  }`}
                  onClick={() => handleOptionClick(option.value)}
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                >
                  <span className="myclunsfilter-option-text">
                    {option.label}
                  </span>
                  {value === option.value && (
                    <FontAwesomeIcon 
                      icon={faCheck} 
                      className="myclunsfilter-option-check" 
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

export default MyClubsFilterDropdown;