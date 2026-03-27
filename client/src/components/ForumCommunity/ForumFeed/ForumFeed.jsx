import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForum } from '../../contexts/ForumProvider';
import ForumPostCard from '../ForumPostCard/ForumPostCard';
import { TrendingUp, Clock, Sparkles, Loader2 } from 'lucide-react';
import './forumFeed.css';

const SORT_OPTIONS = [
  { key: 'recent', icon: Clock, label: 'sortRecent' },
  { key: 'popular', icon: TrendingUp, label: 'sortPopular' },
  { key: 'newest', icon: Sparkles, label: 'sortNewest' },
];

const ForumFeed = ({ spaceId }) => {
  const { t } = useTranslation('forum');
  const { getFeed, posts, pagination, isLoading, toggleBookmark } = useForum();
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);

  const loadFeed = useCallback(() => {
    const params = { page, limit: 20, sort };
    if (spaceId) params.spaceId = spaceId;
    getFeed(params);
  }, [page, sort, spaceId, getFeed]);

  useEffect(() => {
    setPage(1);
  }, [sort, spaceId]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleBookmark = async (postId) => {
    await toggleBookmark(postId);
    loadFeed(); // refresh to update bookmark state
  };

  return (
    <div className="ff-container">
      {/* Sort tabs */}
      <div className="ff-sort-bar">
        {SORT_OPTIONS.map(opt => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.key}
              className={`ff-sort-btn ${sort === opt.key ? 'ff-sort-btn-active' : ''}`}
              onClick={() => setSort(opt.key)}
            >
              <Icon size={14} />
              {t(`forumCommunity.feed.${opt.label}`)}
            </button>
          );
        })}
      </div>

      {/* Posts */}
      {isLoading && posts.length === 0 ? (
        <div className="ff-loading">
          <Loader2 size={28} className="ff-spinner" />
        </div>
      ) : posts.length === 0 ? (
        <div className="ff-empty">
          <span className="ff-empty-icon">💬</span>
          <p>{t('forumCommunity.feed.empty', 'Няма публикации все още')}</p>
        </div>
      ) : (
        <>
          {posts.map(post => (
            <ForumPostCard
              key={post.id}
              post={post}
              onBookmark={handleBookmark}
            />
          ))}

          {/* Load more */}
          {pagination.page < pagination.pages && (
            <button
              className="ff-load-more"
              onClick={() => setPage(prev => prev + 1)}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 size={16} className="ff-spinner" /> : null}
              {t('forumCommunity.feed.loadMore', 'Зареди още')}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ForumFeed;
