import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useReAction } from '../contexts/ReActionProvider';
import './reActionMy.css';

const statusColors = {
    new: '#d97706',
    reviewing: '#3b82f6',
    mentor_assigned: '#7c3aed',
    confirmed: '#16a34a',
    completed: '#6b7280',
    cancelled: '#dc2626',
};

const ReActionMy = () => {
    const { t } = useTranslation('reaction');
    const { getMyRequests, cancelMyRequest } = useReAction();

    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState({ total: 0, completed: 0, cancelled: 0, active: 0 });
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getMyRequests();
            setRequests(res?.requests || []);
            setStats(res?.stats || { total: 0, completed: 0, cancelled: 0, active: 0 });
        } catch {
            // handled in context
        } finally {
            setLoading(false);
        }
    }, [getMyRequests]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCancel = async (id) => {
        setCancellingId(id);
        try {
            await cancelMyRequest(id, { cancelReason: cancelReason || undefined });
            setShowCancelModal(null);
            setCancelReason('');
            fetchData();
        } catch {
            // handled in context
        } finally {
            setCancellingId(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('bg-BG', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const canCancel = (status) => ['new', 'reviewing', 'mentor_assigned'].includes(status);

    // Split requests into categories
    const upcoming = requests.filter(
        (r) => ['confirmed', 'mentor_assigned'].includes(r.status) && new Date(r.preferredDate) >= new Date(new Date().toDateString())
    );
    const active = requests.filter((r) => ['new', 'reviewing'].includes(r.status));
    const history = requests.filter((r) => ['completed', 'cancelled'].includes(r.status));

    if (loading) {
        return (
            <div className="ram">
                <div className="ram-container">
                    <div className="ram-loading">{t('my.loading')}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="ram">
            <div className="ram-container">
                {/* HEADER */}
                <div className="ram-header">
                    <h1 className="ram-title">{t('my.title')}</h1>
                    <p className="ram-subtitle">{t('my.subtitle')}</p>
                </div>

                {/* STATS */}
                <div className="ram-stats">
                    <div className="ram-stat">
                        <span className="ram-stat-number">{stats.total}</span>
                        <span className="ram-stat-label">{t('my.statsTotal')}</span>
                    </div>
                    <div className="ram-stat-divider" />
                    <div className="ram-stat">
                        <span className="ram-stat-number ram-stat-number--active">{stats.active}</span>
                        <span className="ram-stat-label">{t('my.statsActive')}</span>
                    </div>
                    <div className="ram-stat-divider" />
                    <div className="ram-stat">
                        <span className="ram-stat-number ram-stat-number--completed">{stats.completed}</span>
                        <span className="ram-stat-label">{t('my.statsCompleted')}</span>
                    </div>
                    <div className="ram-stat-divider" />
                    <div className="ram-stat">
                        <span className="ram-stat-number ram-stat-number--cancelled">{stats.cancelled}</span>
                        <span className="ram-stat-label">{t('my.statsCancelled')}</span>
                    </div>
                </div>

                {requests.length === 0 ? (
                    <div className="ram-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="ram-empty-icon">
                            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                            <rect x="9" y="3" width="6" height="4" rx="1" />
                        </svg>
                        <p className="ram-empty-text">{t('my.empty')}</p>
                        <Link to="/reaction" className="ram-btn ram-btn--primary">
                            {t('my.submitRequest')}
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* UPCOMING VISITS */}
                        {upcoming.length > 0 && (
                            <div className="ram-section">
                                <h2 className="ram-section-title">{t('my.upcoming')}</h2>
                                <div className="ram-cards">
                                    {upcoming.map((req) => (
                                        <div key={req.id} className="ram-card ram-card--upcoming">
                                            <div className="ram-card-header">
                                                <span className="ram-card-status" style={{ background: statusColors[req.status] }}>
                                                    {t(`my.statuses.${req.status}`)}
                                                </span>
                                                <span className="ram-card-code">{req.trackingCode}</span>
                                            </div>
                                            <h3 className="ram-card-club">{req.clubName}</h3>
                                            <div className="ram-card-details">
                                                <span>{req.city}</span>
                                                <span>{formatDate(req.preferredDate)}</span>
                                            </div>
                                            {req.assignedMentor && (
                                                <div className="ram-card-mentor">
                                                    {t('my.mentor')}: {req.assignedMentor.name}
                                                </div>
                                            )}
                                            {canCancel(req.status) && (
                                                <button
                                                    className="ram-btn ram-btn--cancel"
                                                    onClick={() => setShowCancelModal(req.id)}
                                                >
                                                    {t('my.cancel')}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ACTIVE REQUESTS */}
                        {active.length > 0 && (
                            <div className="ram-section">
                                <h2 className="ram-section-title">{t('my.activeRequests')}</h2>
                                <div className="ram-cards">
                                    {active.map((req) => (
                                        <div key={req.id} className="ram-card">
                                            <div className="ram-card-header">
                                                <span className="ram-card-status" style={{ background: statusColors[req.status] }}>
                                                    {t(`my.statuses.${req.status}`)}
                                                </span>
                                                <span className="ram-card-code">{req.trackingCode}</span>
                                            </div>
                                            <h3 className="ram-card-club">{req.clubName}</h3>
                                            <div className="ram-card-details">
                                                <span>{req.city}</span>
                                                <span>{formatDate(req.preferredDate)}</span>
                                            </div>
                                            <button
                                                className="ram-btn ram-btn--cancel"
                                                onClick={() => setShowCancelModal(req.id)}
                                            >
                                                {t('my.cancel')}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* HISTORY */}
                        {history.length > 0 && (
                            <div className="ram-section">
                                <h2 className="ram-section-title">{t('my.history')}</h2>
                                <div className="ram-cards">
                                    {history.map((req) => (
                                        <div key={req.id} className="ram-card ram-card--history">
                                            <div className="ram-card-header">
                                                <span className="ram-card-status" style={{ background: statusColors[req.status] }}>
                                                    {t(`my.statuses.${req.status}`)}
                                                </span>
                                                <span className="ram-card-code">{req.trackingCode}</span>
                                            </div>
                                            <h3 className="ram-card-club">{req.clubName}</h3>
                                            <div className="ram-card-details">
                                                <span>{req.city}</span>
                                                <span>{formatDate(req.preferredDate)}</span>
                                            </div>
                                            {req.cancelReason && (
                                                <div className="ram-card-cancel-reason">
                                                    {t('my.cancelReason')}: {req.cancelReason}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ACTIONS */}
                <div className="ram-actions">
                    <Link to="/reaction" className="ram-btn ram-btn--primary">
                        {t('my.submitRequest')}
                    </Link>
                    <Link to="/profile" className="ram-btn ram-btn--secondary">
                        {t('my.backToProfile')}
                    </Link>
                </div>
            </div>

            {/* CANCEL MODAL */}
            {showCancelModal && (
                <div className="ram-modal-overlay" onClick={() => setShowCancelModal(null)}>
                    <div className="ram-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="ram-modal-title">{t('my.cancelTitle')}</h3>
                        <p className="ram-modal-text">{t('my.cancelConfirm')}</p>
                        <textarea
                            className="ram-modal-textarea"
                            placeholder={t('my.cancelReasonPlaceholder')}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            rows={3}
                        />
                        <div className="ram-modal-actions">
                            <button
                                className="ram-btn ram-btn--secondary"
                                onClick={() => { setShowCancelModal(null); setCancelReason(''); }}
                            >
                                {t('my.cancelBack')}
                            </button>
                            <button
                                className="ram-btn ram-btn--danger"
                                onClick={() => handleCancel(showCancelModal)}
                                disabled={cancellingId === showCancelModal}
                            >
                                {cancellingId === showCancelModal ? '...' : t('my.cancelConfirmBtn')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReActionMy;
