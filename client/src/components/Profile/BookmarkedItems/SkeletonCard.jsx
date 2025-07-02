 // Skeleton loader component
import './bookmarkedItems.css';

   export const SkeletonCard = () => (
        <div className="bookmarked-card skeleton">
            <div className="bookmarked-card-header">
                <div className="skeleton-badge"></div>
            </div>
            <div className="bookmarked-card-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-description"></div>
                <div className="skeleton-meta"></div>
            </div>
        </div>
    );