import React, { useState, useEffect } from 'react';
import { useCommunityContext } from "../../contexts/CommunityContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import './searchWhere.css';

export const SearchWhere = ({ isOpen, onClose }) => {
    const { fetchRegions, fetchSubregions, regions, subregions } = useCommunityContext();
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedSubregion, setSelectedSubregion] = useState('');

    useEffect(() => {
        if (regions.length === 0) {
            fetchRegions(); 
        }
    }, [fetchRegions, regions]);

    useEffect(() => {
        if (selectedRegion && !subregions[selectedRegion]) {
            fetchSubregions(selectedRegion); 
        }
    }, [selectedRegion, fetchSubregions, subregions]);

    const handleSearch = () => {
        // console.log(`Търсене в регион: ${selectedRegion}, Община: ${selectedSubregion}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="where-modal-overlay">
            <div className="where-modal-content">
                <button className="where-close-button" onClick={onClose}>
                    <FontAwesomeIcon icon={faXmark} style={{ color: "#000000" }} />
                </button>
                <h2>Къде търсиш?</h2>
                <div className="where-select-container">
                    <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="where-select"
                    >
                        <option value="">Избери регион</option>
                        {regions.map(region => (
                            <option key={region.id} value={region.id}>{region.bg}</option>
                        ))}
                    </select>
                </div>
                <div className="where-select-container">
                    <select
                        value={selectedSubregion}
                        onChange={(e) => setSelectedSubregion(e.target.value)}
                        className="where-select"
                        disabled={!selectedRegion}
                    >
                        <option value="">Избери община</option>
                        {selectedRegion && subregions[selectedRegion] && subregions[selectedRegion].map(subregion => (
                            <option key={subregion.id} value={subregion.id}>{subregion.bg}</option>
                        ))}
                    </select>
                </div>
                <button onClick={handleSearch} className="where-search-button">Приложи</button>
            </div>
        </div>
    );
};
