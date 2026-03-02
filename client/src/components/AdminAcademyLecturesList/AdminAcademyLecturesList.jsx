// src/components/AdminAcademyLecturesList/AdminAcademyLecturesList.jsx
// Prefix: aalc-

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAcademyCourses } from '../contexts/AcademyCoursesProvider';
import {
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Users,
  RefreshCw,
  AlertTriangle,
  Video,
  Play,
  Square,
  XCircle,
  Radio,
  Mic,
} from 'lucide-react';
import './adminAcademyLecturesList.css';

const STATUS_OPTIONS = ['all', 'draft', 'published', 'scheduled', 'live', 'completed', 'cancelled'];
const TYPE_OPTIONS = ['all', 'lecture', 'webinar', 'workshop', 'masterclass'];
const SORT_OPTIONS = ['newest', 'oldest', 'title', 'upcoming', 'popular'];

const AdminAcademyLecturesList = () => {
  const { t } = useTranslation('academy-admin');
  const navigate = useNavigate();
  const {
    getAdminLectures,
    deleteLecture,
    publishLecture,
    unpublishLecture,
    cancelLecture,
    startLecture,
    endLecture,
  } = useAcademyCourses();

  const [lectures, setLectures] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // =========================================================
  //                    FETCH
  // =========================================================

  const fetchLectures = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const params = { page, limit: 12, sortBy };
      if (status !== 'all') params.status = status;
      if (type !== 'all') params.type = type;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const data = await getAdminLectures(params);
      setLectures(data.lectures || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching admin lectures:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAdminLectures, debouncedSearch, status, type, sortBy]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    fetchLectures(1);
  }, [debouncedSearch, status, type, sortBy]);

  // =========================================================
  //                    ACTIONS
  // =========================================================

  const handlePublishToggle = async (lec) => {
    setActionLoading(lec.id);
    try {
      if (lec.isPublished) {
        await unpublishLecture(lec.id);
      } else {
        await publishLecture(lec.id);
      }
      await fetchLectures(pagination.page);
    } catch (err) {
      console.error('Error toggling publish:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(deleteModal.id);
    try {
      await deleteLecture(deleteModal.id);
      setDeleteModal(null);
      await fetchLectures(pagination.page);
    } catch (err) {
      console.error('Error deleting lecture:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    setActionLoading(cancelModal.id);
    try {
      await cancelLecture(cancelModal.id, cancelReason || null);
      setCancelModal(null);
      setCancelReason('');
      await fetchLectures(pagination.page);
    } catch (err) {
      console.error('Error cancelling lecture:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartLive = async (lec) => {
    setActionLoading(lec.id);
    try {
      await startLecture(lec.id);
      await fetchLectures(pagination.page);
    } catch (err) {
      console.error('Error starting lecture:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEndLive = async (lec) => {
    setActionLoading(lec.id);
    try {
      await endLecture(lec.id);
      await fetchLectures(pagination.page);
    } catch (err) {
      console.error('Error ending lecture:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchLectures(newPage);
  };

  // =========================================================
  //                    HELPERS
  // =========================================================

  const getStatusBadgeClass = (lec) => {
    if (lec.status === 'cancelled') return 'aalc-badge-cancelled';
    if (lec.status === 'live') return 'aalc-badge-live';
    if (lec.status === 'completed') return 'aalc-badge-completed';
    if (lec.status === 'scheduled') return 'aalc-badge-scheduled';
    if (!lec.isPublished) return 'aalc-badge-draft';
    return 'aalc-badge-published';
  };

  const getStatusLabel = (lec) => {
    if (lec.status === 'cancelled') return t('adminLectures.statuses.cancelled', 'Отменена');
    if (lec.status === 'live') return t('adminLectures.statuses.live', 'НА ЖИВО');
    if (lec.status === 'completed') return t('adminLectures.statuses.completed', 'Завършена');
    if (lec.status === 'scheduled') return t('adminLectures.statuses.scheduled', 'Насрочена');
    if (!lec.isPublished) return t('adminLectures.statuses.draft', 'Чернова');
    return t('adminLectures.statuses.published', 'Публикувана');
  };

  const getTypeLabel = (lectureType) => {
    return t(`adminLectures.types.${lectureType}`, lectureType);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // =========================================================
  //                    RENDER
  // =========================================================

  return (
    <div className="aalc-wrapper">
      <div className="aalc-page-bg">
        <div className="aalc-glow-orb" />
      </div>

      <div className="aalc-container">
        {/* Header */}
        <div className="aalc-header">
          <div className="aalc-header-top">
            <div className="aalc-header-info">
              <h1 className="aalc-title">
                <Mic size={28} />
                <span>{t('adminLectures.title', 'Управление на')}{' '}</span>
                <span className="aalc-title-accent">{t('adminLectures.titleAccent', 'лекции')}</span>
              </h1>
              <p className="aalc-subtitle">
                {t('adminLectures.subtitle', 'Създавайте, редактирайте и управлявайте лекциите в академията')}
              </p>
            </div>
            <div className="aalc-header-actions">
              <button className="aalc-btn aalc-btn-refresh" onClick={() => fetchLectures(pagination.page)} title={t('adminLectures.refresh', 'Обнови')}>
                <RefreshCw size={16} className={isLoading ? 'aalc-spin' : ''} />
              </button>
              <Link to="/academy/admin/create-lecture" className="aalc-btn aalc-btn-create">
                <Plus size={18} />
                {t('adminLectures.createLecture', 'Нова лекция')}
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="aalc-stats-bar">
            <div className="aalc-stat">
              <Video size={16} />
              <span className="aalc-stat-value">{pagination.total || 0}</span>
              <span className="aalc-stat-label">{t('adminLectures.stats.total', 'общо')}</span>
            </div>
            <div className="aalc-stat">
              <Eye size={16} />
              <span className="aalc-stat-value">{lectures.filter(l => l.isPublished).length}</span>
              <span className="aalc-stat-label">{t('adminLectures.stats.published', 'публикувани')}</span>
            </div>
            <div className="aalc-stat">
              <Radio size={16} />
              <span className="aalc-stat-value">{lectures.filter(l => l.status === 'live').length}</span>
              <span className="aalc-stat-label">{t('adminLectures.stats.live', 'на живо')}</span>
            </div>
            <div className="aalc-stat">
              <EyeOff size={16} />
              <span className="aalc-stat-value">{lectures.filter(l => !l.isPublished).length}</span>
              <span className="aalc-stat-label">{t('adminLectures.stats.drafts', 'чернови')}</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="aalc-toolbar">
          <div className="aalc-search-box">
            <Search size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('adminLectures.searchPlaceholder', 'Търси по заглавие...')}
              className="aalc-search-input"
            />
          </div>
          <button className="aalc-btn aalc-btn-filter" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} />
            {t('adminLectures.filters', 'Филтри')}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="aalc-filters-panel">
            <div className="aalc-filter-group">
              <label className="aalc-filter-label">{t('adminLectures.status', 'Статус')}</label>
              <div className="aalc-filter-chips">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    className={`aalc-chip ${status === opt ? 'aalc-chip-active' : ''}`}
                    onClick={() => setStatus(opt)}
                  >
                    {t(`adminLectures.statusOptions.${opt}`, opt)}
                  </button>
                ))}
              </div>
            </div>
            <div className="aalc-filter-group">
              <label className="aalc-filter-label">{t('adminLectures.type', 'Тип')}</label>
              <div className="aalc-filter-chips">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    className={`aalc-chip ${type === opt ? 'aalc-chip-active' : ''}`}
                    onClick={() => setType(opt)}
                  >
                    {t(`adminLectures.typeOptions.${opt}`, opt)}
                  </button>
                ))}
              </div>
            </div>
            <div className="aalc-filter-group">
              <label className="aalc-filter-label">{t('adminLectures.sortBy', 'Подреди по')}</label>
              <div className="aalc-filter-chips">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    className={`aalc-chip ${sortBy === opt ? 'aalc-chip-active' : ''}`}
                    onClick={() => setSortBy(opt)}
                  >
                    {t(`adminLectures.sortOptions.${opt}`, opt)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {isLoading && lectures.length === 0 ? (
          <div className="aalc-loading">
            <div className="aalc-spinner" />
            <p>{t('adminLectures.loading', 'Зареждане на лекции...')}</p>
          </div>
        ) : lectures.length === 0 ? (
          <div className="aalc-empty">
            <Video size={48} strokeWidth={1} />
            <h3>{t('adminLectures.empty.title', 'Няма намерени лекции')}</h3>
            <p>{t('adminLectures.empty.description', 'Създайте първата си лекция или променете филтрите')}</p>
            <Link to="/academy/admin/create-lecture" className="aalc-btn aalc-btn-create">
              <Plus size={18} />
              {t('adminLectures.createLecture', 'Нова лекция')}
            </Link>
          </div>
        ) : (
          <>
            <div className="aalc-grid">
              {lectures.map((lec) => (
                <div key={lec.id} className={`aalc-card ${!lec.isPublished && lec.status !== 'live' ? 'aalc-card-draft' : ''}`}>
                  {/* Thumbnail */}
                  <div className="aalc-card-thumb">
                    {lec.thumbnailUrl ? (
                      <img src={lec.thumbnailUrl} alt={lec.title} className="aalc-card-img" />
                    ) : (
                      <div className="aalc-card-img-placeholder">
                        <Video size={32} strokeWidth={1.5} />
                      </div>
                    )}

                    <span className={`aalc-badge ${getStatusBadgeClass(lec)}`}>
                      {lec.status === 'live' && <span className="aalc-live-dot" />}
                      {getStatusLabel(lec)}
                    </span>

                    <span className="aalc-badge aalc-badge-type">
                      {getTypeLabel(lec.lectureType)}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="aalc-card-body">
                    {lec.category && (
                      <span className="aalc-card-category">{lec.category}</span>
                    )}
                    <h3 className="aalc-card-title">{lec.title}</h3>
                    {lec.shortDescription && (
                      <p className="aalc-card-desc">{lec.shortDescription}</p>
                    )}

                    {/* Lecturer */}
                    {lec.lecturer && (
                      <div className="aalc-card-lecturer">
                        {lec.lecturer.photoUrl ? (
                          <img src={lec.lecturer.photoUrl} alt={lec.lecturer.name} className="aalc-lecturer-avatar" />
                        ) : (
                          <div className="aalc-lecturer-avatar-placeholder">
                            {(lec.lecturer.name || '?')[0]}
                          </div>
                        )}
                        <span className="aalc-lecturer-name">{lec.lecturer.name}</span>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="aalc-card-stats">
                      <div className="aalc-card-stat" title={t('adminLectures.cardStats.date', 'Дата')}>
                        <Calendar size={14} />
                        <span>{formatDate(lec.scheduledDate)}</span>
                      </div>
                      {lec.durationMinutes > 0 && (
                        <div className="aalc-card-stat" title={t('adminLectures.cardStats.duration', 'Продължителност')}>
                          <Clock size={14} />
                          <span>{lec.durationMinutes} {t('adminLectures.min', 'мин.')}</span>
                        </div>
                      )}
                      <div className="aalc-card-stat" title={t('adminLectures.cardStats.registered', 'Записани')}>
                        <Users size={14} />
                        <span>
                          {lec.registeredCount || 0}
                          {lec.maxParticipants ? ` / ${lec.maxParticipants}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="aalc-card-actions">
                    <button
                      className="aalc-action-btn aalc-action-edit"
                      onClick={() => navigate(`/academy/admin/edit-lecture/${lec.slug}`)}
                      title={t('adminLectures.actions.edit', 'Редактирай')}
                    >
                      <Pencil size={15} />
                    </button>

                    {lec.status === 'scheduled' && (
                      <button
                        className="aalc-action-btn aalc-action-start"
                        onClick={() => handleStartLive(lec)}
                        disabled={actionLoading === lec.id}
                        title={t('adminLectures.actions.startLive', 'Стартирай LIVE')}
                      >
                        <Play size={15} />
                      </button>
                    )}

                    {lec.status === 'live' && (
                      <button
                        className="aalc-action-btn aalc-action-end"
                        onClick={() => handleEndLive(lec)}
                        disabled={actionLoading === lec.id}
                        title={t('adminLectures.actions.endLive', 'Спри LIVE')}
                      >
                        <Square size={15} />
                      </button>
                    )}

                    <button
                      className={`aalc-action-btn ${lec.isPublished ? 'aalc-action-unpublish' : 'aalc-action-publish'}`}
                      onClick={() => handlePublishToggle(lec)}
                      disabled={actionLoading === lec.id || lec.status === 'cancelled'}
                      title={lec.isPublished
                        ? t('adminLectures.actions.unpublish', 'Скрий')
                        : t('adminLectures.actions.publish', 'Публикувай')}
                    >
                      {lec.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>

                    {lec.status !== 'cancelled' && lec.status !== 'completed' && (
                      <button
                        className="aalc-action-btn aalc-action-cancel"
                        onClick={() => setCancelModal(lec)}
                        disabled={actionLoading === lec.id}
                        title={t('adminLectures.actions.cancel', 'Отмени')}
                      >
                        <XCircle size={15} />
                      </button>
                    )}

                    <button
                      className="aalc-action-btn aalc-action-delete"
                      onClick={() => setDeleteModal(lec)}
                      disabled={actionLoading === lec.id}
                      title={t('adminLectures.actions.delete', 'Изтрий')}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="aalc-pagination">
                <button
                  className="aalc-page-btn"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="aalc-page-info">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  className="aalc-page-btn"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="aalc-modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="aalc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="aalc-modal-icon">
              <AlertTriangle size={32} />
            </div>
            <h3 className="aalc-modal-title">{t('adminLectures.deleteModal.title', 'Изтриване на лекция')}</h3>
            <p className="aalc-modal-text">
              {t('adminLectures.deleteModal.text', 'Сигурни ли сте, че искате да изтриете')}
              <strong> {deleteModal.title}</strong>?
              {' '}{t('adminLectures.deleteModal.warning', 'Това действие е необратимо.')}
            </p>
            <div className="aalc-modal-actions">
              <button className="aalc-btn aalc-btn-cancel" onClick={() => setDeleteModal(null)}>
                {t('adminLectures.deleteModal.cancel', 'Отказ')}
              </button>
              <button className="aalc-btn aalc-btn-delete" onClick={handleDelete} disabled={actionLoading === deleteModal.id}>
                <Trash2 size={16} />
                {t('adminLectures.deleteModal.confirm', 'Изтрий')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="aalc-modal-overlay" onClick={() => { setCancelModal(null); setCancelReason(''); }}>
          <div className="aalc-modal aalc-modal-cancel" onClick={(e) => e.stopPropagation()}>
            <div className="aalc-modal-icon aalc-modal-icon-cancel">
              <XCircle size={32} />
            </div>
            <h3 className="aalc-modal-title">{t('adminLectures.cancelModal.title', 'Отмяна на лекция')}</h3>
            <p className="aalc-modal-text">
              {t('adminLectures.cancelModal.text', 'Отменяте')}
              <strong> {cancelModal.title}</strong>.
              {' '}{t('adminLectures.cancelModal.reasonLabel', 'Можете да посочите причина:')}
            </p>
            <textarea
              className="aalc-cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder={t('adminLectures.cancelModal.reasonPlaceholder', 'Причина за отмяна (незадължително)')}
              rows={3}
              maxLength={500}
            />
            <div className="aalc-modal-actions">
              <button className="aalc-btn aalc-btn-cancel" onClick={() => { setCancelModal(null); setCancelReason(''); }}>
                {t('adminLectures.cancelModal.back', 'Назад')}
              </button>
              <button className="aalc-btn aalc-btn-cancel-confirm" onClick={handleCancel} disabled={actionLoading === cancelModal.id}>
                <XCircle size={16} />
                {t('adminLectures.cancelModal.confirm', 'Отмени лекцията')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAcademyLecturesList;