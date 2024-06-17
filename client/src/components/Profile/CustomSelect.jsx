import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import './CustomSelect.css'; // Ensure to create and import your CSS for styling

const CustomSelect = ({ options, selectedOptions, onSelect, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleToggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleCheckboxChange = (e) => {
        const value = e.target.value;
        const newSelectedOptions = selectedOptions.includes(value)
            ? selectedOptions.filter(option => option !== value)
            : [...selectedOptions, value];
        
        onSelect(newSelectedOptions);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="custom-select-with-checkbox" ref={dropdownRef}>
            <label className="custom-select-label">
                {icon && <span className="custom-select-icon"><FontAwesomeIcon icon={icon} /></span>}
                
            </label>
            <div className="custom-select-header" onClick={handleToggleDropdown}>
                <span>{selectedOptions.length > 0 ? selectedOptions.join(', ') : 'Изберете'}</span>
                <span className="custom-select-chevron">
                    <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
                </span>
            </div>
            {isOpen && (
                <div className="custom-select-dropdown">
                    {options.map(option => (
                        <div key={option.value} className="checkbox-item">
                            <label>
                                <input
                                    type="checkbox"
                                    value={option.value}
                                    checked={selectedOptions.includes(option.value)}
                                    onChange={handleCheckboxChange}
                                />
                                {option.name}
                            </label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
