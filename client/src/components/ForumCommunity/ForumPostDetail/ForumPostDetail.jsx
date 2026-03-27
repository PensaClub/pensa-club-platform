import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForum } from '../../contexts/ForumProvider';
import { useAuthContext } from '../../contexts/UserContext';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import ScrollToTop from '../../ScrollToTop/ScrollToTop';
import { TextZoom } from '../../TextZoom/TextZoom';
import SEOHead from '../../SEO/SEOHead';
import ForumComments from '../ForumComments/ForumComments';
import ForumReactions from '../ForumReactions/ForumReactions';
import ForumImageLightbox from '../ForumImageLightbox/ForumImageLightbox';
import ForumTrendingTags from '../ForumTrendingTags/ForumTrendingTags';
import ForumArticlesCarousel from '../ForumArticlesCarousel/ForumArticlesCarousel';
import ForumUpcomingSeminars from '../ForumUpcomingSeminars/ForumUpcomingSeminars';
import ForumCoursesPromo from '../ForumCoursesPromo/ForumCoursesPromo';
import { ArrowLeft, Eye, MessageSquare, Share2, Bookmark, BookmarkCheck, Pin, Lock, Clock, Loader2, ChevronRight, MessagesSquare } from 'lucide-react';
import './forumPostDetail.css';

