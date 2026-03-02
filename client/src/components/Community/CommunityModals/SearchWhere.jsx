import { useState, useEffect } from 'react';
import { useCommunityContext } from "../../contexts/CommunityContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import './searchWhere.css';
import { useTranslation } from 'react-i18next';

export const SearchWhere = ({ isOpen, onClose, setFilters, filters }) => {
    const { fetchRegions, fetchSubregions, regions, subregions } = useCommunityContext();
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedSubregion, setSelectedSubregion] = useState('');
    const { t, i18n } = useTranslation('community');
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

    const handleRegionChange = (e) => {
        const regionId = e.target.value;
        const regionName = regions.find(region => region.id === Number(regionId))?.[currentLanguage] || '';
        setSelectedRegion(regionId);
        setFilters(prev => ({ ...prev, adRegion: regionId, adRegionName: regionName, adSubregion: '', adSubregionName: '' }));
    };

    const handleSubregionChange = (e) => {
        const subregionId = e.target.value;
        const subregionName = subregions[selectedRegion]?.find(subregion => subregion.id === Number(subregionId))?.[currentLanguage] || '';
        setSelectedSubregion(subregionId);
        setFilters(prev => ({ ...prev, adSubregion: subregionId, adSubregionName: subregionName }));
    };

    const handleSearch = () => {
        setSelectedRegion('');
        setSelectedSubregion('');
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
                        onChange={handleRegionChange}
                        className="where-select"
                    >
                        <option value="">{t('community.select_region')}</option>
                        {regions.map(region => (
                            <option key={region.id} value={region.id}>
                                {currentLanguage === 'bg' ? region.bg : region.en}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="where-select-container">
                    <select
                        value={selectedSubregion}
                        onChange={handleSubregionChange}
                        className="where-select"
                        disabled={!selectedRegion}
                    >
                        <option value="">{t('community.select_municipality')}</option>
                        {selectedRegion && subregions[selectedRegion] && subregions[selectedRegion].map(subregion => (
                            <option key={subregion.id} value={subregion.id}>
                                {currentLanguage === 'bg' ? subregion.bg : subregion.en}
                            </option>
                        ))}
                    </select>
                </div>
                <button onClick={handleSearch} className="btn-general btn-orange">{t('community.apply_btn')}</button>
            </div>
        </div>
    );
};
