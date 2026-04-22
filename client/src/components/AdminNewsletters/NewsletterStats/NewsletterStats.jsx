// src/components/AdminNewsletters/NewsletterStats/NewsletterStats.jsx
// Prefix: anst-

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  UserCheck,
  UserX,
  Ban,
  TrendingUp,
  CalendarDays,
  Loader2,
  Eye,
  MousePointerClick,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
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

const RANGE_OPTIONS = [30, 90, 180];

const buildRange = (days) => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().substring(0, 10),
    to: to.toISOString().substring(0, 10),
  };
};

export const NewsletterStats = () => {
  const { t } = useTranslation('adminNewsletters');
  const { getAdminSubscriberStats, getNewsletterStatsOverview } =
    useCommunityContext();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [overview, setOverview] = useState(null);
  const [overviewDays, setOverviewDays] = useState(90);
  const [isOverviewLoading, setIsOverviewLoading] = useState(false);

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

  const fetchOverview = useCallback(async (days) => {
    setIsOverviewLoading(true);
    try {
      const range = buildRange(days);
      const data = await getNewsletterStatsOverview(range);
      setOverview(data || null);
    } catch {
      notify('error', null, t('subStats.loadError'));
    } finally {
      setIsOverviewLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchOverview(overviewDays);
  }, [fetchOverview, overviewDays]);

  const totals = useMemo(() => {
    const b = overview?.breakdown || [];
    const sent = b.reduce((s, r) => s + (r.sent || 0), 0);
    const opened = b.reduce((s, r) => s + (r.opened || 0), 0);
    const clicked = b.reduce((s, r) => s + (r.clicked || 0), 0);
    return {
      sent,
      opened,
      clicked,
      openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
      clickRate: sent > 0 ? Math.round((clicked / sent) * 100) : 0,
    };
  }, [overview]);

  const breakdownChartData = useMemo(() => {
    return (overview?.breakdown || []).map((row) => ({
      type: t(`list.types.${row.type}`, { defaultValue: row.type }),
      openRate: row.openRate,
      clickRate: row.clickRate,
    }));
  }, [overview, t]);

  const timeSeriesChartData = useMemo(() => {
    return (overview?.timeSeries || []).map((row) => ({
      week: row.week,
      openRate: row.openRate,
      clickRate: row.clickRate,
    }));
  }, [overview]);

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

      <section className="anst-perf">
        <header className="anst-perf-head">
          <div>
            <h3 className="anst-section-title">{t('perf.title')}</h3>
            <p className="anst-perf-subtitle">{t('perf.subtitle')}</p>
          </div>
          <div className="anst-perf-range">
            {RANGE_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                className={`anst-range-btn ${
                  overviewDays === d ? 'anst-range-btn--active' : ''
                }`}
                onClick={() => setOverviewDays(d)}
                disabled={isOverviewLoading}
              >
                {t('perf.rangeDays', { count: d })}
              </button>
            ))}
          </div>
        </header>

        {isOverviewLoading && (
          <div className="anst-perf-loading">
            <span className="anst-loading-icon">
              <Loader2 />
            </span>
            <span>{t('subStats.loading')}</span>
          </div>
        )}

        {!isOverviewLoading && overview && (
          <>
            <div className="anst-perf-cards">
              <div className="anst-card anst-card--teal">
                <span className="anst-card-icon">
                  <Eye />
                </span>
                <div className="anst-card-text">
                  <span className="anst-card-label">{t('perf.openRate')}</span>
                  <span className="anst-card-value">{totals.openRate}%</span>
                  <span className="anst-card-meta">
                    {t('perf.openedOf', {
                      opened: totals.opened,
                      sent: totals.sent,
                    })}
                  </span>
                </div>
              </div>
              <div className="anst-card anst-card--amber">
                <span className="anst-card-icon">
                  <MousePointerClick />
                </span>
                <div className="anst-card-text">
                  <span className="anst-card-label">{t('perf.clickRate')}</span>
                  <span className="anst-card-value">{totals.clickRate}%</span>
                  <span className="anst-card-meta">
                    {t('perf.clickedOf', {
                      clicked: totals.clicked,
                      sent: totals.sent,
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="anst-charts">
              <div className="anst-chart">
                <h4 className="anst-chart-title">{t('perf.byTypeTitle')}</h4>
                {breakdownChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={breakdownChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                      <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                      <YAxis unit="%" tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="openRate"
                        name={t('perf.openRate')}
                        fill="#14b8a6"
                      />
                      <Bar
                        dataKey="clickRate"
                        name={t('perf.clickRate')}
                        fill="#f59e0b"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="anst-chart-empty">{t('perf.noData')}</p>
                )}
              </div>

              <div className="anst-chart">
                <h4 className="anst-chart-title">{t('perf.timeSeriesTitle')}</h4>
                {timeSeriesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={timeSeriesChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                      <YAxis unit="%" tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="openRate"
                        name={t('perf.openRate')}
                        stroke="#14b8a6"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="clickRate"
                        name={t('perf.clickRate')}
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="anst-chart-empty">{t('perf.noData')}</p>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};
