// src/components/AdminAcademyCoursesList/AdminAcademyCoursesList.jsx
// Prefix: aacl-

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAcademyCourses } from '../contexts/AcademyCoursesProvider';
import {
  Plus,
  Search,
  Filter,
  BookOpen,
  Users,
  Layers,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Clock,
  Calendar,
  GraduationCap,
  Settings,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import './adminAcademyCoursesList.css';

const STATUS_OPTIONS = ['all', 'published', 'draft'];
const SORT_OPTIONS = ['newest', 'oldest', 'name', 'popular'];

const AdminAcademyCoursesList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    getAdminCourses,
    deleteCourse,
    publishCourse,
    unpublishCourse,
    isLoading,
  } = useAcademyCourses();

  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
const [debouncedSearch, setDebouncedSearch] = useState('');
  // Fetch courses
  const fetchCourses = useCallback(async (page = 1) => {
  try {
    const params = { page, limit: 12, sortBy };
    if (status !== 'all') params.status = status;
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

    const data = await getAdminCourses(params);
    setCourses(data.courses || []);
    setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
  } catch (err) {
    console.error('Error fetching admin courses:', err);
  }
}, [getAdminCourses, debouncedSearch, status, sortBy]);

  // Debounce search input
useEffect(() => {
  const timeout = setTimeout(() => setDebouncedSearch(search), 400);
  return () => clearTimeout(timeout);
}, [search]);

