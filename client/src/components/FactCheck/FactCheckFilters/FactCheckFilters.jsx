import { useTranslation } from 'react-i18next';
import './factCheckFilters.css';

const FactCheckFilters = ({
  categories, selectedCategory, onCategoryChange,
  selectedVerdict, onVerdictChange,
  selectedType, onTypeChange,
  sort, onSortChange,
  search, onSearchChange,
  totalResults, onClearFilters,
}) => {
  const { t } = useTranslation('factcheck');

  const types = ['all', 'modules', 'signals'];
  const verdicts = ['true', 'false', 'misleading', 'partially_true', 'unconfirmed'];
  const hasActiveFilters = search || selectedCategory || selectedVerdict || (selectedType && selectedType !== 'all');

  return (
    <section className="fcf">
      <div className="fcf-container">
        {/* Type pills */}
        <div className="fcf-types">
          {types.map((type) => (
            <button
              key={type}
              className={`fcf-type ${(selectedType || 'all') === type ? 'fcf-type--active' : ''}`}
              onClick={() => onTypeChange(type === 'all' ? '' : type)}
            >
              {t(`filters.type_${type}`)}
            </button>
          ))}
        </div>

        {/* Category pills */}
        <div className="fcf-categories">
          <button
            className={`fcf-pill ${!selectedCategory ? 'fcf-pill--active' : ''}`}
            onClick={() => onCategoryChange('')}
          >
            {t('filters.allCategories')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`fcf-pill ${selectedCategory === cat ? 'fcf-pill--active' : ''}`}
              onClick={() => onCategoryChange(cat === selectedCategory ? '' : cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Controls row */}
        <div className="fcf-controls">
          {/* Verdict filter — hidden when viewing only signals */}
          {selectedType !== 'signals' && (
            <div className="fcf-verdict-group">
              {verdicts.map((v) => (
                <button
                  key={v}
                  className={`fcf-verdict fcf-verdict--${v} ${selectedVerdict === v ? 'fcf-verdict--selected' : ''}`}
                  onClick={() => onVerdictChange(v === selectedVerdict ? '' : v)}
                >
                  {t(`verdicts.${v}`)}
                </button>
              ))}
            </div>
          )}

          {/* Sort */}
          <select className="fcf-sort" value={sort} onChange={(e) => onSortChange(e.target.value)}>
            <option value="newest">{t('filters.sortNewest')}</option>
            <option value="views">{t('filters.sortViews')}</option>
          </select>
        </div>

        {/* Results count + clear */}
        <div className="fcf-results">
          <span className="fcf-results-count">
            {t('filters.resultsCount', { count: totalResults })}
          </span>
          {hasActiveFilters && (
            <button className="fcf-clear" onClick={onClearFilters}>
              {t('filters.clearFilters')}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default FactCheckFilters;
