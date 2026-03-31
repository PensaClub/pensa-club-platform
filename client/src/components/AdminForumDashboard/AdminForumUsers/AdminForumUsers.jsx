// src/components/AdminForumDashboard/AdminForumUsers/AdminForumUsers.jsx
// Prefix: afu-

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { forumServiceFactory } from '../../Services/forumServiceFactory';
import { toast } from 'react-toastify';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Users,
  Shield,
  ShieldOff,
  AlertTriangle,
  Ban,
  Volume2,
  VolumeX,
  Crown,
  Star,
  StarOff,
  UserX,
  UserCheck,
} from 'lucide-react';
import './adminForumUsers.css';

const FILTER_TABS = ['all', 'banned', 'muted', 'vip'];

const AdminForumUsers = () => {
  const { t } = useTranslation('admin');
  const forumService = forumServiceFactory();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
  const [punishModal, setPunishModal] = useState(null);
  const [punishAction, setPunishAction] = useState('warn');
  const [punishReason, setPunishReason] = useState('');
  const [punishDuration, setPunishDuration] = useState('24h');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const params = { page: p, limit: 20 };
      if (filterTab !== 'all') params.filter = filterTab;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const data = await forumService.adminGetUsers(params);
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      setPage(p);
    } catch {
      toast.error(t('forum.users.loadError', 'Error loading users'));
    } finally {
      setLoading(false);
    }
  }, [filterTab, debouncedSearch]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const openPunishModal = (user) => {
    setPunishModal(user);
    setPunishAction('warn');
    setPunishReason('');
    setPunishDuration('24h');
  };

  const handlePunish = async () => {
    if (!punishModal) return;
    const userId = punishModal.id;
    const data = { reason: punishReason, duration: punishDuration };

    try {
      setActionLoading(userId);
      switch (punishAction) {
        case 'warn':
          await forumService.adminWarnUser(userId, data);
          break;
        case 'mute':
          await forumService.adminMuteUser(userId, data);
          break;
        case 'restrict':
          await forumService.adminRestrictUser(userId, data);
          break;
        case 'ban':
          await forumService.adminBanUser(userId, data);
          break;
        case 'permban':
          await forumService.adminPermBanUser(userId, data);
          break;
        default:
          break;
      }
      toast.success(t('forum.users.actionSuccess', 'Action applied'));
      setPunishModal(null);
      fetchUsers(page);
    } catch {
      toast.error(t('forum.users.actionError', 'Action failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnban = async (userId) => {
    try {
      setActionLoading(userId);
      await forumService.adminUnbanUser(userId);
      toast.success(t('forum.users.unbanned', 'User unbanned'));
      fetchUsers(page);
    } catch {
      toast.error(t('forum.users.actionError', 'Action failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVip = async (user) => {
    try {
      setActionLoading(user.id);
      if (user.isVip) {
        await forumService.adminRevokeVip(user.id);
        toast.success(t('forum.users.vipRevoked', 'VIP revoked'));
      } else {
        await forumService.adminGrantVip(user.id);
        toast.success(t('forum.users.vipGranted', 'VIP granted'));
      }
      fetchUsers(page);
    } catch {
      toast.error(t('forum.users.actionError', 'Action failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getUserStatusBadge = (user) => {
    if (user.isBanned) return <span className="afu-status-badge afu-status-banned">{t('forum.users.banned', 'Banned')}</span>;
    if (user.isMuted) return <span className="afu-status-badge afu-status-muted">{t('forum.users.muted', 'Muted')}</span>;
    if (user.isVip) return <span className="afu-status-badge afu-status-vip">{t('forum.users.vip', 'VIP')}</span>;
    return <span className="afu-status-badge afu-status-active">{t('forum.users.active', 'Active')}</span>;
  };

  return (
    <div className="afu-container">
      <div className="afu-filters">
        <div className="afu-search-wrap">
          <Search size={16} className="afu-search-icon" />
          <input
            type="text"
            className="afu-search"
            placeholder={t('forum.users.searchPlaceholder', 'Search users...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="afu-refresh-btn" onClick={() => fetchUsers(page)}>
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="afu-filter-tabs">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            className={`afu-filter-tab ${filterTab === tab ? 'afu-filter-tab-active' : ''}`}
            onClick={() => setFilterTab(tab)}
          >
            {t(`forum.users.filter.${tab}`, tab)}
          </button>
        ))}
      </div>

      <div className="afu-total">
        {t('forum.users.totalResults', '{{count}} users', { count: total })}
      </div>

      {/* Punish modal */}
      {punishModal && (
        <div className="afu-modal-overlay">
          <div className="afu-modal">
            <h3 className="afu-modal-title">
              {t('forum.users.punishTitle', 'User Action')}
            </h3>
            <div className="afu-modal-user">
              <span className="afu-modal-username">
                {punishModal.firstName} {punishModal.lastName}
              </span>
              <span className="afu-modal-email">{punishModal.email}</span>
            </div>
            <div className="afu-field">
              <label className="afu-label">{t('forum.users.actionType', 'Action')}</label>
              <select
                className="afu-select afu-modal-select"
                value={punishAction}
                onChange={(e) => setPunishAction(e.target.value)}
              >
                <option value="warn">{t('forum.users.warn', 'Warn')}</option>
                <option value="mute">{t('forum.users.mute', 'Mute')}</option>
                <option value="restrict">{t('forum.users.restrict', 'Restrict')}</option>
                <option value="ban">{t('forum.users.ban', 'Temporary Ban')}</option>
                <option value="permban">{t('forum.users.permban', 'Permanent Ban')}</option>
              </select>
            </div>
            {(punishAction === 'mute' || punishAction === 'ban' || punishAction === 'restrict') && (
              <div className="afu-field">
                <label className="afu-label">{t('forum.users.duration', 'Duration')}</label>
                <select
                  className="afu-select afu-modal-select"
                  value={punishDuration}
                  onChange={(e) => setPunishDuration(e.target.value)}
                >
                  <option value="1h">1 {t('forum.users.hour', 'hour')}</option>
                  <option value="24h">24 {t('forum.users.hours', 'hours')}</option>
                  <option value="3d">3 {t('forum.users.days', 'days')}</option>
                  <option value="7d">7 {t('forum.users.days', 'days')}</option>
                  <option value="30d">30 {t('forum.users.days', 'days')}</option>
                </select>
              </div>
            )}
            <div className="afu-field">
              <label className="afu-label">{t('forum.users.reason', 'Reason')}</label>
              <textarea
                className="afu-textarea"
                value={punishReason}
                onChange={(e) => setPunishReason(e.target.value)}
                rows={3}
                placeholder={t('forum.users.reasonPlaceholder', 'Enter reason...')}
              />
            </div>
            <div className="afu-modal-actions">
              <button className="afu-cancel-btn" onClick={() => setPunishModal(null)}>
                {t('forum.users.cancel', 'Cancel')}
              </button>
              <button className="afu-apply-btn" onClick={handlePunish}>
                {t('forum.users.apply', 'Apply')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users cards */}
      {loading ? (
        <div className="afu-loading">
          <div className="afu-spinner"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="afu-empty">
          <Users size={32} />
          <p>{t('forum.users.noUsers', 'No users found')}</p>
        </div>
      ) : (
        <div className="afu-grid">
          {users.map((user) => (
            <div key={user.id} className="afu-card">
              <div className="afu-card-top">
                <div className="afu-card-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="afu-avatar-img" />
                  ) : (
                    <span className="afu-avatar-placeholder">
                      {(user.firstName?.[0] || '?').toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="afu-card-info">
                  <span className="afu-card-name">
                    {user.firstName} {user.lastName}
                    {user.isVip && <Crown size={14} className="afu-vip-icon" />}
                  </span>
                  <span className="afu-card-email">{user.email}</span>
                </div>
                {getUserStatusBadge(user)}
              </div>
              <div className="afu-card-stats">
                <span className="afu-card-stat">
                  {user.postCount || 0} {t('forum.users.posts', 'posts')}
                </span>
                <span className="afu-card-stat">
                  {user.commentCount || 0} {t('forum.users.comments', 'comments')}
                </span>
                <span className="afu-card-stat">
                  {user.warnCount || 0} {t('forum.users.warnings', 'warnings')}
                </span>
                <span className="afu-card-stat-date">
                  {t('forum.users.joined', 'Joined')}: {formatDate(user.createdAt)}
                </span>
              </div>
              <div className="afu-card-actions">
                {actionLoading === user.id ? (
                  <div className="afu-action-spinner"></div>
                ) : (
                  <>
                    <button
                      className="afu-action-btn afu-action-punish"
                      onClick={() => openPunishModal(user)}
                      title={t('forum.users.manageUser', 'Manage')}
                    >
                      <AlertTriangle size={14} />
                      {t('forum.users.manage', 'Manage')}
                    </button>
                    {user.isBanned && (
                      <button
                        className="afu-action-btn afu-action-unban"
                        onClick={() => handleUnban(user.id)}
                        title={t('forum.users.unban', 'Unban')}
                      >
                        <UserCheck size={14} />
                        {t('forum.users.unban', 'Unban')}
                      </button>
                    )}
                    <button
                      className={`afu-action-btn ${user.isVip ? 'afu-action-revoke-vip' : 'afu-action-grant-vip'}`}
                      onClick={() => handleToggleVip(user)}
                      title={user.isVip ? t('forum.users.revokeVip', 'Revoke VIP') : t('forum.users.grantVip', 'Grant VIP')}
                    >
                      {user.isVip ? <StarOff size={14} /> : <Star size={14} />}
                      {user.isVip ? t('forum.users.revokeVip', 'Revoke VIP') : t('forum.users.grantVip', 'Grant VIP')}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="afu-pagination">
          <button className="afu-page-btn" onClick={() => fetchUsers(page - 1)} disabled={page <= 1}>
            <ChevronLeft size={16} />
          </button>
          <span className="afu-page-info">{page} / {totalPages}</span>
          <button className="afu-page-btn" onClick={() => fetchUsers(page + 1)} disabled={page >= totalPages}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminForumUsers;
