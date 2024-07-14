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
    const { isLoading, searchAds } = useCommunityContext();
    const [isSearchWhatOpen, setIsSearchWhatOpen] = useState(false);
    const [isSearchWhereOpen, setIsSearchWhereOpen] = useState(false);
    const [isSearchWhenOpen, setIsSearchWhenOpen] = useState(false);
    const [creationDateLabel, setCreationDateLabel] = useState('');

    const { t } = useTranslation();

    const [filters, setFilters] = useState({
        what: '',
        category: '',
        where: '',
        creationDate: '',
        expirationDate: '',
        startDate: '',
        endDate: ''
    });

    const [ads, setAds] = useState([

    ]);

    const handleSearch = async () => {
        const queryFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value));
        const result = await searchAds(queryFilters);
        setAds(result);

        setFilters({
            what: '',
            category: '',
            where: '',
            creationDate: '',
            expirationDate: '',
            startDate: '',
            endDate: ''
        });
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
                        </div>
                        <div className="hero-section-commun">
                            <h1>{t('community.community')}</h1>
                            <div className="search-bar-commun">
                                <div className="icons-com" onClick={() => setIsSearchWhatOpen(true)}>
                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="commun-icon" />
                                    <p>
                                        {(filters.what || filters.category !== '') ? (
                                            `${filters.what} ${filters.category !== '' ? `${t(`search-criteria.${filters.category}`)}` : ''}`
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
                                <button className="search-button" onClick={handleSearch}>{t('community.search_btn')}</button>
                            </div>
                        </div>
                        {ads.length > 0 ? <AdsCard ads={ads} isLoading={isLoading} /> : <FiltersCommunity />}
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
