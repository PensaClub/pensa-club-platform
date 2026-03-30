// src/components/AdminForumDashboard/AdminForumReports/AdminForumReports.jsx
// Prefix: afrp-

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { forumServiceFactory } from '../../Services/forumServiceFactory';
import { toast } from 'react-toastify';
import {
  Search,
  Check,
  X,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Flag,
  AlertTriangle,
} from 'lucide-react';
import './adminForumReports.css';

const STATUS_OPTIONS = ['all', 'open', 'reviewed', 'dismissed'];

const AdminForumReports = () => {
  const { t } = useTranslation('admin');
  const forumService = forumServiceFactory();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewAction, setReviewAction] = useState('reviewed');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchReports = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const params = { page: p, limit: 20 };
      if (status !== 'all') params.status = status;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const data = await forumService.adminGetReports(params);
      setReports(data.reports || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      setPage(p);
    } catch {
      toast.error(t('forum.reports.loadError', 'Error loading reports'));
    } finally {
      setLoading(false);
    }
  }, [status, debouncedSearch]);

  useEffect(() => {
    fetchReports(1);
  }, [fetchReports]);

  const [authorStatus, setAuthorStatus] = useState(null);

  const openReviewModal = async (report) => {
    setReviewModal(report);
    setReviewNote('');
    setReviewAction('reviewed');
    setAuthorStatus(null);
    // Load author status
    const authorId = report.targetContent?.authorId;
    if (authorId) {
      try {
        const data = await forumService.adminGetUser(authorId);
        setAuthorStatus(data);
      } catch {}
    }
  };

  const handleReview = async () => {
    if (!reviewModal) return;
    try {
      setActionLoading(reviewModal.id);
      await forumService.adminReviewReport(reviewModal.id, {
        status: reviewAction,
        note: reviewNote,
      });
      toast.success(t('forum.reports.reviewed', 'Report reviewed'));
      setReviewModal(null);
      fetchReports(page);
    } catch {
      toast.error(t('forum.reports.actionError', 'Action failed'));
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="afrp-container">
      <div className="afrp-filters">
        <div className="afrp-search-wrap">
          <Search size={16} className="afrp-search-icon" />
          <input
            type="text"
            className="afrp-search"
            placeholder={t('forum.reports.searchPlaceholder', 'Search reports...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="afrp-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {t(`forum.reports.status.${s}`, s)}
            </option>
          ))}
        </select>
        <button className="afrp-refresh-btn" onClick={() => fetchReports(page)}>
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="afrp-total">
        {t('forum.reports.totalResults', '{{count}} reports', { count: total })}
      </div>

      {/* Review modal */}
      {reviewModal && (
        <div className="afrp-modal-overlay">
          <div className="afrp-modal">
            <h3 className="afrp-modal-title">Преглед на сигнал</h3>

            <div className="afrp-modal-detail">
              <span className="afrp-detail-label">Причина:</span>
              <span className="afrp-detail-value afrp-reason-badge">
                {{ spam: '🚫 Спам', inappropriate: '⚠️ Неподходящо', harassment: '😡 Тормоз', misinformation: '❌ Дезинформация', other: '📝 Друго' }[reviewModal.reason] || reviewModal.reason}
              </span>
            </div>

            {reviewModal.description && (
              <div className="afrp-modal-detail">
                <span className="afrp-detail-label">Описание от подателя:</span>
                <span className="afrp-detail-value">{reviewModal.description}</span>
              </div>
            )}

            <div className="afrp-modal-detail">
              <span className="afrp-detail-label">Подател:</span>
              <span className="afrp-detail-value">
                {reviewModal.reporter?.details?.firstName} {reviewModal.reporter?.details?.lastName} ({reviewModal.reporter?.email})
              </span>
            </div>

            {/* Target content preview */}
            <div className="afrp-target-preview">
              <span className="afrp-detail-label">
                {reviewModal.targetType === 'post' ? 'Докладвана публикация:' : 'Докладван коментар:'}
              </span>
              {reviewModal.targetContent ? (
                <div className="afrp-target-box">
                  {reviewModal.targetType === 'post' ? (
                    <>
                      <strong>{reviewModal.targetContent.title}</strong>
                      <span className="afrp-target-author">от {reviewModal.targetContent.authorName} ({reviewModal.targetContent.authorEmail})</span>
                      <span className="afrp-target-status">Статус: {reviewModal.targetContent.status}</span>
                      <a href={`/academy/community/post/${reviewModal.targetContent.slug}`} target="_blank" rel="noopener noreferrer" className="afrp-target-link">Отвори публикацията →</a>
                    </>
                  ) : (
                    <>
                      <p className="afrp-target-text">"{reviewModal.targetContent.content}"</p>
                      <span className="afrp-target-author">от {reviewModal.targetContent.authorName} ({reviewModal.targetContent.authorEmail})</span>
                      <span className="afrp-target-status">Статус: {reviewModal.targetContent.status}</span>
                      {reviewModal.targetContent.postSlug && (
                        <a href={`/academy/community/post/${reviewModal.targetContent.postSlug}`} target="_blank" rel="noopener noreferrer" className="afrp-target-link">Отвори в публикацията "{reviewModal.targetContent.postTitle}" →</a>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <span className="afrp-detail-value">Съдържанието не е намерено (може да е изтрито)</span>
              )}
            </div>
            {/* Author current status */}
            {authorStatus && (
              <div className="afrp-author-status">
                <label className="afrp-label">Статус на автора</label>
                <div className="afrp-author-status-card">
                  <div className="afrp-as-row">
                    <span className="afrp-as-label">Роля:</span>
                    <span className={`afrp-as-badge ${authorStatus.forumStatus?.role === 'vip' ? 'afrp-as-vip' : ''}`}>
                      {authorStatus.forumStatus?.role?.toUpperCase() || 'USER'}
                    </span>
                  </div>
                  <div className="afrp-as-row">
                    <span className="afrp-as-label">Банат:</span>
                    <span className={authorStatus.forumStatus?.isBanned ? 'afrp-as-banned' : 'afrp-as-ok'}>
                      {authorStatus.forumStatus?.isBanned ? `Да (${authorStatus.forumStatus.banType})` : 'Не'}
                    </span>
                  </div>
                  <div className="afrp-as-row">
                    <span className="afrp-as-label">Предупреждения:</span>
                    <span>{authorStatus.forumStatus?.warningCount || 0}</span>
                  </div>
                  <div className="afrp-as-row">
                    <span className="afrp-as-label">Сигнали срещу:</span>
                    <span>{authorStatus.reportCount || 0}</span>
                  </div>
                  {authorStatus.forumStatus?.isBanned && (
                    <button className="afrp-punish-btn afrp-punish-unban" onClick={async () => {
                      try {
                        await forumService.adminUnbanUser(reviewModal.targetContent?.authorId);
                        toast.success('Наказанието е отменено');
                        openReviewModal(reviewModal);
                      } catch { toast.error('Грешка'); }
                    }}>
                      ✅ Отмени наказанието (Unban)
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="afrp-field">
              <label className="afrp-label">Действие върху сигнала</label>
              <select className="afrp-select afrp-modal-select" value={reviewAction} onChange={(e) => setReviewAction(e.target.value)}>
                <option value="reviewed">Само маркирай като прегледан</option>
                <option value="dismissed">Отхвърли (пренебрегни)</option>
              </select>
            </div>
            <div className="afrp-field">
              <label className="afrp-label">Бележка (незадължително)</label>
              <textarea className="afrp-textarea" value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} rows={2} placeholder="Причина за решението..." />
            </div>

            <div className="afrp-punish-section">
              <label className="afrp-label">Мерки срещу автора на съдържанието</label>
              <div className="afrp-punish-grid">
                <button className="afrp-punish-btn afrp-punish-hide" onClick={async () => {
                  try {
                    if (reviewModal.targetType === 'post') await forumService.adminUpdatePostStatus(reviewModal.targetId, { status: 'hidden' });
                    else await forumService.adminUpdateCommentStatus(reviewModal.targetId, { status: 'hidden' });
                    toast.success('Съдържанието е скрито');
                    fetchReports(page); openReviewModal(reviewModal);
                  } catch { toast.error('Грешка'); }
                }}>
                  <EyeOff size={14} /> Скрий съдържанието
                </button>
                <button className="afrp-punish-btn afrp-punish-warn" onClick={async () => {
                  try {
                    const authorId = reviewModal.targetContent?.authorId;
                    if (authorId) await forumService.adminWarnUser(authorId, { reason: `Сигнал: ${reviewModal.reason}` });
                    toast.success('Предупреждение изпратено');
                    openReviewModal(reviewModal);
                  } catch { toast.error('Грешка'); }
                }}>
                  ⚠️ Предупреди автора
                </button>
                <button className="afrp-punish-btn afrp-punish-mute" onClick={async () => {
                  try {
                    const authorId = reviewModal.targetContent?.authorId;
                    if (authorId) await forumService.adminMuteUser(authorId, { reason: `Сигнал: ${reviewModal.reason}`, duration: 3 });
                    toast.success('Автор заглушен за 3 дни');
                    openReviewModal(reviewModal);
                  } catch { toast.error('Грешка'); }
                }}>
                  🔇 Mute 3 дни
                </button>
                <button className="afrp-punish-btn afrp-punish-ban" onClick={async () => {
                  try {
                    const authorId = reviewModal.targetContent?.authorId;
                    if (authorId) await forumService.adminBanUser(authorId, { reason: `Сигнал: ${reviewModal.reason}`, duration: 7 });
                    toast.success('Автор банат за 7 дни');
                    openReviewModal(reviewModal);
                  } catch { toast.error('Грешка'); }
                }}>
                  🚫 Бан 7 дни
                </button>
                <button className="afrp-punish-btn afrp-punish-delete" onClick={async () => {
                  if (!window.confirm('Сигурни ли сте?')) return;
                  try {
                    if (reviewModal.targetType === 'post') await forumService.adminDeletePost(reviewModal.targetId);
                    else await forumService.adminDeleteComment(reviewModal.targetId);
                    toast.success('Съдържанието е изтрито');
                  } catch { toast.error('Грешка'); }
                }}>
                  🗑️ Изтрий съдържанието
                </button>
              </div>
            </div>

            <div className="afrp-modal-actions">
              <button className="afrp-cancel-btn" onClick={() => setReviewModal(null)}>Отказ</button>
              <button className="afrp-save-btn" onClick={handleReview}>Приложи решение</button>
            </div>
          </div>
        </div>
      )}

      <div className="afrp-table-wrap">
        <table className="afrp-table">
          <thead>
            <tr>
              <th>{t('forum.reports.reasonCol', 'Reason')}</th>
              <th>{t('forum.reports.reporter', 'Reporter')}</th>
              <th>{t('forum.reports.targetCol', 'Target')}</th>
              <th>{t('forum.reports.targetType', 'Type')}</th>
              <th>{t('forum.reports.statusCol', 'Status')}</th>
              <th>{t('forum.reports.dateCol', 'Date')}</th>
              <th>{t('forum.reports.actionsCol', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="afrp-loading-cell">
                  <div className="afrp-spinner"></div>
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan="7" className="afrp-empty-cell">
                  <Flag size={20} />
                  {t('forum.reports.noReports', 'No reports found')}
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id}>
                  <td className="afrp-td-reason">
                    <span className="afrp-reason-text">
                      {{ spam: '🚫 Спам', inappropriate: '⚠️ Неподходящо', harassment: '😡 Тормоз', misinformation: '❌ Дезинформация', other: '📝 Друго' }[report.reason] || report.reason}
                    </span>
                  </td>
                  <td className="afrp-td-reporter">
                    <span className="afrp-reporter-name">
                      {report.reporter?.details?.firstName || ''} {report.reporter?.details?.lastName || ''}
                    </span>
                  </td>
                  <td className="afrp-td-target">
                    <span className="afrp-target-text">
                      {report.targetContent
                        ? (report.targetType === 'post'
                          ? report.targetContent.title
                          : `"${(report.targetContent.content || '').substring(0, 60)}..."`)
                        : `#${report.targetId} (изтрито)`}
                    </span>
                  </td>
                  <td>
                    <span className="afrp-type-badge">{report.targetType || 'post'}</span>
                  </td>
                  <td>
                    <span className={`afd-badge afd-badge-${report.status}`}>{report.status}</span>
                  </td>
                  <td className="afrp-td-date">{formatDate(report.createdAt)}</td>
                  <td className="afrp-td-actions">
                    <button className="afrp-review-btn" onClick={() => openReviewModal(report)} title="Прегледай">
                      <Eye size={14} /> Прегледай
                    </button>
                    {report.status === 'pending' && (
                      <button className="afrp-dismiss-btn" onClick={async () => {
                        try {
                          await forumService.adminReviewReport(report.id, { status: 'dismissed', note: '' });
                          toast.success('Сигналът е отхвърлен');
                          fetchReports(page);
                        } catch { toast.error('Грешка'); }
                      }} title="Отхвърли">
                        <X size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="afrp-pagination">
          <button className="afrp-page-btn" onClick={() => fetchReports(page - 1)} disabled={page <= 1}>
            <ChevronLeft size={16} />
          </button>
          <span className="afrp-page-info">{page} / {totalPages}</span>
          <button className="afrp-page-btn" onClick={() => fetchReports(page + 1)} disabled={page >= totalPages}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminForumReports;
