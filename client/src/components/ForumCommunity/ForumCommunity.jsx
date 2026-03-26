import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForum } from '../contexts/ForumProvider';
import { useAuthContext } from '../contexts/UserContext';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import { TextZoom } from '../TextZoom/TextZoom';
import SEOHead from '../SEO/SEOHead';
import './forumCommunity.css';

const ForumCommunity = () => {
  const { t } = useTranslation('forum');
  const { isAuthentication } = useAuthContext();
  const { getStats, getSpaces, stats, spaces, getMyStatus, myStatus } = useForum();

  useEffect(() => {
    getStats();
    getSpaces();
  }, [getStats, getSpaces]);

  useEffect(() => {
    if (isAuthentication) {
      getMyStatus();
    }
  }, [isAuthentication, getMyStatus]);

  return (
    <div className="fmc-wrapper">
      <SEOHead
        title={t('forumCommunity.seo.title', 'Общност | DigiBridge Academy')}
        description={t('forumCommunity.seo.description', 'Дискутирайте, споделяйте опит и се свързвайте с други участници.')}
        image="/images/academy/academy-community-og.jpg"
      />
      <ScrollToTop />
      <TextZoom />

      {/* Header */}
      <div className="fmc-header">
        <h1 className="fmc-header-title">
          <span>{'{ }'}</span> {t('forumCommunity.hero.title', 'Общност')}
        </h1>
        <div className="fmc-header-actions">
          {/* ThemeToggle, search, new post button — Phase 2 */}
        </div>
      </div>

      {/* 3-column layout */}
      <div className="fmc-layout">
        {/* Left: Spaces */}
        <aside className="fmc-left">
          <div className="fmc-section">
            <h2 className="fmc-section-title">
              {t('forumCommunity.spaces.title', 'Пространства')}
              <span className="fmc-coming-soon">Phase 2</span>
            </h2>
            {spaces.length === 0 ? (
              <p className="fmc-placeholder-text">
                {t('forumCommunity.spaces.allPosts', 'Всички публикации')}
              </p>
            ) : (
              spaces.map(space => (
                <div key={space.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--forum-border)' }}>
                  <span>{space.icon} {space.name}</span>
                  <span style={{ color: 'var(--forum-text-secondary)', fontSize: '12px', marginLeft: 8 }}>
                    {space.postCount} {t('forumCommunity.spaces.posts', 'публикации')}
                  </span>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Center: Feed */}
        <main className="fmc-center">
          {/* Stats */}
          <div className="fmc-section" style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--forum-accent)' }}>
                {stats?.activeUsers || 0}+
              </div>
              <div style={{ fontSize: 12, color: 'var(--forum-text-secondary)' }}>
                {t('forumCommunity.stats.activeUsers', 'Активни потребители')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--forum-accent)' }}>
                {stats?.posts || 0}+
              </div>
              <div style={{ fontSize: 12, color: 'var(--forum-text-secondary)' }}>
                {t('forumCommunity.stats.posts', 'Публикации')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--forum-accent)' }}>
                {stats?.comments || 0}+
              </div>
              <div style={{ fontSize: 12, color: 'var(--forum-text-secondary)' }}>
                {t('forumCommunity.stats.comments', 'Коментари')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--forum-accent)' }}>
                {stats?.spaces || 0}+
              </div>
              <div style={{ fontSize: 12, color: 'var(--forum-text-secondary)' }}>
                {t('forumCommunity.stats.spaces', 'Пространства')}
              </div>
            </div>
          </div>

          {/* Feed placeholder */}
          <div className="fmc-placeholder">
            <div className="fmc-placeholder-icon">💬</div>
            <div className="fmc-placeholder-title">
              {t('forumCommunity.feed.title', 'Публикации')}
            </div>
            <div className="fmc-placeholder-text">
              {t('forumCommunity.feed.empty', 'Няма публикации все още')}
              <br />
              <span className="fmc-coming-soon">Feed + Create Post — Phase 2</span>
            </div>
          </div>
        </main>

        {/* Right: Widgets */}
        <aside className="fmc-right">
          <div className="fmc-section">
            <h2 className="fmc-section-title">
              {t('forumCommunity.sidebar.latestArticles', 'Последни статии')}
              <span className="fmc-coming-soon">Phase 4</span>
            </h2>
            <p className="fmc-placeholder-text">Carousel с последни 5 статии</p>
          </div>

          <div className="fmc-section">
            <h2 className="fmc-section-title">
              {t('forumCommunity.sidebar.trendingTags', 'Популярни тагове')}
              <span className="fmc-coming-soon">Phase 4</span>
            </h2>
            <p className="fmc-placeholder-text">Tag cloud</p>
          </div>

          <div className="fmc-section">
            <h2 className="fmc-section-title">
              {t('forumCommunity.sidebar.upcomingSeminars', 'Предстоящи семинари')}
              <span className="fmc-coming-soon">Phase 4</span>
            </h2>
            <p className="fmc-placeholder-text">Мини-карти за семинари</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ForumCommunity;