const ForumPostDetail = () => {
  const { slug } = useParams();
  const { t } = useTranslation('forum');
  const navigate = useLocalizedNavigate();
  const { isAuthentication } = useAuthContext();
  const { getPost, currentPost, currentComments, isLoading, toggleBookmark } = useForum();
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    if (slug) getPost(slug);
  }, [slug, getPost]);

  const post = currentPost;

  const timeAgo = (date) => {
    if (!date) return '';
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

  const TYPE_LABELS = {
    discussion: 'Дискусия',
    article: 'Статия',
    poll: 'Анкета',
    question: 'Въпрос',
  };

  if (isLoading && !post) {
    return (
      <div className="fpd-wrapper">
        <div className="fpd-inner">
          <div className="fpd-loading"><Loader2 size={28} className="fpd-spinner" /></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="fpd-wrapper">
        <div className="fpd-inner">
          <div className="fpd-not-found">
            <p>{t('forumCommunity.post.notFound', 'Публикацията не е намерена')}</p>
            <button className="fpd-back-btn" onClick={() => navigate('/academy/community')}>
              <ArrowLeft size={14} /> {t('forumCommunity.post.backToForum', 'Назад към форума')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const author = post.author;
  const authorName = author?.details
    ? `${author.details.firstName || ''} ${author.details.lastName || ''}`.trim()
    : 'Анонимен';
  const avatar = author?.details?.imageURL;

  return (
    <div className="fpd-wrapper">
      <SEOHead
        title={`${post.title} | Форум Общност`}
        description={post.excerpt || ''}
        image={post.coverImage || '/images/academy/community-bg.jpg'}
        type="article"
        publishedTime={post.publishedAt}
      />
      <ScrollToTop />
      <TextZoom />

      <div className="fpd-inner">
        {/* Breadcrumb */}
        <nav className="fpd-breadcrumb">
          <button className="fpd-bc-link" onClick={() => navigate('/academy')}>Академия</button>
          <span className="fpd-bc-sep"><ChevronRight size={12} /></span>
          <button className="fpd-bc-link" onClick={() => navigate('/academy/community')}>Форум</button>
          <span className="fpd-bc-sep"><ChevronRight size={12} /></span>
          {post.space && (
            <>
              <button className="fpd-bc-link" onClick={() => navigate('/academy/community')}>{post.space.name}</button>
              <span className="fpd-bc-sep"><ChevronRight size={12} /></span>
            </>
          )}
          <span className="fpd-bc-current">{post.title}</span>
        </nav>

        {/* 2-column layout */}
        <div className="fpd-layout">
          {/* Main column */}
          <div className="fpd-main">
            <article className="fpd-article">
              {/* Cover image — full width at top of card */}
              {post.coverImage && (
                <div className="fpd-cover">
                  <img src={post.coverImage} alt="" loading="lazy" />
                </div>
              )}

              {/* Header strip: space + type */}
              <div className="fpd-article-header">
                <span className="fpd-space-link">
                  {post.space ? `${post.space.icon} ${post.space.name}` : '💬 Обща дискусия'}
                </span>
                <span className="fpd-type-label">{TYPE_LABELS[post.type] || 'Дискусия'}</span>
              </div>

              <div className="fpd-article-body">
                {/* Badges */}
                <div className="fpd-badges">
                  {post.isPinned && <span className="fpd-badge fpd-badge-pinned"><Pin size={11} /> {t('forumCommunity.post.pinned')}</span>}
                  {post.isLocked && <span className="fpd-badge fpd-badge-locked"><Lock size={11} /> {t('forumCommunity.post.locked')}</span>}
                </div>

                <h1 className="fpd-title">{post.title}</h1>

                {/* Author */}
                <div className="fpd-author-row">
                  <div className="fpd-avatar">
                    {avatar
                      ? <img src={avatar} alt={authorName} />
                      : <span>{authorName.charAt(0)}</span>
                    }
                  </div>
                  <div className="fpd-author-info">
                    <span className="fpd-author-name">{authorName}</span>
                    <span className="fpd-date">
                      <Clock size={11} /> {timeAgo(post.createdAt)}
                      {post.editedAt && <em className="fpd-edited"> · {t('forumCommunity.post.edited')}</em>}
                    </span>
                  </div>
                </div>

                {/* Images gallery with thumbnails */}
                {post.images?.filter(Boolean).length > 0 && (
                  <div className="fpd-gallery">
                    <div className="fpd-gallery-main">
                      <img
                        src={post.images.filter(Boolean)[0]}
                        alt=""
                        className="fpd-gallery-main-img"
                        onClick={() => setLightboxIndex(0)}
                        loading="lazy"
                      />
                    </div>
                    {post.images.filter(Boolean).length > 1 && (
                      <div className="fpd-gallery-thumbs">
                        {post.images.filter(Boolean).map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt=""
                            className={`fpd-gallery-thumb ${i === 0 ? 'fpd-gallery-thumb-active' : ''}`}
                            onClick={() => setLightboxIndex(i)}
                            loading="lazy"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Videos */}
                {post.videos?.filter(Boolean).length > 0 && (
                  <div className="fpd-videos">
                    {post.videos.filter(Boolean).map((vid, i) => (
                      <video key={i} src={vid} controls preload="metadata" className="fpd-video-player" />
                    ))}
                  </div>
                )}

                {/* Content */}
                <div className="fpd-content" dangerouslySetInnerHTML={{ __html: post.content }} />

                {/* Tags */}
                {post.tags?.length > 0 && (
                  <div className="fpd-tags">
                    {post.tags.map(tag => (
                      <span key={tag.id} className="fpd-tag">#{tag.name}</span>
                    ))}
                  </div>
                )}

                {/* Reactions */}
                <div className="fpd-reactions-row">
                  <ForumReactions
                    targetType="post"
                    targetId={post.id}
                    reactions={post.reactions || []}
                    userReaction={post.userReaction}
                    onReactionChange={() => getPost(slug)}
                  />
                </div>

                {/* Stats bar */}
                <div className="fpd-stats-bar">
                  <div className="fpd-stats-left">
                    <span className="fpd-stat"><Eye size={14} /> {post.viewCount}</span>
                    <span className="fpd-stat"><MessageSquare size={14} /> {post.commentCount}</span>
                    <span className="fpd-stat"><Share2 size={14} /> {post.shareCount}</span>
                  </div>
                  {isAuthentication && (
                    <button
                      className={`fpd-bookmark-btn ${post.isBookmarked ? 'fpd-bookmark-active' : ''}`}
                      onClick={() => toggleBookmark(post.id)}
                    >
                      {post.isBookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                      {post.isBookmarked ? t('forumCommunity.post.bookmarked') : t('forumCommunity.post.bookmark')}
                    </button>
                  )}
                </div>
              </div>
            </article>

            {/* Comments */}
            <ForumComments
              postId={post.id}
              comments={currentComments}
              onRefresh={() => getPost(slug)}
            />
          </div>

          {/* Sidebar */}
          <aside className="fpd-sidebar">
            <button className="fpd-back-widget" onClick={() => navigate('/academy/community')}>
              <MessagesSquare size={16} /> Назад към Форума
            </button>

            <div className="fpd-widget">
              <h3 className="fpd-widget-title">Популярни тагове</h3>
              <ForumTrendingTags onTagClick={() => {}} />
            </div>

            <div className="fpd-widget">
              <h3 className="fpd-widget-title">Последни статии</h3>
              <ForumArticlesCarousel />
            </div>

            <div className="fpd-widget">
              <h3 className="fpd-widget-title">Предстоящи семинари</h3>
              <ForumUpcomingSeminars />
            </div>

            <div className="fpd-widget">
              <h3 className="fpd-widget-title">Препоръчани курсове</h3>
              <ForumCoursesPromo />
            </div>
          </aside>
        </div>
      </div>

      {/* Image lightbox */}
      {lightboxIndex !== null && post.images?.filter(Boolean).length > 0 && (
        <ForumImageLightbox
          images={post.images.filter(Boolean)}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
};

export default ForumPostDetail;
