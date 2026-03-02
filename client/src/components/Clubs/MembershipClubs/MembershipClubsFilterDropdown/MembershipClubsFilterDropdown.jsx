import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons';
import './membershipClubsFilterDropdown.css';

const MembershipClubsFilterDropdown = ({ value, onChange, options }) => {
    const { t } = useTranslation('clubs');
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

    const handleOptionClick = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className="membershipclubsfilterdropdown-container" ref={dropdownRef}>
            <button
                type="button"
                className={`membershipclubsfilterdropdown-trigger ${isOpen ? 'membershipclubsfilterdropdown-trigger--open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <FontAwesomeIcon icon={faFilter} className="membershipclubsfilterdropdown-icon" />
                <span className="membershipclubsfilterdropdown-text">
                    {selectedOption?.label || t('membershipClubsFilterDropdown.defaultLabel')}
                </span>
                <FontAwesomeIcon 
                    icon={faChevronDown} 
                    className={`membershipclubsfilterdropdown-chevron ${isOpen ? 'membershipclubsfilterdropdown-chevron--open' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="membershipclubsfilterdropdown-menu">
                    <div className="membershipclubsfilterdropdown-header">
                        <span>{t('membershipClubsFilterDropdown.title')}</span>
                    </div>
                    <div className="membershipclubsfilterdropdown-options">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={`membershipclubsfilterdropdown-option ${
                                    value === option.value ? 'membershipclubsfilterdropdown-option--selected' : ''
                                }`}
                                onClick={() => handleOptionClick(option.value)}
                            >
                                <span className="membershipclubsfilterdropdown-option-text">
                                    {option.label}
                                </span>
                                {value === option.value && (
                                    <FontAwesomeIcon 
                                        icon={faCheck} 
                                        className="membershipclubsfilterdropdown-check-icon" 
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembershipClubsFilterDropdown;