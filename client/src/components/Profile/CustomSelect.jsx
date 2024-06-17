import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import './CustomSelect.css';

const CustomSelect = ({ options, selectedOptions, onSelect}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

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

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };


    const handleSelectAll = (e) => {
        e.preventDefault()
        const allOptions = options.map(option => option.value);
        onSelect(allOptions);
    };

    const handleClearSelection = (e) => {
        e.preventDefault()
        onSelect([]);
    };



    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="custom-select-with-checkbox" ref={dropdownRef}>
            <label className="custom-select-label"></label>
            <div className="custom-select-header" onClick={handleToggleDropdown}>
                <span>{selectedOptions.length > 0 ? `${selectedOptions.length} избрани ` : 'Изберете'}</span>
                <span className="custom-select-chevron">
                    <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
                </span>
            </div>
            {isOpen && (
                <div className="custom-select-dropdown" onClick={(e) => e.stopPropagation()}>

                    <div className="select-all-clear">
                        <button onClick={handleSelectAll} className="select-all-btn">Изберете всички</button>
                        <button onClick={handleClearSelection} className="clear-btn">Изчистете</button>
                    </div>

                    {options.map(option => (

                        <div key={option.value} className={`checkbox-item ${selectedOptions.includes(option.value) ? 'checked' : ''}`}>

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
