import React, { useState, useEffect, useRef } from 'react';
import optionsData from './options.json';
import './filterMap.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faMagnifyingGlass, faUniversalAccess, faUsersGear } from '@fortawesome/free-solid-svg-icons';


const CustomSelect = ({ options, selectedValue, onChange, searchPlaceholder, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const selectRef = useRef();

    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOptionClick = (value) => {
        onChange(value);
        setIsOpen(false);
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
                {options.find(option => option.value === selectedValue)?.name}
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
                            <div
                                key={option.value}
                                className="option"
                                onClick={() => handleOptionClick(option.value)}
                            >
                                {option.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const FiltersMap = () => {
    const { fruitOptions, workOptions, interestOptions } = optionsData;

    const [selectedFruit, setSelectedFruit] = useState(fruitOptions.find(option => option.defaultValue)?.value || fruitOptions[0].value);
    const [selectedWork, setSelectedWork] = useState(workOptions.find(option => option.defaultValue)?.value || workOptions[0].value);
    const [selectedInterest, setSelectedInterest] = useState(interestOptions.find(option => option.defaultValue)?.value || interestOptions[0].value);

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
                        options={fruitOptions}
                        selectedValue={selectedFruit}
                        onChange={setSelectedFruit}
                        searchPlaceholder="Search Fruits..."
                    />
                </div>
                <div className="filter-main">
                    <label>Работа</label>
                    <CustomSelect
                        icon={faBriefcase}
                        options={workOptions}
                        selectedValue={selectedWork}
                        onChange={setSelectedWork}
                        searchPlaceholder="Search Work..."
                    />
                </div>
                <div className="filter-main">
                    <label>Интереси</label>
                    
                    <CustomSelect
                        icon={faUsersGear}
                        options={interestOptions}
                        selectedValue={selectedInterest}
                        onChange={setSelectedInterest}
                        searchPlaceholder="Search Interests..."
                    />
                </div>
            </div>
        </div>
    );
};
