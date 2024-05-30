import React, { useState, useEffect, useRef } from 'react';
import optionsData from './options.json';
import './filterMap.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faMagnifyingGlass, faUniversalAccess, faUsersGear } from '@fortawesome/free-solid-svg-icons';



const CustomSelect = ({ options, selectedValues, onChange, searchPlaceholder, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const selectRef = useRef();

    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOptionChange = (value) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter(selectedValue => selectedValue !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    const handleClickOutside = (event) => {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
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
        <div className="custom-select" ref={selectRef}>
            <div className="selected-option" onClick={() => setIsOpen(!isOpen)}>
                <FontAwesomeIcon icon={icon} style={{ marginRight: '8px', color: "#e26020" }} />
                {selectedValues.map(value => options.find(option => option.value === value)?.name).join(' | ') || 'Избери...'}  {/* //Пробно е пуснато да се види при повече опции */}
                <span className={`arrow ${isOpen ? 'open' : ''}`}></span>
            </div>
            {isOpen && (
                <div className="options-container">
                    <div className="social-input">
                        <FontAwesomeIcon icon={faMagnifyingGlass} style={{ marginRight: '8px', color: "#e26020", paddingLeft: "10px" }} />
                        <input
                            type="text"
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={searchPlaceholder}
                        />
                    </div>
                    <div className="options">
                        {filteredOptions.map((option) => (
                            <div key={option.value} className="option">
                                <input
                                    type="checkbox"
                                    id={`checkbox-${option.value}`}
                                    checked={selectedValues.includes(option.value)}
                                    onChange={() => handleOptionChange(option.value)}
                                />
                                <label htmlFor={`checkbox-${option.value}`}>{option.name}</label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const FiltersMap = () => {
    const { hobbiesOptions, workOptions, interestOptions } = optionsData;
    const [selectedHobbies, setSelectedHobbies] = useState([]);
    console.log('hobbiesOptions', selectedHobbies)

    const [selectedWorks, setSelectedWorks] = useState([]);
    const [selectedInterests, setSelectedInterests] = useState([]);

    return (
        <div className="filters-map">
            <div className="logo-map">
                <img src="/images/map/pensamap2.png" alt="map-logo" />
            </div>
            <div className="filters">
                <div className="filter-main">
                    <label>Хобита</label>
                    <CustomSelect
                        icon={faUniversalAccess}
                        options={hobbiesOptions}
                        selectedValues={selectedHobbies}
                        onChange={setSelectedHobbies}
                        searchPlaceholder="Search Fruits..."
                    />
                </div>
                <div className="filter-main">
                    <label>Професия</label>
                    <CustomSelect
                        icon={faBriefcase}
                        options={workOptions}
                        selectedValues={selectedWorks}
                        onChange={setSelectedWorks}
                        searchPlaceholder="Search Work..."
                    />
                </div>
                <div className="filter-main">
                    <label>Интереси</label>
                    <CustomSelect
                        icon={faUsersGear}
                        options={interestOptions}
                        selectedValues={selectedInterests}
                        onChange={setSelectedInterests}
                        searchPlaceholder="Search Interests..."
                    />
                </div>
            </div>
        </div>
    );
};
