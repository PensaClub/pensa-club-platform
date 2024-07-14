import { HeaderCommunity } from "./HeaderCommunity/HeaderCommunity";
import './communityPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faLocationDot, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FiltersCommunity } from "./FiltersCommunity/FiltersCommunity";
import { CommunityFooter } from "./CommunityFooter/CommunityFooter";
import { AdsCard } from "./AdsCard/AdsCard";
import { useEffect, useState } from "react";

import { What } from "./CommunityModals/What";
import { SearchWhere } from "./CommunityModals/SearchWhere";
import { SearchWhen } from "./CommunityModals/SearchWhen";
import { useCommunityContext } from "../contexts/CommunityContext";
import { useTranslation } from "react-i18next";

export const CommunityPage = () => {
    const { isLoading, searchAds, regions, subregions } = useCommunityContext();
    const [isSearchWhatOpen, setIsSearchWhatOpen] = useState(false);
    const [isSearchWhereOpen, setIsSearchWhereOpen] = useState(false);
    const [isSearchWhenOpen, setIsSearchWhenOpen] = useState(false);
    const [creationDateLabel, setCreationDateLabel] = useState('');

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
        adTown: ''
    });

    const [ads, setAds] = useState({ result: [] });

    const handleSearch = async (customFilters = null) => {
        const searchFilters = customFilters ? customFilters : filters; // Useе customFilters if provide, otherwise use the current filters from the stateе
        try {
            const queryFilters = Object.fromEntries(
                Object.entries(searchFilters).filter(([key, value]) => value && value !== 'all')
            );
            const result = await searchAds(queryFilters);

            if (result.result && result.result.length > 0) {
                // Parse id to name
                const adsWithNames = result.result.map(ad => ({
                    ...ad,
                    adRegion: regions.find(region => region.id === Number(ad.adRegion))?.[currentLanguage] || ad.adRegion,
                    adSubregion: subregions[Number(ad.adRegion)]?.find(subregion => subregion.id === Number(ad.adSubregion))?.[currentLanguage] || ad.adSubregion,
                }));
                setAds({ result: adsWithNames });
            } else {
                setAds({ result: [] });
            }
        } finally {
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
                adTown: ''
            });
            setCreationDateLabel('');
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    return (
        <>
            <section className="background-community">
                <section className="community-page">
                    <HeaderCommunity />
                    <section className="main-community">
                        <div className="hero-bg">
                            {/* <img src="/community/community-bg.jpg" alt="" /> */}
                        </div>
                        <div className="hero-section-commun">
                            <h1>{t('community.community')}</h1>
                            <div className="search-bar-commun">
                                <div className="icons-com" onClick={() => setIsSearchWhatOpen(true)}>
                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="commun-icon" />
                                    <p>
                                        {(filters.tags || filters.category !== '') ? (
                                            `${filters.tags} ${filters.category !== 'all' ? `${t(`search-criteria.${filters.category}`)}` : `${t('search-criteria.all_menu')}`}`
                                        ) : (
                                            t('community.what_search') + '?'
                                        )}
                                    </p>
                                </div>
                                <div className="divider"></div>
                                <div className="icons-com" onClick={() => setIsSearchWhereOpen(true)}>
                                    <FontAwesomeIcon icon={faLocationDot} className="commun-icon" />
                                    <p>{t('community.where_search')} ? {filters.where && `: ${filters.where}`}</p>
                                </div>
                                <div className="divider"></div>
                                <div className="icons-com" onClick={() => setIsSearchWhenOpen(true)}>
                                    <FontAwesomeIcon icon={faCalendar} className="commun-icon" />
                                    <p>
                                        {creationDateLabel ? (
                                            creationDateLabel === t('community.specific_period') && filters.creationDate && filters.expirationDate ? (
                                                `от ${new Date(filters.creationDate).toLocaleDateString('bg-BG')} до ${new Date(filters.expirationDate).toLocaleDateString('bg-BG')}`
                                            ) : (
                                                `${creationDateLabel}`
                                            )
                                        ) : (
                                            t('community.when_search') + '?'
                                        )}
                                    </p>

                                </div>
                                <button className="search-button" onClick={() => handleSearch()}>{t('community.search_btn')}</button>
                            </div>
                        </div>
                        {ads.result.length > 0 ? <AdsCard ads={ads} isLoading={isLoading} /> : <FiltersCommunity handleSearch={handleSearch} />}
                    </section>
                    {/* <CommunityFooter /> */}
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
