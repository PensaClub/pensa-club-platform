// src/components/AdminNewsletters/NewsletterStats/NewsletterStats.jsx
// Prefix: anst-

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  UserCheck,
  UserX,
  Ban,
  TrendingUp,
  CalendarDays,
  Loader2,
} from 'lucide-react';
import { useCommunityContext } from '../../contexts/CommunityContext';
import { notify } from '../../../utils/notify.jsx';
import './newsletterStats.css';

const CARDS = [
  { key: 'total', icon: Users, accent: 'teal' },
  { key: 'active', icon: UserCheck, accent: 'green' },
  { key: 'unsubscribed', icon: UserX, accent: 'gray' },
  { key: 'blocked', icon: Ban, accent: 'red' },
  { key: 'newThisWeek', icon: TrendingUp, accent: 'amber' },
  { key: 'newThisMonth', icon: CalendarDays, accent: 'violet' },
];

export const NewsletterStats = () => {
  const { t } = useTranslation('adminNewsletters');
  const { getAdminSubscriberStats } = useCommunityContext();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminSubscriberStats();
      setStats(data || null);
    } catch {
      notify('error', null, t('subStats.loadError'));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="anst-loading">
        <span className="anst-loading-icon">
          <Loader2 />
        </span>
        <span>{t('subStats.loading')}</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="anst-loading">
        <span>{t('subStats.loadError')}</span>
      </div>
    );
  }

  const maxCategoryCount = Math.max(
    1,
    ...(stats.byCategory || []).map((c) => c.count || 0),
  );

  return (
    <div className="anst-root">
      <header className="anst-header">
        <h2 className="anst-title">{t('subStats.title')}</h2>
        <p className="anst-subtitle">{t('subStats.subtitle')}</p>
      </header>

      <div className="anst-cards">
        {CARDS.map(({ key, icon: Icon, accent }) => (
          <div key={key} className={`anst-card anst-card--${accent}`}>
            <span className="anst-card-icon">
              <Icon />
            </span>
            <div className="anst-card-text">
              <span className="anst-card-label">{t(`subStats.cards.${key}`)}</span>
              <span className="anst-card-value">{stats[key] ?? 0}</span>
            </div>
          </div>
        ))}
      </div>

      <section className="anst-categories">
        <h3 className="anst-section-title">{t('subStats.byCategoryTitle')}</h3>
        <ul className="anst-cat-list">
          {(stats.byCategory || []).map(({ category, count }) => {
            const pct = Math.round((count / maxCategoryCount) * 100);
            return (
              <li key={category} className="anst-cat-row">
                <span className="anst-cat-name">
                  {t(`editor.categories.${category}`, { defaultValue: category })}
                </span>
                <div className="anst-cat-bar-wrap">
                  <div
                    className="anst-cat-bar"
                    style={{ width: `${pct}%` }}
                    aria-hidden="true"
                  />
                </div>
                <span className="anst-cat-count">{count}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};
