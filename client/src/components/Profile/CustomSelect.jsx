import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import './CustomSelect.css';
import { useTranslation } from 'react-i18next';

const CustomSelect = ({ options, selectedOptions, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { t } = useTranslation('profile');

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

    const handleToggleDropdown = (e) => {
        e.preventDefault();
        setIsOpen(!isOpen);
    };

    const handleCheckboxChange = (e) => {
        e.stopPropagation();
        const value = e.target.value;
        const newSelectedOptions = selectedOptions.includes(value)
            ? selectedOptions.filter(option => option !== value)
            : [...selectedOptions, value];
        onSelect(newSelectedOptions);
    };

    const handleSelectAll = (e) => {
        e.preventDefault();
        const allOptions = options.map(option => option.value);
        onSelect(allOptions);
    };

    const handleClearSelection = (e) => {
        e.preventDefault();
        onSelect([]);
    };

    const preventDefaultBehavior = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div className="custom-select-with-checkbox" ref={dropdownRef} onClick={preventDefaultBehavior}>
            <label className="custom-select-label"></label>
            <div className="custom-select-header" onClick={handleToggleDropdown}>
                <span>{selectedOptions.length > 0 ? `${selectedOptions.length} ${t('profile.selected')}` : t('profile.select')}</span>
                <span className="custom-select-chevron">
                    <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
                </span>
            </div>
            {isOpen && (
                <div className="custom-select-dropdown">
                    <div className="select-all-clear">
                        <button
                            onClick={handleSelectAll}
                            className="select-all-btn"
                        >
                            {t('profile.select_all')}
                        </button>
                        <button
                            onClick={handleClearSelection}
                            className="clear-btn"
                        >
                            {t('profile.clear')}
                        </button>
                    </div>

                    {options.map(option => (
                        <div key={option.value} className={`checkbox-item-custom ${selectedOptions.includes(option.value) ? 'checked' : ''}`}>
                            <label>
                                <input
                                    type="checkbox"
                                    value={option.value}
                                    checked={selectedOptions.includes(option.value)}
                                    onChange={handleCheckboxChange}
                                    onClick={(e) => e.stopPropagation()} 
                                />
                                {t(option.name)}
                            </label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
