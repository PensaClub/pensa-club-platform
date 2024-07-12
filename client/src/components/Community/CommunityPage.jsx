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
    const { t } = useTranslation();

    const [filters, setFilters] = useState({
        what: '',
        category: '',
        where: '',
        creationDate: '',
        expirationDate: ''
    });

    const [ads, setAds] = useState([
        {
            "id": 1,
            "created_date": "2024-06-26",
            "expiry_date": "2024-07-26",
            "title": "Продавам велосипед",
            "type": "продавам",
            "image": "/community/ads.jpg",
            "user_name": "Иван Иванов",
            "city": "София",
            "item": "Велосипед"
        },
        {
            "id": 2,
            "created_date": "2024-06-20",
            "expiry_date": "2024-07-20",
            "title": "Купувам лаптоп",
            "type": "купувам",
            "image": "/community/ads.jpg",
            "user_name": "Мария Петрова",
            "city": "Пловдив",
            "item": "Лаптоп"
        },
        {
            "id": 3,
            "created_date": "2024-06-15",
            "expiry_date": "2024-07-15",
            "title": "Подарявам диван",
            "type": "Дарявам",
            "image": "/community/ads.jpg",
            "user_name": "Георги Георгиев",
            "city": "Варна",
            "item": "Диван"
        }
    ]);

    const handleSearch = () => {
        const queryFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value));
        searchAds(queryFilters);
     
        setFilters({
            what: '',
            category: '',
            where: '',
            creationDate: '',
            expirationDate: ''
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
                            {/* <img src="/community/community-bg.jpg" alt="" /> */}
                        </div>
                        <div className="hero-section-commun">
                            <h1>{t('community.community')}</h1>
                            <div className="search-bar-commun">
                                <div className="icons-com" onClick={() => setIsSearchWhatOpen(true)}>
                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="commun-icon" />
                                    <p>{t('community.what_search')} ? {(filters.what || filters.category !== '') && `: ${filters.what} ${filters.category !== '' ? `${filters.category}` : ''}`}</p>

                                </div>
                                <div className="divider"></div>
                                <div className="icons-com" onClick={() => setIsSearchWhereOpen(true)}>
                                    <FontAwesomeIcon icon={faLocationDot} className="commun-icon" />
                                    <p>{t('community.where_search')} ? {filters.where && `: ${filters.where}`}</p>
                                </div>
                                <div className="divider"></div>
                                <div className="icons-com" onClick={() => setIsSearchWhenOpen(true)}>
                                    <FontAwesomeIcon icon={faCalendar} className="commun-icon" />
                                    <p>{t('community.when_search')} ? {filters.creationDate && `: ${filters.creationDate}`}</p>
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
            />
        </>
    );
}
