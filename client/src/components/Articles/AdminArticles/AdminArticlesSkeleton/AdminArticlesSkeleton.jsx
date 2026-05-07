import './adminArticlesSkeleton.css';

/**
 * Shimmer placeholder grid/list. Shape mirrors AdminArticleCard /
 * AdminArticleListRow so the page doesn't visually jump after fetch.
 */
const AdminArticlesSkeleton = ({ count = 6, viewMode = 'grid' }) => {
  const items = Array.from({ length: count });

  if (viewMode === 'list') {
    return (
      <div className="aas-list">
        {items.map((_, i) => (
          <div key={i} className="aas-row">
            <div className="aas-thumb aas-thumb-sm aas-shimmer" />
            <div className="aas-row-body">
              <div className="aas-line aas-line-title aas-shimmer" />
              <div className="aas-line aas-line-meta aas-shimmer" />
            </div>
            <div className="aas-row-actions">
              <div className="aas-pill aas-shimmer" />
              <div className="aas-pill aas-shimmer" />
              <div className="aas-pill aas-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="aas-grid">
      {items.map((_, i) => (
        <div key={i} className="aas-card">
          <div className="aas-thumb aas-shimmer" />
          <div className="aas-card-body">
            <div className="aas-line aas-line-title aas-shimmer" />
            <div className="aas-line aas-line-meta aas-shimmer" />
            <div className="aas-line aas-line-summary aas-shimmer" />
            <div className="aas-line aas-line-summary-short aas-shimmer" />
            <div className="aas-tags-row">
              <div className="aas-tag aas-shimmer" />
              <div className="aas-tag aas-shimmer" />
              <div className="aas-tag aas-shimmer" />
            </div>
            <div className="aas-actions">
              <div className="aas-action aas-shimmer" />
              <div className="aas-action aas-shimmer" />
              <div className="aas-action aas-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminArticlesSkeleton;
