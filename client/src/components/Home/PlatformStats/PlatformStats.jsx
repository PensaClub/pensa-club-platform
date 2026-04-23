import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { useCommunityContext } from '../../contexts/CommunityContext';
import './platformStats.css';

const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const AnimatedCounter = ({ target, delay = 0 }) => {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);
  const duration = target <= 10 ? 1800 : target <= 50 ? 1500 : 1200;

  useEffect(() => {
    if (target <= 0) return;
    let startTime = null;
    const timeout = setTimeout(() => {
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setValue(Math.round(easeOutCubic(progress) * target));
        if (progress < 1) frameRef.current = requestAnimationFrame(animate);
      };
      frameRef.current = requestAnimationFrame(animate);
    }, delay);
    return () => { clearTimeout(timeout); if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, duration, delay]);

  return <>{value}</>;
};

export const PlatformStats = () => {
  const { t } = useTranslation('home');
  const navigate = useLocalizedNavigate();
  const { getPlatformCounts } = useCommunityContext();

  const [stats, setStats] = useState({ clubs: 0, articles: 0, initiatives: 0, publications: 0, projects: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const counts = await getPlatformCounts();
        if (cancelled) return;
        if (counts && typeof counts === 'object') {
          setStats({
            clubs: counts.clubs || 0,
            articles: counts.articles || 0,
            initiatives: counts.initiatives || 0,
            publications: counts.publications || 0,
            projects: counts.projects || 0,
          });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getLabel = (key, count) => {
    return count === 1
      ? t(`platformStats.${key}.singular`)
      : t(`platformStats.${key}.plural`);
  };

  const statsConfig = [
    { key: 'clubs', color: '#1B6D4D', bgColor: 'rgba(27, 109, 77, 0.08)', path: '/clubs' },
    { key: 'articles', color: '#E26020', bgColor: 'rgba(226, 96, 32, 0.08)', path: '/articles' },
    { key: 'initiatives', color: '#0072B5', bgColor: 'rgba(0, 114, 181, 0.08)', path: '/initiatives' },
    { key: 'publications', color: '#8A4F7D', bgColor: 'rgba(138, 79, 125, 0.08)', path: '/publications' },
    { key: 'projects', color: '#1B8B8A', bgColor: 'rgba(27, 139, 138, 0.08)', path: '/projects' },
  ];

  const handleStatClick = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const visibleStats = statsConfig.filter(config => stats[config.key] > 0);

  if (isLoading) {
    return (
      <section className="platform-stats-section">
        <div className="platform-stats-container">
          <div className="platform-stats-loading">
            <div className="platform-stats-spinner" />
          </div>
        </div>
      </section>
    );
  }

  if (visibleStats.length === 0) return null;

  return (
    <section className="platform-stats-section">
      <div className="platform-stats-container">
        <div className="platform-stats-grid">
          {visibleStats.map((config, i) => (
            <div
              key={config.key}
              className="platform-stat-card"
              style={{
                '--stat-color': config.color,
                '--stat-bg-color': config.bgColor,
              }}
              onClick={() => handleStatClick(config.path)}
            >
              <div className="platform-stat-content">
                <div className="platform-stat-number">
                  <AnimatedCounter target={stats[config.key]} delay={i * 120} />
                </div>
                <div className="platform-stat-label">
                  {getLabel(config.key, stats[config.key])}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
