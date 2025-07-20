import './skeletonCardInitiative.css';

export const SkeletonCardInitiative = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-image"></div>
      <div className="skeleton-card-content">
        <div className="skeleton-card-title"></div>
        <div className="skeleton-card-description">
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
        <div className="skeleton-card-footer">
          <div className="skeleton-card-category"></div>
          <div className="skeleton-card-bookmark"></div>
        </div>
      </div>
    </div>
  );
};