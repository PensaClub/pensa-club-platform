import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, MessageSquare, MessagesSquare, Layers, Wifi } from 'lucide-react';
import './forumStats.css';

const STATS_CONFIG = [
  { key: 'activeUsers', icon: Users, cssClass: 'fst-color-teal' },
  { key: 'posts', icon: MessageSquare, cssClass: 'fst-color-amber' },
  { key: 'comments', icon: MessagesSquare, cssClass: 'fst-color-violet' },
  { key: 'spaces', icon: Layers, cssClass: 'fst-color-emerald' },
];

const roundUp = (n) => {
  if (n <= 0) return 0;
  return Math.ceil(n / 10) * 10;
};

const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

const AnimatedCounter = ({ target, duration = 1500, delay = 0, started }) => {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!started || target <= 0) return;
    const rounded = roundUp(target);
    let startTime = null;
    const timeout = setTimeout(() => {
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setValue(Math.round(easeOutExpo(progress) * rounded));
        if (progress < 1) frameRef.current = requestAnimationFrame(animate);
      };
      frameRef.current = requestAnimationFrame(animate);
    }, delay);
    return () => { clearTimeout(timeout); if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, duration, delay, started]);

  return <>{value}+</>;
};

const ForumStats = ({ stats, onlineCount }) => {
  const { t } = useTranslation('forum');
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  const handleIntersect = useCallback((entries) => {
    if (entries[0].isIntersecting && !started) setStarted(true);
  }, [started]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [handleIntersect]);

  const values = {
    activeUsers: stats?.activeUsers || 0,
    posts: stats?.posts || 0,
    comments: stats?.comments || 0,
    spaces: stats?.spaces || 0,
  };

  return (
    <div className="fst-container" ref={ref}>
      {onlineCount > 0 && (
        <div className="fst-item fst-color-online">
          <div className="fst-icon"><Wifi size={18} /></div>
          <div className="fst-value">{onlineCount}</div>
          <div className="fst-label">{t('forumCommunity.stats.online', 'Онлайн')}</div>
        </div>
      )}
      {STATS_CONFIG.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div className={`fst-item ${stat.cssClass}`} key={stat.key}>
            <div className="fst-icon">
              <Icon size={18} />
            </div>
            <div className="fst-value">
              <AnimatedCounter target={values[stat.key]} started={started} delay={i * 150} />
            </div>
            <div className="fst-label">
              {t(`forumCommunity.stats.${stat.key}`)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ForumStats;
