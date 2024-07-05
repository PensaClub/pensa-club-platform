import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './searchWhen.css';
import { useTranslation } from 'react-i18next';

export const SearchWhen = ({ isOpen, onClose }) => {
    const [searchPeriod, setSearchPeriod] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const { t } = useTranslation();

    const handleSearch = () => {
        if (searchPeriod === 'custom' && (!startDate || !endDate)) {
            alert('Моля, изберете начален и краен период.');
            return;
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="when-modal-overlay">
            <div className="when-modal-content">
                <button className="when-close-button" onClick={onClose}>
                    <FontAwesomeIcon icon={faXmark} style={{ color: "#000000" }} />
                </button>
                <h2>{t('community.when_search_menu')} ?</h2>
                <select
                    value={searchPeriod}
                    onChange={(e) => setSearchPeriod(e.target.value)}
                    className="when-select"
                >
                    <option value="">{t('community.all_menu')}</option>
                    <option value="anytime">{t('community.anytime')}</option>
                    <option value="today">{t('community.today')}</option>
                    <option value="thisWeek">{t('community.this_week')}</option>
                    <option value="thisMonth">{t('community.this_month')}</option>
                    <option value="lastYear">{t('community.last_year')}</option>
                    <option value="custom">{t('community.specific_period')}</option>
                </select>
                {searchPeriod === 'custom' && (
                    <div className="date-picker-container">
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            placeholderText={t('community.start_date')}
                            className="when-date-picker"
                        />
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            placeholderText={t('community.end_date')}
                            className="when-date-picker"
                        />
                    </div>
                )}
                <button onClick={handleSearch} className="when-search-button">{t('community.apply_btn')}</button>
            </div>
        </div>
    );
};
