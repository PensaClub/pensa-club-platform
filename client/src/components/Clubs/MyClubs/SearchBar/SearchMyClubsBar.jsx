import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import './searchMyClubsBar.css';

const SearchMyClubsBar = ({ value, onChange, placeholder }) => {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="searchmyclubs-bar">
      <div className="searchmyclubs-input-wrapper">
        <FontAwesomeIcon icon={faSearch} className="searchmyclubs-icon" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="searchmyclubs-input"
        />
        {value && (
          <button
            onClick={handleClear}
            className="searchmyclubs-clear-button"
            type="button"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchMyClubsBar;