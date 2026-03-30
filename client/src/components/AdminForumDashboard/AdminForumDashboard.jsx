// src/components/AdminForumDashboard/AdminForumDashboard.jsx
// Prefix: afd-

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../contexts/UserContext';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { forumServiceFactory } from '../Services/forumServiceFactory';
import { toast } from 'react-toastify';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Boxes,
  Flag,
  Users,
  BookOpen,
  Settings,
  TrendingUp,
  Eye,
  AlertTriangle,
  Clock,
  Award,
  Activity,
  Download,
} from 'lucide-react';
import './adminForumDashboard.css';

const AdminForumPosts = lazy(() => import('./AdminForumPosts/AdminForumPosts'));
const AdminForumComments = lazy(() => import('./AdminForumComments/AdminForumComments'));
const AdminForumSpaces = lazy(() => import('./AdminForumSpaces/AdminForumSpaces'));
const AdminForumReports = lazy(() => import('./AdminForumReports/AdminForumReports'));
const AdminForumUsers = lazy(() => import('./AdminForumUsers/AdminForumUsers'));
const AdminForumRules = lazy(() => import('./AdminForumRules/AdminForumRules'));
const AdminForumSettings = lazy(() => import('./AdminForumSettings/AdminForumSettings'));

const TABS = [
  { key: 'overview', icon: LayoutDashboard },
  { key: 'posts', icon: FileText },
  { key: 'comments', icon: MessageSquare },
  { key: 'spaces', icon: Boxes },
  { key: 'reports', icon: Flag },
  { key: 'users', icon: Users },
  { key: 'rules', icon: BookOpen },
  { key: 'settings', icon: Settings },
];

const AdminForumDashboard = () => {
  const { t } = useTranslation('admin');
  const { isAuth, token: authToken } = useAuthContext();
  const navigate = useLocalizedNavigate();
  const forumService = forumServiceFactory();

  const initialTab = window.location.hash?.replace('#', '') || 'overview';
  const [activeTab, setActiveTab] = useState(TABS.some(t => t.key === initialTab) ? initialTab : 'overview');

  const handleTabChange = (key) => {
    setActiveTab(key);
    window.location.hash = key;
  };
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await forumService.adminGetDashboard();
      setDashboard(data);
    } catch (err) {
      toast.error(t('forum.dashboard.loadError', 'Error loading dashboard'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleExport = async (type) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const tkn = authToken || document.cookie.split(';').find(c => c.trim().startsWith('refreshJwtToken='))?.split('=')?.[1];
      const res = await fetch(`${apiUrl}/forum/admin/export/${type}`, {
        headers: { Authorization: `Bearer ${tkn}` },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Export failed');
      const pdfBlob = await res.blob();
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forum-${type}-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t('forum.dashboard.exportSuccess', 'Експортът е успешен'));
    } catch {
      toast.error(t('forum.dashboard.exportError', 'Грешка при експорт'));
    }
  };

  const rawStats = dashboard?.stats || {};
  const pending = dashboard?.pending || {};
  const stats = {
    totalPosts: rawStats.postCount || 0,
    totalComments: rawStats.commentCount || 0,
    totalUsers: rawStats.userCount || 0,
    totalViews: rawStats.totalViews || 0,
    pendingPosts: pending.posts || 0,
    openReports: pending.reports || 0,
    totalSpaces: rawStats.spaceCount || 0,
    activeToday: rawStats.activeToday || 0,
  };

  const renderTabContent = () => {
    const fallback = (
      <div className="afd-tab-loading">
        <div className="afd-spinner"></div>
      </div>
    );

    switch (activeTab) {
      case 'posts':
        return <Suspense fallback={fallback}><AdminForumPosts /></Suspense>;
      case 'comments':
        return <Suspense fallback={fallback}><AdminForumComments /></Suspense>;
      case 'spaces':
        return <Suspense fallback={fallback}><AdminForumSpaces /></Suspense>;
      case 'reports':
        return <Suspense fallback={fallback}><AdminForumReports /></Suspense>;
      case 'users':
        return <Suspense fallback={fallback}><AdminForumUsers /></Suspense>;
      case 'rules':
        return <Suspense fallback={fallback}><AdminForumRules /></Suspense>;
      case 'settings':
        return <Suspense fallback={fallback}><AdminForumSettings /></Suspense>;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => {
    if (loading) {
      return (
        <div className="afd-loading">
          <div className="afd-spinner"></div>
          <p>{t('forum.dashboard.loading', 'Loading...')}</p>
        </div>
      );
    }

    return (
      <div className="afd-overview">
        <div className="afd-stats-grid">
          <div className="afd-stat-card">
            <div className="afd-stat-icon afd-stat-posts">
              <FileText size={22} />
            </div>
            <div className="afd-stat-info">
              <span className="afd-stat-value">{stats.totalPosts || 0}</span>
              <span className="afd-stat-label">{t('forum.dashboard.totalPosts', 'Total Posts')}</span>
            </div>
          </div>
          <div className="afd-stat-card">
            <div className="afd-stat-icon afd-stat-comments">
              <MessageSquare size={22} />
            </div>
            <div className="afd-stat-info">
              <span className="afd-stat-value">{stats.totalComments || 0}</span>
              <span className="afd-stat-label">{t('forum.dashboard.totalComments', 'Total Comments')}</span>
            </div>
          </div>
          <div className="afd-stat-card">
            <div className="afd-stat-icon afd-stat-users">
              <Users size={22} />
            </div>
            <div className="afd-stat-info">
              <span className="afd-stat-value">{stats.totalUsers || 0}</span>
              <span className="afd-stat-label">{t('forum.dashboard.totalUsers', 'Total Users')}</span>
            </div>
          </div>
          <div className="afd-stat-card">
            <div className="afd-stat-icon afd-stat-views">
              <Eye size={22} />
            </div>
            <div className="afd-stat-info">
              <span className="afd-stat-value">{stats.totalViews || 0}</span>
              <span className="afd-stat-label">{t('forum.dashboard.totalViews', 'Total Views')}</span>
            </div>
          </div>
          <div className="afd-stat-card">
            <div className="afd-stat-icon afd-stat-pending">
              <Clock size={22} />
            </div>
            <div className="afd-stat-info">
              <span className="afd-stat-value">{stats.pendingPosts || 0}</span>
              <span className="afd-stat-label">{t('forum.dashboard.pendingPosts', 'Pending Posts')}</span>
            </div>
          </div>
          <div className="afd-stat-card">
            <div className="afd-stat-icon afd-stat-reports">
              <AlertTriangle size={22} />
            </div>
            <div className="afd-stat-info">
              <span className="afd-stat-value">{stats.openReports || 0}</span>
              <span className="afd-stat-label">{t('forum.dashboard.openReports', 'Open Reports')}</span>
            </div>
          </div>
          <div className="afd-stat-card">
            <div className="afd-stat-icon afd-stat-spaces">
              <Boxes size={22} />
            </div>
            <div className="afd-stat-info">
              <span className="afd-stat-value">{stats.totalSpaces || 0}</span>
              <span className="afd-stat-label">{t('forum.dashboard.totalSpaces', 'Total Spaces')}</span>
            </div>
          </div>
          <div className="afd-stat-card">
            <div className="afd-stat-icon afd-stat-active">
              <Activity size={22} />
            </div>
            <div className="afd-stat-info">
              <span className="afd-stat-value">{stats.activeToday || 0}</span>
              <span className="afd-stat-label">{t('forum.dashboard.activeToday', 'Active Today')}</span>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="afd-recent-section">
          <div className="afd-recent-card">
            <div className="afd-recent-header">
              <h3>
                <TrendingUp size={18} />
                {t('forum.dashboard.recentPosts', 'Recent Posts')}
              </h3>
            </div>
            <div className="afd-recent-list">
              {(dashboard?.recentPosts || []).length === 0 && (
                <p className="afd-empty">{t('forum.dashboard.noPosts', 'No posts yet')}</p>
              )}
              {(dashboard?.recentPosts || []).map((post) => (
                <div key={post.id} className="afd-recent-item">
                  <span className="afd-recent-title">{post.title}</span>
                  <span className="afd-recent-meta">
                    {post.author?.firstName} {post.author?.lastName}
                  </span>
                  <span className={`afd-badge afd-badge-${post.status}`}>{post.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="afd-recent-card">
            <div className="afd-recent-header">
              <h3>
                <Flag size={18} />
                {t('forum.dashboard.recentReports', 'Recent Reports')}
              </h3>
            </div>
            <div className="afd-recent-list">
              {(dashboard?.recentReports || []).length === 0 && (
                <p className="afd-empty">{t('forum.dashboard.noReports', 'No reports')}</p>
              )}
              {(dashboard?.recentReports || []).map((report) => (
                <div key={report.id} className="afd-recent-item">
                  <span className="afd-recent-title">{report.reason}</span>
                  <span className="afd-recent-meta">{report.reporter?.firstName}</span>
                  <span className={`afd-badge afd-badge-${report.status}`}>{report.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export buttons */}
        <div className="afd-export-section">
          <h3>
            <Download size={18} />
            {t('forum.dashboard.export', 'Export Data')}
          </h3>
          <div className="afd-export-buttons">
            <button className="afd-export-btn" onClick={() => handleExport('posts')}>
              <FileText size={16} />
              {t('forum.dashboard.exportPosts', 'Posts')}
            </button>
            <button className="afd-export-btn" onClick={() => handleExport('comments')}>
              <MessageSquare size={16} />
              {t('forum.dashboard.exportComments', 'Comments')}
            </button>
            <button className="afd-export-btn" onClick={() => handleExport('users')}>
              <Users size={16} />
              {t('forum.dashboard.exportUsers', 'Users')}
            </button>
            <button className="afd-export-btn" onClick={() => handleExport('reports')}>
              <Flag size={16} />
              {t('forum.dashboard.exportReports', 'Reports')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="afd-container">
      <div className="afd-header">
        <h1 className="afd-title">
          <LayoutDashboard size={28} />
          {t('forum.dashboard.title', 'Forum Administration')}
        </h1>
      </div>

      <nav className="afd-tabs">
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            className={`afd-tab ${activeTab === key ? 'afd-tab-active' : ''}`}
            onClick={() => handleTabChange(key)}
          >
            <Icon size={18} />
            <span className="afd-tab-label">{t(`forum.dashboard.tabs.${key}`, key)}</span>
          </button>
        ))}
      </nav>

      <div className="afd-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminForumDashboard;
