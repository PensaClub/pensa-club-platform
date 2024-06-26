import { useCommunityContext } from "../../contexts/CommunityContext";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import './filtersCommunity.css';

export const FiltersCommunity = () => {
    const { fetchSubregions, regions, subregions } = useCommunityContext();
    const [openSelects, setOpenSelects] = useState({});
    const [selectedSubregions, setSelectedSubregions] = useState({});

    useEffect(() => {
        if (regions.length > 0) {
            regions.forEach(region => {
                if (!subregions[region.id]) {
                    fetchSubregions(region.id);
                }
            });
        }
    }, [regions, fetchSubregions, subregions]);

    const toggleSelect = (regionId) => {
        setOpenSelects(prev => ({ ...prev, [regionId]: !prev[regionId] }));
    };

    const handleOptionClick = (regionId, subregionId) => {
        setSelectedSubregions(prev => ({ ...prev, [regionId]: subregionId }));
    };

    return (
        <>
            <section className="unique-main-filters">
                <div className="unique-filters-community">
                    {regions.map(region => (
                        <div key={region.id} className={`unique-region-filter ${openSelects[region.id] ? 'open' : ''}`}>
                            <div className="unique-select-container">
                                <div className="unique-select-wrapper">
                                    <div
                                        id={`select-${region.id}`}
                                        className={`unique-select-display ${openSelects[region.id] ? 'open' : ''}`}
                                        onClick={() => toggleSelect(region.id)}
                                    >
                                        {region.bg}
                                    </div>
                                    <FontAwesomeIcon
                                        icon={openSelects[region.id] ? faChevronUp : faChevronDown}
                                        className={`unique-select-arrow ${openSelects[region.id] ? 'open' : ''}`}
                                        onClick={() => toggleSelect(region.id)}
                                    />
                                </div>
                                <div className={`unique-options-container ${openSelects[region.id] ? 'open' : ''}`}>
                                    {subregions[region.id] && subregions[region.id].map(subregion => (
                                        <div
                                            key={subregion.id}
                                            className={`unique-option ${selectedSubregions[region.id] === subregion.id ? 'selected' : ''}`}
                                            onClick={() => handleOptionClick(region.id, subregion.id)}
                                        >
                                            {subregion.bg}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
