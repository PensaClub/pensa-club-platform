import React, { useState, useEffect } from 'react';
import { useCommunityContext } from "../../contexts/CommunityContext";
import Masonry from 'react-masonry-css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './filtersCommunity.css';

export const FiltersCommunity = () => {
    const { fetchSubregions, regions, subregions, isLoading } = useCommunityContext();
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

    const breakpointColumnsObj = {
        default: 2, //когато ширината на екрана е 768 пиксела или по-голяма , ще се използва 2 колони.
        768: 1 // когато ширината на екрана е 768 пиксела или по-малка, ще се използва 1 колона.
    };

    return (
        <>
            <section className="unique-main-filters">
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column">
                    {isLoading ? (
                        Array(5).fill().map((_, index) => (
                            <Skeleton key={index} height={60} className="unique-skeleton" />
                        ))
                    ) : (
                        regions.map(region => (
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
                                        {subregions[region.id] ? (
                                            subregions[region.id].map(subregion => (
                                                <div
                                                    key={subregion.id}
                                                    className={`unique-option ${selectedSubregions[region.id] === subregion.id ? 'selected' : ''}`}
                                                    onClick={() => handleOptionClick(region.id, subregion.id)}
                                                >
                                                    {subregion.bg}
                                                </div>
                                            ))
                                        ) : (
                                            <Skeleton count={5} height={40} className="unique-skeleton-option" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </Masonry>
            </section>
        </>
    );
}
