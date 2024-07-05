import React, { useState } from 'react';
import './what.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark} from '@fortawesome/free-solid-svg-icons';
import { useCommunityContext } from '../../contexts/CommunityContext';
import { useTranslation } from 'react-i18next';
export const What = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('всички');
    const {searchCriteria } = useCommunityContext();
    const { t } = useTranslation();
  
    const handleSearch = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="what-modal-overlay">
            <div className="what-modal-content">
                <button className="what-close-button" onClick={onClose}><FontAwesomeIcon icon={faXmark} style={{color: "#000000",}} /></button>
                <h2>{t('community.what_search')}?</h2>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('community.enter_search')}
                    className="what-input"
                />
                <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="what-select">
                    <option value="всички">{t('community.all_menu')}</option>
                   {searchCriteria.searchCriteria?.map(criteria=>(
                    <option key={criteria.value} value={criteria.value}> {t(criteria.name)}</option>
                   ))}
                </select>
                <button onClick={handleSearch} className="what-search-button">{t('community.apply_btn')}</button>
            </div>
        </div>
    );
};
