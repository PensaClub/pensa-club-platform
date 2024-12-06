import React, { useState, useEffect } from 'react';
import { useCommunityContext } from '../../contexts/CommunityContext';
import { useTranslation } from 'react-i18next';

export const SearchCategory = ({setFilters, filters, handleSearch}) => {
    const [searchQuery, setSearchQuery] = useState(filters.tags);
    const { searchCriteria } = useCommunityContext();
    const { t } = useTranslation();
  
    const handleCategory = (category) => {
        setFilters(prev => ({ ...prev, tags: searchQuery, category: category }));
        
    };

    const handleSubmit = () => {
        handleSearch();
    }

    return (
        <div className="search-category-container">
            <div className="search-category-content">
                <h2>{t('community.category-search')}</h2>
                <div className="category-select">
                    {searchCriteria?.searchCriteria?.map(criteria => (
                        <label htmlFor={criteria.value} key={criteria.value}>
                            {t(criteria.name)}
                        <input type='radio' id={criteria.value} name={t('community.what_search')} onChange={(e) => handleCategory(e.target.id)}/>
                        </label>
                    ))}
                </div>
                <button onClick={handleSubmit} className="btn-general btn-orange">{t('community.apply_btn')}</button>
            </div>
        </div>
    );
};

