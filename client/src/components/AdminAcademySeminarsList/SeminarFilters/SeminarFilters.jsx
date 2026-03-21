// src/components/AdminAcademySeminarsList/SeminarFilters/SeminarFilters.jsx
// Prefix: asmf-

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter } from 'lucide-react';
import './seminarFilters.css';

const STATUS_OPTIONS = ['all', 'draft', 'published', 'scheduled', 'live', 'completed', 'cancelled'];
const TYPE_OPTIONS = ['all', 'workshop', 'discussion', 'hands_on', 'q_and_a'];
const SORT_OPTIONS = ['newest', 'oldest', 'title', 'upcoming', 'popular'];

const SeminarFilters = ({ search, setSearch, status, setStatus, type, setType, sortBy, setSortBy }) => {
    const { t } = useTranslation('academy-admin');
    const [showFilters, setShowFilters] = useState(false);

    return (
        <div className="asmf-wrapper">
            {/* Toolbar */}
            <div className="asmf-toolbar">
                <div className="asmf-search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('seminarFilters.searchPlaceholder', 'Търси по заглавие...')}
                        className="asmf-search-input"
                    />
                </div>
                <button className="asmf-btn-filter" onClick={() => setShowFilters(!showFilters)}>
                    <Filter size={16} />
                    {t('seminarFilters.filters', 'Филтри')}
                    {(status !== 'all' || type !== 'all' || sortBy !== 'newest') && (
                        <span className="asmf-filter-dot" />
                    )}
                </button>
            </div>

            {/* Filters panel */}
            {showFilters && (
                <div className="asmf-panel">
                    <div className="asmf-group">
                        <label className="asmf-group-label">{t('seminarFilters.status', 'Статус')}</label>
                        <div className="asmf-chips">
                            {STATUS_OPTIONS.map((opt) => (
                                <button
                                    key={opt}
                                    className={`asmf-chip ${status === opt ? 'asmf-chip-active' : ''}`}
                                    onClick={() => setStatus(opt)}
                                >
                                    {t(`seminarFilters.statusOptions.${opt}`, opt)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="asmf-group">
                        <label className="asmf-group-label">{t('seminarFilters.type', 'Тип')}</label>
                        <div className="asmf-chips">
                            {TYPE_OPTIONS.map((opt) => (
                                <button
                                    key={opt}
                                    className={`asmf-chip ${type === opt ? 'asmf-chip-active' : ''}`}
                                    onClick={() => setType(opt)}
                                >
                                    {t(`seminarFilters.typeOptions.${opt}`, opt)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="asmf-group">
                        <label className="asmf-group-label">{t('seminarFilters.sortBy', 'Подреди по')}</label>
                        <div className="asmf-chips">
                            {SORT_OPTIONS.map((opt) => (
                                <button
                                    key={opt}
                                    className={`asmf-chip ${sortBy === opt ? 'asmf-chip-active' : ''}`}
                                    onClick={() => setSortBy(opt)}
                                >
                                    {t(`seminarFilters.sortOptions.${opt}`, opt)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeminarFilters;