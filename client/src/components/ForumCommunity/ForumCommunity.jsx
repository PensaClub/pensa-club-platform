import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForum } from '../contexts/ForumProvider';
import { useAuthContext } from '../contexts/UserContext';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import { TextZoom } from '../TextZoom/TextZoom';
import SEOHead from '../SEO/SEOHead';
import ForumHero from './ForumHero/ForumHero';
import ForumStats from './ForumStats/ForumStats';
import ForumSpaces from './ForumSpaces/ForumSpaces';
import ForumFeed from './ForumFeed/ForumFeed';
import ForumCreatePost from './ForumCreatePost/ForumCreatePost';
import ForumRulesModal from './ForumRulesModal/ForumRulesModal';
import ForumSuggestSpace from './ForumSuggestSpace/ForumSuggestSpace';
import ForumSearch from './ForumSearch/ForumSearch';
import ForumTrendingTags from './ForumTrendingTags/ForumTrendingTags';
import ForumArticlesCarousel from './ForumArticlesCarousel/ForumArticlesCarousel';
import ForumUpcomingSeminars from './ForumUpcomingSeminars/ForumUpcomingSeminars';
import ForumCoursesPromo from './ForumCoursesPromo/ForumCoursesPromo';
import ForumPostOfWeek from './ForumPostOfWeek/ForumPostOfWeek';
import ForumLeaderboard from './ForumLeaderboard/ForumLeaderboard';
import { useSocket } from '../contexts/SocketProvider';
import { Plus } from 'lucide-react';
import './forumCommunity.css';

/* SVG Wave component — reusable divider */
const WaveDivider = ({ flip, fromColor, toColor }) => (
  <svg
    className={`fmc-wave ${flip ? 'fmc-wave-flip' : ''}`}
    viewBox="0 0 1440 60"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0,20 C240,50 480,0 720,30 C960,60 1200,10 1440,35 L1440,60 L0,60 Z"
      style={{ fill: flip ? 'var(--fm-bg)' : 'var(--fm-bg-warm)' }}
    />
  </svg>
);

const ForumCommunity = () => {
  const { t } = useTranslation('forum');
  const { isAuthentication } = useAuthContext();
  const { getStats, getSpaces, stats, getMyStatus, hasAcceptedRules, getForumSettings, forumSettings } = useForum();
  const { socket, onlineCount } = useSocket() || {};

  const [activeSpaceId, setActiveSpaceId] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showSuggestSpace, setShowSuggestSpace] = useState(false);
  const [feedKey, setFeedKey] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    getStats();
    getSpaces();
    getForumSettings();
  }, [getStats, getSpaces, getForumSettings]);

  useEffect(() => {
    if (isAuthentication) {
      getMyStatus();
    }
  }, [isAuthentication, getMyStatus]);

  // Join/leave feed room for real-time post updates
  useEffect(() => {
    if (!socket) return;
    socket.emit('forum:joinFeed');
    return () => socket.emit('forum:leaveFeed');
  }, [socket]);

  const handlePostCreated = useCallback(() => {
    setFeedKey(prev => prev + 1);
    getStats();
  }, [getStats]);

  return (
    <div className="fmc-wrapper">
      <SEOHead
        title={t('forumCommunity.seo.title', 'DigiBridge Общност — Дискусии, споделяне и учене заедно | Pensa Club')}
        description={t('forumCommunity.seo.description', 'Присъединете се към DigiBridge Общност — платформа за дискусии, споделяне на опит и взаимопомощ между възрастни хора.')}
        keywords="DigiBridge общност, форум за пенсионери, дискусии, споделяне на опит, дигитална грамотност, пенсионери, Pensa Club"
        image="/images/forum/networking_people.jpg"
      />
      <ScrollToTop />
      <TextZoom />

      {/* Full-screen hero landing (once per session) */}
      <ForumHero onEnter={() => {}} />

      {/* Decorative blobs */}
      <div className="fmc-blob fmc-blob-1" />
      <div className="fmc-blob fmc-blob-2" />

      {/* Content */}
      <div className="fmc-content">

        {/* Section 1: Spaces bar */}
        {forumSettings?.enableSpaces !== false && (
        <section className="fmc-spaces-section fmc-parallax-section">
          <ForumSpaces
            activeSpaceId={activeSpaceId}
            onSelectSpace={setActiveSpaceId}
            onSuggestSpace={() => setShowSuggestSpace(true)}
          />
        </section>
        )}

        {/* Section 2: Stats */}
        <section className="fmc-stats-section fmc-parallax-section">
          <ForumStats stats={stats} onlineCount={onlineCount} />
        </section>

        {/* Section 3: Feed + Sidebar */}
        <section className="fmc-main-section fmc-parallax-section">
          <div className="fmc-grid">
            <div className="fmc-feed-col">
              <ForumFeed key={feedKey} spaceId={activeSpaceId} />
            </div>

            <aside className="fmc-sidebar-col">
              <ForumSearch />

              <ForumPostOfWeek />
              <ForumLeaderboard />

              <div className="fmc-section">
                <h2 className="fmc-section-title">
                  {t('forumCommunity.sidebar.trendingTags', 'Популярни тагове')}
                </h2>
                <ForumTrendingTags onTagClick={() => {}} />
              </div>

              <div className="fmc-section">
                <h2 className="fmc-section-title">
                  {t('forumCommunity.sidebar.latestArticles', 'Последни статии')}
                </h2>
                <ForumArticlesCarousel />
              </div>

              <div className="fmc-section">
                <h2 className="fmc-section-title">
                  {t('forumCommunity.sidebar.upcomingSeminars', 'Предстоящи семинари')}
                </h2>
                <ForumUpcomingSeminars />
              </div>

              <div className="fmc-section">
                <h2 className="fmc-section-title">
                  {t('forumCommunity.sidebar.recommendedCourses', 'Препоръчани курсове')}
                </h2>
                <ForumCoursesPromo />
              </div>
            </aside>
          </div>
        </section>
      </div>

      {/* FAB — New post button */}
      {isAuthentication && (
        <button className="fmc-fab" onClick={() => {
          if (!hasAcceptedRules) {
            setShowRulesModal(true);
          } else {
            setShowCreatePost(true);
          }
        }}>
          <Plus size={18} />
          {t('forumCommunity.feed.newPost', 'Нова публикация')}
        </button>
      )}

      {/* Modals */}
      {showRulesModal && (
        <ForumRulesModal
          onClose={() => setShowRulesModal(false)}
          onAccepted={() => {
            setShowRulesModal(false);
            setShowCreatePost(true);
          }}
        />
      )}
      {showCreatePost && (
        <ForumCreatePost
          onClose={() => setShowCreatePost(false)}
          onCreated={handlePostCreated}
        />
      )}
      {showSuggestSpace && (
        <ForumSuggestSpace
          onClose={() => setShowSuggestSpace(false)}
        />
      )}
    </div>
  );
};

export default ForumCommunity;
