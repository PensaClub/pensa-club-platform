// src/components/AcademySeminars/SeminarsFilters/SeminarsFilters.jsx
// Prefix: asmfl-

import { useTranslation } from 'react-i18next';
import './seminarsFilters.css';

const SeminarsFilters = ({
    tabs, activeFilter, setActiveFilter,
    categories, selectedCategory, setSelectedCategory,
    searchQuery, setSearchQuery,
    sortBy, setSortBy,
    stats, hasActiveFilters, onClearFilters, getCategoryColor,
}) => {
    const { t } = useTranslation('academy');

    return (
        <div className="asmfl-wrapper">
            {/* Tabs + Search + Sort */}
            <div className="asmfl-bar">
                <div className="asmfl-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`asmfl-tab ${activeFilter === tab.id ? 'asmfl-tab-active' : ''}`}
                            onClick={() => setActiveFilter(tab.id)}
                        >
                            <span className="asmfl-tab-icon">{tab.icon}</span>
                            <span className="asmfl-tab-label">{t(`seminarsFilters.tabs.${tab.id}`, tab.id)}</span>
                            {tab.id === 'upcoming' && stats.upcoming > 0 && (
                                <span className="asmfl-tab-badge">{stats.upcoming}</span>
                            )}
                            {tab.id === 'completed' && stats.completed > 0 && (
                                <span className="asmfl-tab-badge asmfl-tab-badge-completed">{stats.completed}</span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="asmfl-search">
                    <svg className="asmfl-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        className="asmfl-search-input"
                        placeholder={t('seminarsFilters.searchPlaceholder', 'Търси семинар...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="asmfl-search-clear" onClick={() => setSearchQuery('')}>✕</button>
                    )}
                </div>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="asmfl-sort"
                >
                    <option value="date">{t('seminarsFilters.sort.date', 'По дата')}</option>
                    <option value="popular">{t('seminarsFilters.sort.popular', 'Популярни')}</option>
                    <option value="title">{t('seminarsFilters.sort.title', 'По заглавие')}</option>
                </select>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
                <div className="asmfl-categories">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            className={`asmfl-category ${selectedCategory === category.slug ? 'asmfl-category-active' : ''}`}
                            style={{ '--cat-color': category.primary }}
                            onClick={() => setSelectedCategory(prev => prev === category.slug ? null : category.slug)}
                        >
                            <span className="asmfl-category-icon">{category.icon}</span>
                            <span className="asmfl-category-name">{category.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Active filters indicator */}
            {hasActiveFilters && (
                <div className="asmfl-active">
                    <button className="asmfl-clear-btn" onClick={onClearFilters}>
                        {t('seminarsFilters.clearAll', 'Изчисти филтрите')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SeminarsFilters;