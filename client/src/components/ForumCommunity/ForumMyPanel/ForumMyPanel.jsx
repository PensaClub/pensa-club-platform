// src/components/ForumCommunity/ForumMyPanel/ForumMyPanel.jsx
// Prefix: fmp-

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { forumServiceFactory } from '../../Services/forumServiceFactory';
import ForumUserBadges from '../ForumUserBadges/ForumUserBadges';
import ScrollToTop from '../../ScrollToTop/ScrollToTop';
import {
  User, FileText, MessageSquare, Boxes, Award, Coins, Shield,
  Clock, Eye, ChevronRight, AlertTriangle, Star, Loader2,
} from 'lucide-react';
import './forumMyPanel.css';

const BADGE_META = {
  first_post: { emoji: '📝', key: 'first_post' },
  first_comment: { emoji: '💬', key: 'first_comment' },
  contributor_10: { emoji: '⭐', key: 'contributor_10' },
  helper_25: { emoji: '🤝', key: 'helper_25' },
  veteran_50: { emoji: '🏆', key: 'veteran_50' },
  popular_post: { emoji: '🔥', key: 'popular_post' },
  conversation_starter: { emoji: '💡', key: 'conversation_starter' },
  post_of_week: { emoji: '👑', key: 'post_of_week' },
  reactor_100: { emoji: '⚡', key: 'reactor_100' },
  bookmarked_10: { emoji: '📌', key: 'bookmarked_10' },
};

const TABS = ['overview', 'posts', 'comments', 'spaces'];

