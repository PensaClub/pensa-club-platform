import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons';
import './membershipClubsSortDropdown.css';

const MembershipClubsSortDropdown = ({ value, onChange, options }) => {
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
        <div className="membershipclubssortdropdown-container" ref={dropdownRef}>
            <button
                type="button"
                className={`membershipclubssortdropdown-trigger ${isOpen ? 'membershipclubssortdropdown-trigger--open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <FontAwesomeIcon icon={faSort} className="membershipclubssortdropdown-icon" />
                <span className="membershipclubssortdropdown-text">
                    {selectedOption?.label || t('membershipClubsSortDropdown.defaultLabel')}
                </span>
                <FontAwesomeIcon 
                    icon={faChevronDown} 
                    className={`membershipclubssortdropdown-chevron ${isOpen ? 'membershipclubssortdropdown-chevron--open' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="membershipclubssortdropdown-menu">
                    <div className="membershipclubssortdropdown-header">
                        <span>{t('membershipClubsSortDropdown.title')}</span>
                    </div>
                    <div className="membershipclubssortdropdown-options">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={`membershipclubssortdropdown-option ${
                                    value === option.value ? 'membershipclubssortdropdown-option--selected' : ''
                                }`}
                                onClick={() => handleOptionClick(option.value)}
                            >
                                <span className="membershipclubssortdropdown-option-text">
                                    {option.label}
                                </span>
                                {value === option.value && (
                                    <FontAwesomeIcon 
                                        icon={faCheck} 
                                        className="membershipclubssortdropdown-check-icon" 
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

export default MembershipClubsSortDropdown;