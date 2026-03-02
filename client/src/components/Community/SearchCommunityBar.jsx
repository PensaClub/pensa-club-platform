import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faLocationDot, faCalendar, faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './communityPage.css'
export const SearchCommunityBar = ({
    filters,
    setFilters,
    setIsSearchWhatOpen,
    setIsSearchWhereOpen,
    setIsSearchWhenOpen,
    handleSearch,
    resetFilters,
    getWhereLabel,
    creationDateLabel,
    showResetIcon
}) => {
    const { t, i18n } = useTranslation(['auth', 'community']);
    const currentLanguage = i18n.language;
    return (
        <div className="search-bar-commun-s">
            <div className="icons-com" onClick={() => setIsSearchWhatOpen(true)}>
                <FontAwesomeIcon icon={faMagnifyingGlass} className="commun-icon" />
                <p>
                    {/* {(filters?.tags || filters?.category !== '') ? (
                        `${filters?.tags} ${filters?.category !== 'all' ? (t(`search-criteria.${filters?.category}`, { fallbackLng: currentLanguage }) !== `search-criteria.${filters?.category}` ? t(`search-criteria.${filters?.category}`) : filters?.category) : t('search-criteria.all_menu')}`
                    ) : ( */}
                        {t('community.what_search') + '?'}
                    {/* )} */}
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
            <button className="btn-general btn-orange" onClick={() => handleSearch()}>{t('community.search_btn')}</button>
            {showResetIcon && (
                <FontAwesomeIcon
                    icon={faArrowRotateLeft}
                    className="reset-icon"
                    onClick={resetFilters}
                />
            )}
        </div>
    );
};
