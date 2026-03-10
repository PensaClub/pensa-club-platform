import { useTranslation } from 'react-i18next';
import FactCheckCard from '../FactCheckCard/FactCheckCard';
import FactCheckSignalCard from '../FactCheckSignalCard/FactCheckSignalCard';
import './factCheckList.css';

const FactCheckList = ({ items, loading, pagination, onPageChange }) => {
  const { t } = useTranslation('factcheck');

  if (loading) {
    return (
      <section className="fcl">
        <div className="fcl-container">
          <div className="fcl-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="fcl-skeleton">
                <div className="fcl-skeleton-top"></div>
                <div className="fcl-skeleton-text"></div>
                <div className="fcl-skeleton-text fcl-skeleton-text--short"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!items || items.length === 0) {
    return (
      <section className="fcl">
        <div className="fcl-container">
          <div className="fcl-empty">
            <div className="fcl-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <h3>{t('filters.noResults')}</h3>
            <p>{t('filters.noResultsDesc')}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="fcl">
      <div className="fcl-container">
        <div className="fcl-grid">
          {items.map((item) =>
            item._itemType === 'signal'
              ? <FactCheckSignalCard key={`signal-${item.id}`} signal={item} />
              : <FactCheckCard key={`module-${item.id}`} module={item} />
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="fcl-pagination">
            <button
              className="fcl-page-btn"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              &larr;
            </button>
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`fcl-page-btn ${pagination.page === i + 1 ? 'fcl-page-btn--active' : ''}`}
                onClick={() => onPageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="fcl-page-btn"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              &rarr;
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FactCheckList;
