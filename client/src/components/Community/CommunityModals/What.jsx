import React, { useState } from 'react';
import './what.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark} from '@fortawesome/free-solid-svg-icons';
import { useCommunityContext } from '../../contexts/CommunityContext';
export const What = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('всички');
    const {searchCriteria } = useCommunityContext();
    console.log('searchCriteria', searchCriteria)
    const handleSearch = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="what-modal-overlay">
            <div className="what-modal-content">
                <button className="what-close-button" onClick={onClose}><FontAwesomeIcon icon={faXmark} style={{color: "#000000",}} /></button>
                <h2>Какво търсиш?</h2>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Въведи търсенето си"
                    className="what-input"
                />
                <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="what-select">
                    <option value="всички">Всички</option>
                   {searchCriteria?.map(criteria=>(
                    <option key={criteria.id} value={criteria.name}>{criteria.name}</option>
                   ))}
                </select>
                <button onClick={handleSearch} className="what-search-button">Приложи</button>
            </div>
        </div>
    );
};
