import './communityPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faLocationDot, faCalendar, faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FiltersCommunity } from "./FiltersCommunity/FiltersCommunity";
import { AdsCard } from "./AdsCard/AdsCard";
import { useEffect, useState } from "react";

import { What } from "./CommunityModals/What";
import { SearchWhere } from "./CommunityModals/SearchWhere";
import { SearchWhen } from "./CommunityModals/SearchWhen";
import { useCommunityContext } from "../contexts/CommunityContext";
import { useTranslation } from "react-i18next";

export const CommunityPage = () => {
    const { isLoading, searchAds, regions, subregions, fetchTowns } = useCommunityContext();
    const [isSearchWhatOpen, setIsSearchWhatOpen] = useState(false);
    const [isSearchWhereOpen, setIsSearchWhereOpen] = useState(false);
    const [isSearchWhenOpen, setIsSearchWhenOpen] = useState(false);
    const [creationDateLabel, setCreationDateLabel] = useState('');
    const [showResetIcon, setShowResetIcon] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;

    const [filters, setFilters] = useState({
        tags: '',
        category: '',
        where: '',
        creationDate: '',
        expirationDate: '',
        startDate: '',
        endDate: '',
        adRegion: '',
        adSubregion: '',
        adTown: '',
        adRegionName: '',
        adSubregionName: '',
        adTownName: ''
    });

    const [ads, setAds] = useState({ result: [] });

    const getAdTownValue = (language, town) => {
        return language === 'bg' ? town.bg : town.en;
    };

    const handleSearch = async (customFilters = null) => {
        const searchFilters = customFilters ? customFilters : filters;

        try {
            const queryFilters = Object.fromEntries(
                Object.entries(searchFilters).filter(([key, value]) => key !== 'adRegionName' && key !== 'adSubregionName' && key !== 'adTownName' && value && value !== 'all')
            );
            const result = await searchAds(queryFilters);

            if (result.result && result.result.length > 0) {
                const adsWithNames = await Promise.all(result.result.map(async (ad) => {
                    const townsData = await fetchTowns(Number(ad.adRegion), Number(ad.adSubregion));
                    const town = townsData.find(t => t.id === Number(ad.adTown));
                    return {
                        ...ad,
                        adRegion: regions.find(region => region.id === Number(ad.adRegion))?.[currentLanguage] || ad.adRegion,
                        adSubregion: subregions[Number(ad.adRegion)]?.find(subregion => subregion.id === Number(ad.adSubregion))?.[currentLanguage] || ad.adSubregion,
                        adTown: town ? getAdTownValue(currentLanguage, town) : ad.adTown
                    };
                }));
                setAds({ result: adsWithNames });
                setSearchPerformed(true);
            } else {
                setAds({ result: [] });
                setSearchPerformed(true);
            }
            setShowResetIcon(true);
        } finally {

        }
    };

    const resetFilters = () => {
        setFilters({
            tags: '',
            category: '',
            where: '',
            creationDate: '',
            expirationDate: '',
            startDate: '',
            endDate: '',
            adRegion: '',
            adSubregion: '',
            adTown: '',
            adRegionName: '',
            adSubregionName: '',
            adTownName: ''
        });
        setAds({ result: [] });
        setCreationDateLabel('');
        setShowResetIcon(false);
        setSearchPerformed(false);
    };

    const getWhereLabel = () => {
        if (filters.adTownName) {
            return filters.adTownName;
        }
        if (filters.adSubregionName) {
            return filters.adSubregionName;
        }
        if (filters.adRegionName) {
            return filters.adRegionName;
        }
        return t('community.where_search');
    };

    useEffect(() => {
        window.scrollTo({ top: 0 });
        if (searchPerformed) {
            handleSearch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLanguage]);

    return (
        <>
            <section className="background-community">
                <section className="community-page">

                    <section className="main-community">
                        <div className="hero-bg"></div>
                        <div className="hero-section-commun">
                            <h1>{t('community.community')}</h1>
                            <div className="search-bar-commun-s">
                                <div className="icons-com" onClick={() => setIsSearchWhatOpen(true)}>
                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="commun-icon" />
                                    <p>
                                        {(filters.tags || filters.category !== '') ? (
                                            `${filters.tags} ${filters.category !== 'all' ? (t(`search-criteria.${filters.category}`, { fallbackLng: currentLanguage }) !== `search-criteria.${filters.category}` ? t(`search-criteria.${filters.category}`) : filters.category) : t('search-criteria.all_menu')}`
                                        ) : (
                                            t('community.what_search') + '?'
                                        )}
                                    </p>

                                </div>
                                <div className="divider"></div>
                                <div className="icons-com" onClick={() => setIsSearchWhereOpen(true)}>
                                    <FontAwesomeIcon icon={faLocationDot} className="commun-icon" />
                                    <p>{getWhereLabel()}</p>
                                </div>
                                <div className="divider"></div>
                                <div className="icons-com" onClick={() => setIsSearchWhenOpen(true)}>
                                    <FontAwesomeIcon icon={faCalendar} className="commun-icon" />
                                    <p>
                                        {creationDateLabel ? (
                                            creationDateLabel === t('community.specific_period') && filters.startDate && filters.endDate ? (
                                                `от ${new Date(filters.startDate).toLocaleDateString('bg-BG')} до ${new Date(filters.endDate).toLocaleDateString('bg-BG')}`
                                            ) : (
                                                `${creationDateLabel}`
                                            )
                                        ) : (
                                            t('community.when_search') + '?'
                                        )}
                                    </p>
                                </div>
                                <button className="search-button" onClick={() => handleSearch()}>{t('community.search_btn')}</button>
                                {showResetIcon && (
                                    <FontAwesomeIcon
                                        icon={faArrowRotateLeft}
                                        className="reset-icon"
                                        onClick={resetFilters}
                                    />
                                )}
                            </div>
                        </div>

                        {ads.result.length > 0 ? (
                            <AdsCard ads={ads} isLoading={isLoading} />
                        ) : searchPerformed ? (
                            <div className="no-ads-container">
                                <h3>{t('community.no_ads_found')}</h3>
                                <div className="no-ads-message">
                                    <p>{t('community.no_ads_message')}</p>
                                    <button className="clear-filters-button" onClick={resetFilters}>{t('community.clear_filters')}</button>
                                </div>
                            </div>
                        ) : (
                            <FiltersCommunity handleSearch={handleSearch} />
                        )}

                    </section>
                </section>
            </section>
            <What
                isOpen={isSearchWhatOpen}
                onClose={() => setIsSearchWhatOpen(false)}
                setFilters={setFilters}
                filters={filters}
            />
            <SearchWhere
                isOpen={isSearchWhereOpen}
                onClose={() => setIsSearchWhereOpen(false)}
                setFilters={setFilters}
                filters={filters}
            />
            <SearchWhen
                isOpen={isSearchWhenOpen}
                onClose={() => setIsSearchWhenOpen(false)}
                setFilters={setFilters}
                filters={filters}
                setCreationDateLabel={setCreationDateLabel}
            />
        </>
    );
}
