// src/components/AdminAcademySeminarsList/AdminAcademySeminarsList.jsx
// Prefix: aalcs-

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { LocalizedLink as Link } from '../LocalizedLink/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { useAcademyCourses } from '../contexts/AcademyCoursesProvider';
import { Plus, BookOpen, RefreshCw, ChevronLeft, ChevronRight, BarChart3, Archive } from 'lucide-react';
import SeminarCard from './SeminarCard/SeminarCard';
import SeminarFilters from './SeminarFilters/SeminarFilters';
import SeminarModals from './SeminarModals/SeminarModals';
import './adminAcademySeminarsList.css';

const AdminSeminarStatistics = lazy(() => import('./AdminSeminarStatistics/AdminSeminarStatistics'));
const SeminarLibrary = lazy(() => import('./SeminarLibrary/SeminarLibrary'));

const TABS = [
  { key: 'seminars', icon: BookOpen },
  { key: 'statistics', icon: BarChart3 },
  { key: 'library', icon: Archive },
];

const AdminAcademySeminarsList = () => {
  const { t } = useTranslation('academy-admin');
  const {
    getAdminSeminars,
    deleteSeminar,
    publishSeminar,
    unpublishSeminar,
    cancelSeminar,
  } = useAcademyCourses();

  // Hash-based tab routing
  const initialTab = window.location.hash?.replace('#', '') || 'seminars';
  const [activeTab, setActiveTab] = useState(TABS.some(tab => tab.key === initialTab) ? initialTab : 'seminars');

  const handleTabChange = (key) => {
    setActiveTab(key);
    window.location.hash = key;
  };

  const [seminars, setSeminars] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [deleteModal, setDeleteModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // =========================================================
  //                    FETCH
  // =========================================================

  const fetchSeminars = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const params = { page, limit: 12, sortBy };
      if (status !== 'all') params.status = status;
      if (type !== 'all') params.type = type;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const data = await getAdminSeminars(params);
      setSeminars(data.seminars || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching admin seminars:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAdminSeminars, debouncedSearch, status, type, sortBy]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (activeTab === 'seminars') {
      fetchSeminars(1);
    }
  }, [debouncedSearch, status, type, sortBy, activeTab]);

  // =========================================================
  //                    ACTIONS
  // =========================================================

  const handlePublishToggle = async (sem) => {
    setActionLoading(sem.id);
    try {
      if (sem.isPublished) {
        await unpublishSeminar(sem.id);
      } else {
        await publishSeminar(sem.id);
      }
      await fetchSeminars(pagination.page);
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
      await deleteSeminar(deleteModal.id);
      setDeleteModal(null);
      await fetchSeminars(pagination.page);
    } catch (err) {
      console.error('Error deleting seminar:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (reason) => {
    if (!cancelModal) return;
    setActionLoading(cancelModal.id);
    try {
      await cancelSeminar(cancelModal.id, reason || null);
      setCancelModal(null);
      await fetchSeminars(pagination.page);
    } catch (err) {
      console.error('Error cancelling seminar:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchSeminars(newPage);
  };

  // =========================================================
  //                    RENDER
  // =========================================================

  return (
    <div className="aalcs-wrapper">
      <div className="aalcs-page-bg">
        <div className="aalcs-glow-orb" />
      </div>

      <div className="aalcs-container">
        {/* Header */}
        <div className="aalcs-header">
          <div className="aalcs-header-top">
            <div className="aalcs-header-info">
              <h1 className="aalcs-title">
                <BookOpen size={28} />
                {t('adminSeminars.title', 'Управление на')}{' '}
                <span>{t('adminSeminars.titleAccent', 'семинари')}</span>
              </h1>
              <p className="aalcs-subtitle">
                {t('adminSeminars.subtitle', 'Създавайте, редактирайте и управлявайте семинарите в академията')}
              </p>
            </div>
            <div className="aalcs-header-actions">
              {activeTab === 'seminars' && (
                <>
                  <button className="aalcs-btn aalcs-btn-refresh" onClick={() => fetchSeminars(pagination.page)} title={t('adminSeminars.refresh', 'Обнови')}>
                    <RefreshCw size={16} className={isLoading ? 'aalcs-spin' : ''} />
                  </button>
                  <Link to="/academy/admin/create-seminar" className="aalcs-btn aalcs-btn-create">
                    <Plus size={18} />
                    {t('adminSeminars.createSeminar', 'Нов семинар')}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <nav className="aalcs-tabs">
            {TABS.map(({ key, icon: Icon }) => (
              <button
                key={key}
                className={`aalcs-tab ${activeTab === key ? 'aalcs-tab-active' : ''}`}
                onClick={() => handleTabChange(key)}
              >
                <Icon size={18} />
                <span>{t(`adminSeminars.tabs.${key}`, key === 'seminars' ? 'Семинари' : key === 'statistics' ? 'Статистика' : 'Библиотека')}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'seminars' && (
          <>
            {/* Stats bar */}
            <div className="aalcs-stats-bar">
              <div className="aalcs-stat">
                <BookOpen size={16} />
                <span className="aalcs-stat-value">{pagination.total || 0}</span>
                <span className="aalcs-stat-label">{t('adminSeminars.stats.total', 'общо')}</span>
              </div>
              <div className="aalcs-stat">
                <span className="aalcs-stat-value">{seminars.filter(s => s.isPublished).length}</span>
                <span className="aalcs-stat-label">{t('adminSeminars.stats.published', 'публикувани')}</span>
              </div>
              <div className="aalcs-stat">
                <span className="aalcs-stat-value">{seminars.filter(s => s.status === 'scheduled').length}</span>
                <span className="aalcs-stat-label">{t('adminSeminars.stats.scheduled', 'насрочени')}</span>
              </div>
              <div className="aalcs-stat">
                <span className="aalcs-stat-value">{seminars.filter(s => !s.isPublished).length}</span>
                <span className="aalcs-stat-label">{t('adminSeminars.stats.drafts', 'чернови')}</span>
              </div>
            </div>

            {/* Filters */}
            <SeminarFilters
              search={search}
              setSearch={setSearch}
              status={status}
              setStatus={setStatus}
              type={type}
              setType={setType}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            {/* Grid */}
            {isLoading && seminars.length === 0 ? (
              <div className="aalcs-loading">
                <div className="aalcs-spinner" />
                <p>{t('adminSeminars.loading', 'Зареждане на семинари...')}</p>
              </div>
            ) : seminars.length === 0 ? (
              <div className="aalcs-empty">
                <BookOpen size={48} strokeWidth={1} />
                <h3>{t('adminSeminars.empty.title', 'Няма намерени семинари')}</h3>
                <p>{t('adminSeminars.empty.description', 'Създайте първия си семинар или променете филтрите')}</p>
                <Link to="/academy/admin/create-seminar" className="aalcs-btn aalcs-btn-create">
                  <Plus size={18} />
                  {t('adminSeminars.createSeminar', 'Нов семинар')}
                </Link>
              </div>
            ) : (
              <>
                <div className="aalcs-grid">
                  {seminars.map((sem) => (
                    <SeminarCard
                      key={sem.id}
                      seminar={sem}
                      actionLoading={actionLoading}
                      onPublishToggle={handlePublishToggle}
                      onDelete={setDeleteModal}
                      onCancel={setCancelModal}
                    />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="aalcs-pagination">
                    <button className="aalcs-page-btn" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1}>
                      <ChevronLeft size={16} />
                    </button>
                    <span className="aalcs-page-info">{pagination.page} / {pagination.totalPages}</span>
                    <button className="aalcs-page-btn" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'statistics' && (
          <Suspense fallback={<div className="aalcs-loading"><div className="aalcs-spinner" /></div>}>
            <AdminSeminarStatistics />
          </Suspense>
        )}

        {activeTab === 'library' && (
          <Suspense fallback={<div className="aalcs-loading"><div className="aalcs-spinner" /></div>}>
            <SeminarLibrary />
          </Suspense>
        )}
      </div>

      {/* Modals */}
      <SeminarModals
        deleteModal={deleteModal}
        setDeleteModal={setDeleteModal}
        cancelModal={cancelModal}
        setCancelModal={setCancelModal}
        actionLoading={actionLoading}
        onDelete={handleDelete}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default AdminAcademySeminarsList;
