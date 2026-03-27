import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { ArrowDown } from 'lucide-react';
import './forumHero.css';

const STORAGE_KEY = 'forum_hero_seen';

const ForumHero = ({ onEnter }) => {
  const { t } = useTranslation('forum');
  const { isAuthentication, user } = useAuthContext();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (isAuthentication && user?.userId) {
      const key = `${STORAGE_KEY}_${user.userId}`;
      if (localStorage.getItem(key)) return;
      setVisible(true);
    } else {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      setVisible(true);
    }
  }, [isAuthentication, user]);

  const handleEnter = useCallback(() => {
    setExiting(true);

    if (isAuthentication && user?.userId) {
      localStorage.setItem(`${STORAGE_KEY}_${user.userId}`, '1');
    } else {
      sessionStorage.setItem(STORAGE_KEY, '1');
    }

    setTimeout(() => {
      setVisible(false);
      setExiting(false);
      onEnter?.();
    }, 700);
  }, [isAuthentication, user, onEnter]);

  if (!visible) return null;

  return (
    <div className={`fh-landing ${exiting ? 'fh-landing-exit' : ''}`}>
      {/* Subtle vertical lines */}
      <div className="fh-lines">
        <div className="fh-line" />
        <div className="fh-line" />
        <div className="fh-line" />
        <div className="fh-line" />
      </div>

      {/* Small blurred decorative spots */}
      <div className="fh-deco fh-deco-1" />
      <div className="fh-deco fh-deco-2" />

      {/* Content */}
      <div className="fh-content">
        <div className="fh-eyebrow">DigiBridge Community</div>

        <h1 className="fh-title">
          {t('forumCommunity.hero.title', 'Общност')}
        </h1>

        <p className="fh-subtitle">
          {t('forumCommunity.hero.subtitle', 'Споделяйте, дискутирайте и учете заедно')}
        </p>

        <button className="fh-enter-btn" onClick={handleEnter}>
          <span>{t('forumCommunity.hero.enter', 'Влез в общността')}</span>
          <ArrowDown size={16} className="fh-enter-arrow" />
        </button>
      </div>
    </div>
  );
};

export default ForumHero;
