import React, { useState, useEffect } from 'react';
import { useCommunityContext } from "../../contexts/CommunityContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import './searchWhere.css';
import { useTranslation } from 'react-i18next';

export const SearchWhere = ({ isOpen, onClose, setFilters, filters}) => {
    const { fetchRegions, fetchSubregions, regions, subregions } = useCommunityContext();
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedSubregion, setSelectedSubregion] = useState('');
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;
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
        const updateFilters = {...filters, adRegion:selectedRegion, adSubregion:selectedSubregion,};
        setFilters(updateFilters);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="where-modal-overlay">
            <div className="where-modal-content">
                <button className="where-close-button" onClick={onClose}>
                    <FontAwesomeIcon icon={faXmark} style={{ color: "#000000" }} />
                </button>
                <h2>{t('community.where_search_menu')} ?</h2>
                <div className="where-select-container">
                    <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="where-select"
                    >
                        <option value="">{t('community.select_region')}</option>
                        {regions.map(region => (
                            <option key={region.id} value={region.id}>
                              {currentLanguage === 'bg' && `${region.bg}`}
                              {currentLanguage === 'en' && `${region.en}`}
                                </option>
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
                        <option value="">{t('community.select_municipality')}</option>
                        {selectedRegion && subregions[selectedRegion] && subregions[selectedRegion].map(subregion => (
                            <option key={subregion.id} value={subregion.id}> {currentLanguage === 'bg' && `${subregion.bg}`}
                                {currentLanguage === 'en' && `${subregion.en}`}</option>
                        ))}
                    </select>
                </div>
                <button onClick={handleSearch} className="where-search-button">{t('community.apply_btn')}</button>
            </div>
        </div>
    );
};
