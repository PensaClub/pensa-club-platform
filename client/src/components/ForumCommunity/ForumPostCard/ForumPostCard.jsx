import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { Eye, MessageSquare, Share2, Bookmark, BookmarkCheck, Pin, Lock, Clock } from 'lucide-react';
import ForumUserBadges from '../ForumUserBadges/ForumUserBadges';
import './forumPostCard.css';

const TYPE_ICONS = {
  discussion: '💬',
  article: '📝',
  poll: '📊',
  question: '❓',
};

const ForumPostCard = ({ post, onReaction, onBookmark, forumSettings }) => {
  const { t } = useTranslation('forum');
  const navigate = useLocalizedNavigate();

  const author = post.author;
  const authorName = author?.details
    ? `${author.details.firstName || ''} ${author.details.lastName || ''}`.trim()
    : 'Анонимен';
  const avatar = author?.details?.imageURL;

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'сега';
    if (mins < 60) return `${mins} мин`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ч`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} д`;
    return new Date(date).toLocaleDateString('bg-BG');
  };

  return (
    <article className="fpc-card" onClick={() => navigate(`/academy/community/post/${post.slug}`)}>
      {/* Header: author + meta */}
      <div className="fpc-header">
        <div className="fpc-avatar">
          {avatar
            ? <img src={avatar} alt={authorName} className="fpc-avatar-img" />
            : <span className="fpc-avatar-fallback">{authorName.charAt(0)}</span>
          }
        </div>
        <div className="fpc-author-info">
          <span className="fpc-author-name">{authorName}</span>
          <ForumUserBadges badges={post.author?.forumBadges} />
          <span className="fpc-meta">
            <Clock size={11} />
            {timeAgo(post.lastActivityAt || post.createdAt)}
            {post.space && (
              <>
                <span className="fpc-meta-dot">·</span>
                <span className="fpc-space-badge" style={{ color: post.space.color }}>
                  {post.space.icon} {post.space.name}
                </span>
              </>
            )}
          </span>
        </div>
        <span className="fpc-type-badge">{TYPE_ICONS[post.type] || '💬'}</span>
      </div>

      {/* Badges */}
      <div className="fpc-badges">
        {post.isPinned && (
          <span className="fpc-badge fpc-badge-pinned"><Pin size={11} /> {t('forumCommunity.post.pinned')}</span>
        )}
        {post.isLocked && (
          <span className="fpc-badge fpc-badge-locked"><Lock size={11} /> {t('forumCommunity.post.locked')}</span>
        )}
        {post.status === 'pending' && (
          <span className="fpc-badge fpc-badge-pending">{t('forumCommunity.feed.pending')}</span>
        )}
      </div>

      {/* Content */}
      <h3 className="fpc-title">{post.title}</h3>
      {post.excerpt && <p className="fpc-excerpt">{post.excerpt}</p>}

      {/* Cover image or first image */}
      {(post.coverImage || post.images?.filter(Boolean).length > 0) && (
        <div className="fpc-cover">
          <img
            src={post.coverImage || post.images.filter(Boolean)[0]}
            alt=""
            className="fpc-cover-img"
            loading="lazy"
          />
          {!post.coverImage && post.images?.filter(Boolean).length > 1 && (
            <span className="fpc-cover-count">+{post.images.filter(Boolean).length - 1}</span>
          )}
        </div>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="fpc-tags">
          {post.tags.map(tag => (
            <span key={tag.id} className="fpc-tag">#{tag.name}</span>
          ))}
        </div>
      )}

      {/* Footer: stats */}
      <div className="fpc-footer">
        <div className="fpc-stats">
          <span className="fpc-stat"><Eye size={14} /> {post.viewCount || 0}</span>
          <span className="fpc-stat"><MessageSquare size={14} /> {post.commentCount || 0}</span>
          <span className="fpc-stat"><Share2 size={14} /> {post.shareCount || 0}</span>
        </div>
        {forumSettings?.enableBookmarks !== false && (
          <button
            className={`fpc-bookmark ${post.isBookmarked ? 'fpc-bookmark-active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onBookmark?.(post.id); }}
            title={post.isBookmarked ? t('forumCommunity.post.bookmarked') : t('forumCommunity.post.bookmark')}
          >
            {post.isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        )}
      </div>

      {/* Reactions summary */}
      {forumSettings?.enableReactions !== false && post.reactionCount > 0 && (
        <div className="fpc-reactions-summary">
          {post.reactions?.slice(0, 5).map((r, i) => (
            <span key={i} className="fpc-reaction-emoji">{r.emoji}</span>
          ))}
          <span className="fpc-reaction-count">{post.reactionCount}</span>
        </div>
      )}
    </article>
  );
};

export default ForumPostCard;
