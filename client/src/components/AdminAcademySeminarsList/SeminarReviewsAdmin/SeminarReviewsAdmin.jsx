import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { toast } from 'react-toastify';
import { ArrowLeft, Check, Trash2, Star } from 'lucide-react';
import './seminarReviewsAdmin.css';

const SeminarReviewsAdmin = () => {
    const { t } = useTranslation('academy-admin');
    const navigate = useLocalizedNavigate();
    const { getAdminSeminarReviews, approveSeminarReview, deleteSeminarReview } = useAcademyCourses();

    const [reviews, setReviews] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [isLoading, setIsLoading] = useState(true);
    const [actionId, setActionId] = useState(null);

    const loadReviews = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAdminSeminarReviews(filter === 'all' ? '' : filter);
            setReviews(data?.reviews || []);
        } catch (err) {
            console.error('Error loading reviews:', err);
        } finally {
            setIsLoading(false);
        }
    }, [filter, getAdminSeminarReviews]);

    useEffect(() => { loadReviews(); }, [loadReviews]);

    const handleApprove = async (reviewId) => {
        setActionId(reviewId);
        try {
            await approveSeminarReview(reviewId);
            toast.success(t('seminarReviews.approvedSuccess', 'Отзивът е одобрен'));
            await loadReviews();
        } catch (err) {
            toast.error(t('seminarReviews.approveError', 'Грешка при одобряване'));
        } finally {
            setActionId(null);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm(t('seminarReviews.confirmDelete', 'Сигурни ли сте, че искате да изтриете този отзив?'))) return;
        setActionId(reviewId);
        try {
            await deleteSeminarReview(reviewId);
            toast.success(t('seminarReviews.deletedSuccess', 'Отзивът е изтрит'));
            await loadReviews();
        } catch (err) {
            toast.error(t('seminarReviews.deleteError', 'Грешка при изтриване'));
        } finally {
            setActionId(null);
        }
    };

    return (
        <div className="sra-page">
        <div className="sra-container">
            <div className="sra-header">
                <button className="sra-back" onClick={() => navigate('/academy/admin/seminars')}>
                    <ArrowLeft size={18} />
                    {t('seminarReviews.back', 'Към семинари')}
                </button>
                <h1 className="sra-title">
                    {t('seminarReviews.title', 'Отзиви за')}{' '}
                    <span>{t('seminarReviews.titleAccent', 'семинари')}</span>
                </h1>
            </div>

            <div className="sra-filters">
                {['pending', 'approved', 'all'].map(f => (
                    <button
                        key={f}
                        className={`sra-filter-btn ${filter === f ? 'sra-filter-active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'pending' ? t('seminarReviews.pending', 'Чакащи') :
                         f === 'approved' ? t('seminarReviews.approved', 'Одобрени') :
                         t('seminarReviews.all', 'Всички')}
                        {f === 'pending' && reviews.length > 0 && filter === 'pending' && (
                            <span className="sra-filter-badge">{reviews.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="sra-loading">{t('seminarReviews.loading', 'Зареждане...')}</div>
            ) : reviews.length === 0 ? (
                <div className="sra-empty">
                    <Star size={32} />
                    <p>{t('seminarReviews.noReviews', 'Няма отзиви')}</p>
                </div>
            ) : (
                <div className="sra-list">
                    {reviews.map(r => (
                        <div key={r.id} className={`sra-card sra-card-${r.status}`}>
                            <div className="sra-card-header">
                                <div className="sra-card-author">
                                    {r.author?.avatar ? (
                                        <img src={r.author.avatar} alt="" className="sra-avatar" />
                                    ) : (
                                        <div className="sra-avatar-placeholder">{(r.author?.name || '?')[0]}</div>
                                    )}
                                    <div className="sra-author-info">
                                        <span className="sra-author-name">{r.author?.name || 'Unknown'}</span>
                                        <span className="sra-author-email">{r.author?.email || ''}</span>
                                    </div>
                                </div>
                                <div className="sra-card-stars">
                                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                </div>
                            </div>

                            <div className="sra-card-seminar">
                                {t('seminarReviews.forSeminar', 'За семинар')}: <strong>{r.seminarTitle}</strong>
                            </div>

                            {r.comment && <p className="sra-card-comment">{r.comment}</p>}

                            <div className="sra-card-footer">
                                <span className="sra-card-date">{new Date(r.createdAt).toLocaleDateString('bg-BG')}</span>
                                <span className={`sra-status-badge sra-status-${r.status}`}>
                                    {r.status === 'pending' ? t('seminarReviews.statusPending', 'Чакащ') :
                                     r.status === 'approved' ? t('seminarReviews.statusApproved', 'Одобрен') : r.status}
                                </span>
                                <div className="sra-card-actions">
                                    {r.status === 'pending' && (
                                        <button
                                            className="sra-btn sra-btn-approve"
                                            onClick={() => handleApprove(r.id)}
                                            disabled={actionId === r.id}
                                            title={t('seminarReviews.approve', 'Одобри')}
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                    <button
                                        className="sra-btn sra-btn-delete"
                                        onClick={() => handleDelete(r.id)}
                                        disabled={actionId === r.id}
                                        title={t('seminarReviews.delete', 'Изтрий')}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        </div>
    );
};

export default SeminarReviewsAdmin;