// Single fetch trigger
useEffect(() => {
  fetchCourses(1);
}, [debouncedSearch, status, sortBy]);

  // Actions
  const handlePublishToggle = async (course) => {
    setActionLoading(course.id);
    try {
      if (!course.isDraft) {
        await unpublishCourse(course.id);
      } else {
        await publishCourse(course.id);
      }
      await fetchCourses(pagination.page);
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
      await deleteCourse(deleteModal.id);
      setDeleteModal(null);
      await fetchCourses(pagination.page);
    } catch (err) {
      console.error('Error deleting course:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchCourses(newPage);
  };

  // Helpers
  const getCategoryLabel = (cat) => {
    const map = {
      digital_literacy: t('adminCourses.categories.digital_literacy', 'Дигитална грамотност'),
      internet_safety: t('adminCourses.categories.internet_safety', 'Интернет безопасност'),
      social_media: t('adminCourses.categories.social_media', 'Социални мрежи'),
      office_tools: t('adminCourses.categories.office_tools', 'Офис инструменти'),
      communication: t('adminCourses.categories.communication', 'Комуникация'),
      e_services: t('adminCourses.categories.e_services', 'Е-услуги'),
      other: t('adminCourses.categories.other', 'Друго'),
    };
    return map[cat] || cat || t('adminCourses.categories.other', 'Друго');
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getDifficultyLabel = (level) => {
    const map = {
      beginner: t('adminCourses.difficulty.beginner', 'Начинаещи'),
      intermediate: t('adminCourses.difficulty.intermediate', 'Средно'),
      advanced: t('adminCourses.difficulty.advanced', 'Напреднали'),
    };
    return map[level] || level || '';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="aacl-wrapper">
      {/* Background */}
      <div className="aacl-page-bg">
        <div className="aacl-glow-orb" />
      </div>

      <div className="aacl-container">
        {/* Header */}
        <div className="aacl-header">
          <div className="aacl-header-top">
            <div className="aacl-header-info">
              <h1 className="aacl-title">
                <GraduationCap size={28} />
                <span>{t('adminCourses.title', 'Управление на')}{' '}</span>
                <span className="aacl-title-accent">{t('adminCourses.titleAccent', 'курсове')}</span>
              </h1>
              <p className="aacl-subtitle">
                {t('adminCourses.subtitle', 'Създавайте, редактирайте и управлявайте курсовете в академията')}
              </p>
            </div>
            <div className="aacl-header-actions">
              <button className="aacl-btn aacl-btn-refresh" onClick={() => fetchCourses(pagination.page)} title={t('adminCourses.refresh', 'Обнови')}>
                <RefreshCw size={16} className={isLoading ? 'aacl-spin' : ''} />
              </button>
              <Link to="/academy/admin/create-course" className="aacl-btn aacl-btn-create">
                <Plus size={18} />
                {t('adminCourses.createCourse', 'Създай курс')}
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="aacl-stats-bar">
            <div className="aacl-stat">
              <BookOpen size={16} />
              <span className="aacl-stat-value">{pagination.total || 0}</span>
              <span className="aacl-stat-label">{t('adminCourses.stats.total', 'общо')}</span>
            </div>
            <div className="aacl-stat">
              <Eye size={16} />
              <span className="aacl-stat-value">{courses.filter(c => !c.isDraft).length}</span>
              <span className="aacl-stat-label">{t('adminCourses.stats.published', 'публикувани')}</span>
            </div>
            <div className="aacl-stat">
              <EyeOff size={16} />
              <span className="aacl-stat-value">{courses.filter(c => c.isDraft).length}</span>
              <span className="aacl-stat-label">{t('adminCourses.stats.drafts', 'чернови')}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="aacl-toolbar">
          <div className="aacl-search-box">
            <Search size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('adminCourses.searchPlaceholder', 'Търси по име на курс...')}
              className="aacl-search-input"
            />
          </div>

          <button className="aacl-btn aacl-btn-filter" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} />
            {t('adminCourses.filters', 'Филтри')}
          </button>
        </div>

        {showFilters && (
          <div className="aacl-filters-panel">
            <div className="aacl-filter-group">
              <label className="aacl-filter-label">{t('adminCourses.status', 'Статус')}</label>
              <div className="aacl-filter-chips">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    className={`aacl-chip ${status === opt ? 'aacl-chip-active' : ''}`}
                    onClick={() => setStatus(opt)}
                  >
                    {t(`adminCourses.statusOptions.${opt}`, opt === 'all' ? 'Всички' : opt === 'published' ? 'Публикувани' : 'Чернови')}
                  </button>
                ))}
              </div>
            </div>
            <div className="aacl-filter-group">
              <label className="aacl-filter-label">{t('adminCourses.sortBy', 'Подреди по')}</label>
              <div className="aacl-filter-chips">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    className={`aacl-chip ${sortBy === opt ? 'aacl-chip-active' : ''}`}
                    onClick={() => setSortBy(opt)}
                  >
                    {t(`adminCourses.sortOptions.${opt}`,
                      opt === 'newest' ? 'Най-нови' :
                      opt === 'oldest' ? 'Най-стари' :
                      opt === 'name' ? 'По име' : 'Популярни'
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Course Grid */}
        {isLoading && courses.length === 0 ? (
          <div className="aacl-loading">
            <div className="aacl-spinner" />
            <p>{t('adminCourses.loading', 'Зареждане на курсове...')}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="aacl-empty">
            <BookOpen size={48} strokeWidth={1} />
            <h3>{t('adminCourses.empty.title', 'Няма намерени курсове')}</h3>
            <p>{t('adminCourses.empty.description', 'Създайте първия си курс или променете филтрите')}</p>
            <Link to="/academy/admin/create-course" className="aacl-btn aacl-btn-create">
              <Plus size={18} />
              {t('adminCourses.createCourse', 'Създай курс')}
            </Link>
          </div>
        ) : (
          <>
            <div className="aacl-grid">
              {courses.map((course) => (
                <div key={course.id} className={`aacl-card ${!course.isDraft ? '' : 'aacl-card-draft'}`}>
                  {/* Thumbnail */}
                  <div className="aacl-card-thumb">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.name} className="aacl-card-img" />
                    ) : (
                      <div className="aacl-card-img-placeholder">
                        <BookOpen size={32} strokeWidth={1.5} />
                      </div>
                    )}

                  <span className={`aacl-badge ${!course.isDraft ? 'aacl-badge-published' : 'aacl-badge-draft'}`}>
  {!course.isDraft
    ? t('adminCourses.published', 'Публикуван')
    : t('adminCourses.draft', 'Чернова')}
</span>

                    {/* Difficulty badge */}
                    {course.difficultyLevel && (
                      <span className="aacl-badge aacl-badge-difficulty" style={{ '--diff-color': getDifficultyColor(course.difficultyLevel) }}>
                        {getDifficultyLabel(course.difficultyLevel)}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="aacl-card-body">
                    <span className="aacl-card-category">{getCategoryLabel(course.category)}</span>
                    <h3 className="aacl-card-title">{course.name}</h3>
                    {course.shortDescription && (
                      <p className="aacl-card-desc">{course.shortDescription}</p>
                    )}

                    {/* Stats */}
                    <div className="aacl-card-stats">
                      <div className="aacl-card-stat" title={t('adminCourses.cardStats.lessons', 'Уроци')}>
                        <Layers size={14} />
                        <span>{course.totalLessons || 0}</span>
                      </div>
                      <div className="aacl-card-stat" title={t('adminCourses.cardStats.enrolled', 'Записани')}>
                        <Users size={14} />
                        <span>{course.enrolledCount || 0}</span>
                      </div>
                      {course.estimatedHours > 0 && (
                        <div className="aacl-card-stat" title={t('adminCourses.cardStats.hours', 'Часове')}>
                          <Clock size={14} />
                          <span>{course.estimatedHours}h</span>
                        </div>
                      )}
                      <div className="aacl-card-stat" title={t('adminCourses.cardStats.created', 'Създаден')}>
                        <Calendar size={14} />
                        <span>{formatDate(course.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="aacl-card-actions">
                    <button
                      className="aacl-action-btn aacl-action-edit"
                      onClick={() => navigate(`/academy/admin/edit-course/${course.slug}`)}
                      title={t('adminCourses.actions.edit', 'Редактирай')}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="aacl-action-btn aacl-action-content"
                      onClick={() => navigate(`/academy/admin/course/${course.slug}/content`)}
                      title={t('adminCourses.actions.content', 'Съдържание')}
                    >
                      <Settings size={15} />
                    </button>
                    <button
                      className="aacl-action-btn aacl-action-stats"
                      onClick={() => navigate(`/academy/admin/course/${course.slug}/stats`)}
                      title={t('adminCourses.actions.stats', 'Статистики')}
                    >
                      <BarChart3 size={15} />
                    </button>
                    <button
                      className={`aacl-action-btn ${!course.isDraft ? 'aacl-action-unpublish' : 'aacl-action-publish'}`}
                      onClick={() => handlePublishToggle(course)}
                      disabled={actionLoading === course.id}
                      title={!course.isDraft
                        ? t('adminCourses.actions.unpublish', 'Скрий')
                        : t('adminCourses.actions.publish', 'Публикувай')}
                    >
                      {!course.isDraft ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button
                      className="aacl-action-btn aacl-action-delete"
                      onClick={() => setDeleteModal(course)}
                      disabled={actionLoading === course.id}
                      title={t('adminCourses.actions.delete', 'Изтрий')}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="aacl-pagination">
                <button
                  className="aacl-page-btn"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="aacl-page-info">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  className="aacl-page-btn"
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
        <div className="aacl-modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="aacl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="aacl-modal-icon">
              <AlertTriangle size={32} />
            </div>
            <h3 className="aacl-modal-title">{t('adminCourses.deleteModal.title', 'Изтриване на курс')}</h3>
            <p className="aacl-modal-text">
              {t('adminCourses.deleteModal.text', 'Сигурни ли сте, че искате да изтриете')}
              <strong> „{deleteModal.name}"</strong>?
              {' '}{t('adminCourses.deleteModal.warning', 'Това действие е необратимо.')}
            </p>
            <div className="aacl-modal-actions">
              <button className="aacl-btn aacl-btn-cancel" onClick={() => setDeleteModal(null)}>
                {t('adminCourses.deleteModal.cancel', 'Отказ')}
              </button>
              <button
                className="aacl-btn aacl-btn-delete"
                onClick={handleDelete}
                disabled={actionLoading === deleteModal.id}
              >
                <Trash2 size={16} />
                {t('adminCourses.deleteModal.confirm', 'Изтрий')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAcademyCoursesList;