import './bookmarkedItems.css';

export const SkeletonCard = ({ viewMode = 'grid' }) => (
    <div className={`bki-card bki-skeleton bki-card-${viewMode}`}>
        {viewMode === 'list' && <div className="bki-skel-image" />}
        <div className="bki-card-body">
            <div className="bki-card-top">
                <div className="bki-skel-badge" />
            </div>
            <div className="bki-card-info">
                <div className="bki-skel-title" />
                <div className="bki-skel-desc" />
                <div className="bki-skel-meta" />
            </div>
        </div>
    </div>
);
