// src/components/AdminForumDashboard/AdminForumAnalytics/AdminForumAnalytics.jsx
// Prefix: afa-

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { forumServiceFactory } from '../../Services/forumServiceFactory';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, BarChart3, Download } from 'lucide-react';
import './adminForumAnalytics.css';

const PERIODS = [
  { key: 7, label: '7 дни' },
  { key: 30, label: '30 дни' },
  { key: 90, label: '90 дни' },
];

const COLORS = ['#8b2040', '#d4a853', '#2cb5a0', '#8b6cc1', '#3aab6a', '#d4943c'];
const TYPE_COLORS = { discussion: '#3b82f6', article: '#8b6cc1', question: '#d4943c', poll: '#2cb5a0' };
const TYPE_LABELS = { discussion: 'Дискусия', article: 'Статия', question: 'Въпрос', poll: 'Анкета' };

const GrowthCard = ({ label, current, previous }) => {
  const diff = previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0;
  const isUp = diff > 0;
  const isDown = diff < 0;

  return (
    <div className="afa-growth-card">
      <div className="afa-growth-value">{current}</div>
      <div className="afa-growth-label">{label}</div>
      <div className={`afa-growth-diff ${isUp ? 'afa-up' : isDown ? 'afa-down' : 'afa-neutral'}`}>
        {isUp ? <TrendingUp size={12} /> : isDown ? <TrendingDown size={12} /> : <Minus size={12} />}
        {Math.abs(diff)}% vs предходен период
      </div>
    </div>
  );
};

const AdminForumAnalytics = () => {
  const { t } = useTranslation('admin');
  const forumService = forumServiceFactory();
  const [period, setPeriod] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async (p) => {
    try {
      setLoading(true);
      const result = await forumService.adminGetAnalytics({ period: p });
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(period);
  }, [period, fetchAnalytics]);

  if (loading) {
    return <div className="afa-loading"><div className="afa-spinner" /></div>;
  }

  if (!data) {
    return <div className="afa-empty">Няма данни за анализ</div>;
  }

  // Merge daily data for combined chart
  const dailyMap = {};
  data.postsPerDay?.forEach(d => { dailyMap[d.date] = { ...dailyMap[d.date], date: d.date, posts: d.count }; });
  data.commentsPerDay?.forEach(d => { dailyMap[d.date] = { ...dailyMap[d.date], date: d.date, comments: d.count }; });
  data.reactionsPerDay?.forEach(d => { dailyMap[d.date] = { ...dailyMap[d.date], date: d.date, reactions: d.count }; });
  const dailyData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date)).map(d => ({
    ...d,
    posts: d.posts || 0,
    comments: d.comments || 0,
    reactions: d.reactions || 0,
    label: new Date(d.date).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' }),
  }));

  return (
    <div className="afa-container">
      <div className="afa-header">
        <h3 className="afa-title">
          <BarChart3 size={20} />
          {t('forum.analytics.title', 'Forum Analytics')}
        </h3>
        <div className="afa-actions">
          <div className="afa-periods">
            {PERIODS.map(p => (
              <button
                key={p.key}
                className={`afa-period-btn ${period === p.key ? 'afa-period-active' : ''}`}
                onClick={() => setPeriod(p.key)}
              >{p.label}</button>
            ))}
          </div>
          <button
            className="afa-export-btn"
            onClick={async () => {
              try {
                const auth = JSON.parse(localStorage.getItem('auth') || '{}');
                const res = await fetch(`${import.meta.env.VITE_API_URL}/forum/admin/analytics/export?period=${period}`, {
                  headers: { Authorization: `Bearer ${auth.token}` },
                  credentials: 'include',
                });
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `forum-analytics-${period}d.pdf`;
                a.click();
                URL.revokeObjectURL(url);
              } catch { /* ignore */ }
            }}
          >
            <Download size={14} /> PDF
          </button>
        </div>
      </div>

      {/* Growth cards */}
      <div className="afa-growth-grid">
        <GrowthCard label="Публикации" current={data.growth?.posts?.current || 0} previous={data.growth?.posts?.previous || 0} />
        <GrowthCard label="Коментари" current={data.growth?.comments?.current || 0} previous={data.growth?.comments?.previous || 0} />
        <GrowthCard label="Нови потребители" current={data.growth?.users?.current || 0} previous={data.growth?.users?.previous || 0} />
      </div>

      {/* Activity chart */}
      {dailyData.length > 0 && (
        <div className="afa-chart-card">
          <h4 className="afa-chart-title">Активност по дни</h4>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPosts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b2040" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b2040" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradComments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4a853" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4a853" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradReactions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2cb5a0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2cb5a0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="label" stroke="#666" fontSize={11} />
              <YAxis stroke="#666" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1e1e24', border: '1px solid #333', borderRadius: 6, fontSize: 12, color: '#ddd' }} />
              <Legend />
              <Area type="monotone" dataKey="posts" name="Публикации" stroke="#8b2040" fill="url(#gradPosts)" strokeWidth={2} />
              <Area type="monotone" dataKey="comments" name="Коментари" stroke="#d4a853" fill="url(#gradComments)" strokeWidth={2} />
              <Area type="monotone" dataKey="reactions" name="Реакции" stroke="#2cb5a0" fill="url(#gradReactions)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="afa-charts-row">
        {/* Top authors */}
        {data.topAuthors?.length > 0 && (
          <div className="afa-chart-card afa-chart-half">
            <h4 className="afa-chart-title">Топ автори</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.topAuthors} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#666" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#888" fontSize={11} width={75} />
                <Tooltip contentStyle={{ background: '#1e1e24', border: '1px solid #333', borderRadius: 6, fontSize: 12, color: '#ddd' }} />
                <Bar dataKey="posts" name="Публикации" fill="#8b2040" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Post types pie */}
        {data.postTypes?.length > 0 && (
          <div className="afa-chart-card afa-chart-half">
            <h4 className="afa-chart-title">Типове публикации</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.postTypes}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ type, percent }) => `${TYPE_LABELS[type] || type} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.postTypes.map((entry, i) => (
                    <Cell key={entry.type} fill={TYPE_COLORS[entry.type] || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e1e24', border: '1px solid #333', borderRadius: 6, fontSize: 12, color: '#ddd' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top posts table */}
      {data.topPosts?.length > 0 && (
        <div className="afa-chart-card">
          <h4 className="afa-chart-title">Топ публикации</h4>
          <table className="afa-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Заглавие</th>
                <th>Прегледи</th>
                <th>Коментари</th>
                <th>Реакции</th>
              </tr>
            </thead>
            <tbody>
              {data.topPosts.map((p, i) => (
                <tr key={`${p.id}-${i}`}>
                  <td>{i + 1}</td>
                  <td className="afa-post-title">{p.title}</td>
                  <td>{p.views}</td>
                  <td>{p.comments}</td>
                  <td>{p.reactions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminForumAnalytics;