const ForumMyPanel = () => {
  const { t } = useTranslation('forum');
  const navigate = useLocalizedNavigate();
  const { profileData, isAdmin, isModerator, isMentor } = useAuthContext();
  const forumService = forumServiceFactory();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [badges, setBadges] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [credits, setCredits] = useState({ totalForumCredits: 0, history: [] });
  const [postsPage, setPostsPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const [postsPagination, setPostsPagination] = useState({});
  const [commentsPagination, setCommentsPagination] = useState({});

  const isPrivileged = isAdmin || isModerator || isMentor;

  const userName = profileData?.details?.firstName && profileData?.details?.lastName
    ? `${profileData.details.firstName} ${profileData.details.lastName}`
    : profileData?.details?.username || profileData?.email?.split('@')[0] || '';
  const avatar = profileData?.details?.imageURL;

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const [statusRes, spacesRes] = await Promise.all([
        forumService.getMyStatus(),
        forumService.getMySpaces(),
      ]);
      setStatus(statusRes.status);
      setBadges(statusRes.badges || []);
      setSpaces(spacesRes.spaces || []);

      if (!isPrivileged) {
        const creditsRes = await forumService.getMyCredits();
        setCredits(creditsRes);
      }
    } catch (e) {
      console.error('Error fetching overview:', e);
    } finally {
      setLoading(false);
    }
  }, [isPrivileged]);

  const fetchPosts = useCallback(async (page = 1) => {
    try {
      const res = await forumService.getMyPosts({ page, limit: 10 });
      setPosts(res.posts || []);
      setPostsPagination(res.pagination || {});
    } catch (e) { setPosts([]); }
  }, []);

  const fetchComments = useCallback(async (page = 1) => {
    try {
      const res = await forumService.getMyComments({ page, limit: 10 });
      setComments(res.comments || []);
      setCommentsPagination(res.pagination || {});
    } catch (e) { setComments([]); }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    if (activeTab === 'posts') fetchPosts(postsPage);
  }, [activeTab, postsPage, fetchPosts]);

  useEffect(() => {
    if (activeTab === 'comments') fetchComments(commentsPage);
  }, [activeTab, commentsPage, fetchComments]);

  const timeAgo = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const statusLabel = () => {
    if (status?.isBanned) return { text: 'Забранен', color: '#dc3545' };
    if (status?.role === 'vip') return { text: 'VIP', color: '#d4a853' };
    return { text: 'Активен', color: '#22c55e' };
  };

  if (loading) {
    return (
      <div className="fmc-wrapper fmp-container">
        <div className="fmp-loading"><Loader2 size={28} className="fmp-spinner" /></div>
      </div>
    );
  }

  return (
    <div className="fmc-wrapper fmp-container">
      <ScrollToTop />

      {/* Header card */}
      <div className="fmp-header-card">
        <div className="fmp-avatar-wrap">
          {avatar
            ? <img src={avatar} alt="" className="fmp-avatar" />
            : <div className="fmp-avatar-fallback">{userName.charAt(0)}</div>}
          <span className="fmp-status-dot" style={{ background: statusLabel().color }} />
        </div>
        <div className="fmp-user-info">
          <h1 className="fmp-user-name">
            {userName}
            <ForumUserBadges badges={badges} />
          </h1>
          <div className="fmp-user-meta">
            <span className="fmp-role-badge" style={{ background: statusLabel().color }}>
              {statusLabel().text}
            </span>
            {status?.reputationScore > 0 && (
              <span className="fmp-reputation">
                <Star size={12} /> {status.reputationScore} точки
              </span>
            )}
            {status?.createdAt && (
              <span className="fmp-joined">
                <Clock size={12} /> Член от {timeAgo(status.createdAt)}
              </span>
            )}
          </div>
          {status?.isBanned && status?.banReason && (
            <div className="fmp-ban-notice">
              <AlertTriangle size={14} /> {status.banReason}
            </div>
          )}
        </div>
        <div className="fmp-stats-mini">
          <div className="fmp-stat-mini">
            <span className="fmp-stat-num">{postsPagination.total || posts.length || 0}</span>
            <span className="fmp-stat-label">Публикации</span>
          </div>
          <div className="fmp-stat-mini">
            <span className="fmp-stat-num">{commentsPagination.total || comments.length || 0}</span>
            <span className="fmp-stat-label">Коментари</span>
          </div>
          <div className="fmp-stat-mini">
            <span className="fmp-stat-num">{spaces.length}</span>
            <span className="fmp-stat-label">Пространства</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="fmp-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`fmp-tab ${activeTab === tab ? 'fmp-tab-active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && <><User size={14} /> Преглед</>}
            {tab === 'posts' && <><FileText size={14} /> Публикации</>}
            {tab === 'comments' && <><MessageSquare size={14} /> Коментари</>}
            {tab === 'spaces' && <><Boxes size={14} /> Пространства</>}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="fmp-content">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="fmp-overview">
            {/* Badges */}
            <div className="fmp-section">
              <h3 className="fmp-section-title"><Award size={16} /> Бъджове</h3>
              <div className="fmp-badges-grid">
                {Object.entries(BADGE_META).map(([key, meta]) => {
                  const earned = badges.find(b => b.badge === key);
                  return (
                    <div key={key} className={`fmp-badge-card ${earned ? 'fmp-badge-earned' : 'fmp-badge-locked'}`}>
                      <span className="fmp-badge-emoji">{meta.emoji}</span>
                      <span className="fmp-badge-name">{t(`gamification.badges.${key}`, key)}</span>
                      {earned && <span className="fmp-badge-date">{timeAgo(earned.awardedAt)}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Credits (only for non-privileged) */}
            {!isPrivileged && (
              <div className="fmp-section">
                <h3 className="fmp-section-title"><Coins size={16} /> Кредити от форума</h3>
                <div className="fmp-credits-card">
                  <div className="fmp-credits-total">{credits.totalForumCredits}</div>
                  <div className="fmp-credits-label">общо кредити</div>
                </div>
                {credits.history?.length > 0 && (
                  <div className="fmp-credits-history">
                    {credits.history.map((h, i) => (
                      <div key={i} className="fmp-credit-row">
                        <span className="fmp-credit-amount">+{h.creditsAmount}</span>
                        <span className="fmp-credit-desc">{h.sourceTitle || h.description}</span>
                        <span className="fmp-credit-date">{timeAgo(h.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* POSTS */}
        {activeTab === 'posts' && (
          <div className="fmp-posts-list">
            {posts.length === 0 ? (
              <div className="fmp-empty">Нямате публикации все още</div>
            ) : (
              <>
                {posts.map(post => (
                  <div key={post.id} className="fmp-post-row" onClick={() => navigate(`/academy/community/post/${post.slug}`)}>
                    <div className="fmp-post-info">
                      <span className="fmp-post-title">{post.title}</span>
                      <span className="fmp-post-meta">
                        <Eye size={11} /> {post.viewCount || 0} · <MessageSquare size={11} /> {post.commentCount || 0} · {timeAgo(post.createdAt)}
                      </span>
                    </div>
                    <span className={`fmp-post-status fmp-status-${post.status}`}>{post.status}</span>
                    <ChevronRight size={14} className="fmp-chevron" />
                  </div>
                ))}
                {postsPagination.total > 10 && (
                  <div className="fmp-pagination">
                    <button disabled={postsPage <= 1} onClick={() => setPostsPage(p => p - 1)}>Предишна</button>
                    <span>Страница {postsPage}</span>
                    <button disabled={postsPage >= Math.ceil(postsPagination.total / 10)} onClick={() => setPostsPage(p => p + 1)}>Следваща</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* COMMENTS */}
        {activeTab === 'comments' && (
          <div className="fmp-comments-list">
            {comments.length === 0 ? (
              <div className="fmp-empty">Нямате коментари все още</div>
            ) : (
              <>
                {comments.map(c => (
                  <div key={c.id} className="fmp-comment-row" onClick={() => navigate(`/academy/community/post/${c.post?.slug}`)}>
                    <div className="fmp-comment-info">
                      <span className="fmp-comment-text">{(c.content || '').replace(/<[^>]+>/g, '').substring(0, 100)}</span>
                      <span className="fmp-comment-post">в „{c.post?.title || '—'}"</span>
                      <span className="fmp-comment-date">{timeAgo(c.createdAt)}</span>
                    </div>
                    <ChevronRight size={14} className="fmp-chevron" />
                  </div>
                ))}
                {commentsPagination.total > 10 && (
                  <div className="fmp-pagination">
                    <button disabled={commentsPage <= 1} onClick={() => setCommentsPage(p => p - 1)}>Предишна</button>
                    <span>Страница {commentsPage}</span>
                    <button disabled={commentsPage >= Math.ceil(commentsPagination.total / 10)} onClick={() => setCommentsPage(p => p + 1)}>Следваща</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* SPACES */}
        {activeTab === 'spaces' && (
          <div className="fmp-spaces-list">
            {spaces.length === 0 ? (
              <div className="fmp-empty">Не сте се присъединили към пространства</div>
            ) : (
              spaces.map(s => (
                <div key={s.id} className="fmp-space-row">
                  <span className="fmp-space-icon">{s.icon || '📁'}</span>
                  <div className="fmp-space-info">
                    <span className="fmp-space-name">{s.name}</span>
                    <span className="fmp-space-meta">{s.postCount || 0} публикации · {s.memberCount || 0} членове</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumMyPanel;
