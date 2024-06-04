import React, { useState, useEffect, useRef } from 'react';
import './filterMap.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faUniversalAccess, faUsersGear, faBars, faTimes, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

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

    const trimString = (str, num) => {
        if (str.length <= num) return str;
        return str.slice(0, num) + '...';
    }

    return (
        <div className="custom-select" ref={selectRef}>
            <div className="selected-option" onClick={() => setIsOpen(!isOpen)}>
                <FontAwesomeIcon icon={icon} style={{ marginRight: '8px', color: "#e26020" }} />
                {trimString(selectedValues.map(value => options.find(option => option.value === value)?.name).join(' | '), 28) || <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>Избери...</span>}
                {selectedValues.length > 0 && <p className='number-filters'>({selectedValues.length})</p>}
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

const FilterSection = ({ title, options, selectedValues, onChange, icon }) => (
    <div className="filter-section">
        <h4> <FontAwesomeIcon icon={icon} style={{ marginRight: '8px', color: "#e26020" }} />
            {title} {selectedValues.length > 0 && <>({selectedValues.length})</>}</h4>
        {options.map(option => (
            <div key={option.value} className="option">
                <input
                    type="checkbox"
                    id={`checkbox-${option.value}`}
                    checked={selectedValues.includes(option.value)}
                    onChange={() => onChange(option.value)}
                />
                <label htmlFor={`checkbox-${option.value}`}>{option.name}</label>
            </div>
        ))}
    </div>
);

export const FiltersMap = () => {
    const [optionData, setOptionData] = useState(null);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedWorks, setSelectedWorks] = useState([]);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        fetch('./options.json')
            .then(response => response.json())
            .then(data => {
                setOptionData(data);
            })
            .catch(error => console.error('Failed to load JSON data', error));
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSkillChange = (value) => {
        setSelectedSkills(selectedSkills.includes(value) ? selectedSkills.filter(item => item !== value) : [...selectedSkills, value]);
    };

    const handleWorkChange = (value) => {
        setSelectedWorks(selectedWorks.includes(value) ? selectedWorks.filter(item => item !== value) : [...selectedWorks, value]);
    };

    const handleInterestChange = (value) => {
        setSelectedInterests(selectedInterests.includes(value) ? selectedInterests.filter(item => item !== value) : [...selectedInterests, value]);
    };

    return (
        <div className="filters-map">
            <div className="logo-map">
                <img src="/images/map/pensamap2.png" alt="map-logo" />
            </div>
            <div className="filters">
                <div className="filter-main">
                    <label>Умения</label>
                    {optionData ? (
                        <CustomSelect
                            icon={faUniversalAccess}
                            options={optionData.skills}
                            selectedValues={selectedSkills}
                            onChange={setSelectedSkills}
                            searchPlaceholder="Намери умения..."
                        />
                    ) : (
                        <div>Loading...</div>
                    )}
                </div>
                <div className="filter-main">
                    <label>Професия</label>
                    {optionData ? (
                        <CustomSelect
                            icon={faBriefcase}
                            options={optionData.workOptions}
                            selectedValues={selectedWorks}
                            onChange={setSelectedWorks}
                            searchPlaceholder="Намери професия..."
                        />
                    ) : (
                        <div>Loading...</div>
                    )}
                </div>
                <div className="filter-main">
                    <label>Интереси</label>
                    {optionData ? (
                        <CustomSelect
                            icon={faUsersGear}
                            options={optionData.interestOptions}
                            selectedValues={selectedInterests}
                            onChange={setSelectedInterests}
                            searchPlaceholder="Намери интереси..."
                        />
                    ) : (
                        <div>Loading...</div>
                    )}
                </div>
            </div>
            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="hamburger" onClick={toggleMenu} />
            <div className={`hamburger-menu ${isMenuOpen ? 'open' : ''}`}>
                <div className="filters">
                    {optionData ? (
                        <>
                            <FilterSection
                                icon={faUniversalAccess}
                                title="Умения"
                                options={optionData.skills}
                                selectedValues={selectedSkills}
                                onChange={handleSkillChange}
                            />
                            <FilterSection
                                icon={faBriefcase}
                                title="Професия"
                                options={optionData.workOptions}
                                selectedValues={selectedWorks}
                                onChange={handleWorkChange}
                            />
                            <FilterSection
                                icon={faUsersGear}

                                title="Интереси"
                                options={optionData.interestOptions}
                                selectedValues={selectedInterests}
                                onChange={handleInterestChange}
                            />
                        </>
                    ) : (
                        <div>Loading...</div>
                    )}
                </div>
            </div>
        </div>
    );
};
