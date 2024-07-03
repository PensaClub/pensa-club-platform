import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './searchWhen.css';

export const SearchWhen = ({ isOpen, onClose }) => {
    const [searchPeriod, setSearchPeriod] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

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
                <h2>Кога търсиш?</h2>
                <select
                    value={searchPeriod}
                    onChange={(e) => setSearchPeriod(e.target.value)}
                    className="when-select"
                >
                    <option value="">Избери всички</option>
                    <option value="anytime">Независимо кога</option>
                    <option value="today">Днес</option>
                    <option value="thisWeek">Тази седмица</option>
                    <option value="thisMonth">Този месец</option>
                    <option value="lastYear">Последната година</option>
                    <option value="custom">Определен период</option>
                </select>
                {searchPeriod === 'custom' && (
                    <div className="date-picker-container">
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            placeholderText="Начална дата"
                            className="when-date-picker"
                        />
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            placeholderText="Крайна дата"
                            className="when-date-picker"
                        />
                    </div>
                )}
                <button onClick={handleSearch} className="when-search-button">Приложи</button>
            </div>
        </div>
    );
};
