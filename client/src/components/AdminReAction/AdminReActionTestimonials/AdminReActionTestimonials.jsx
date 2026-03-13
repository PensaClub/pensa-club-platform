// src/components/AdminReAction/AdminReActionTestimonials/AdminReActionTestimonials.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './adminReActionTestimonials.css';
import { useReAction } from '../../contexts/ReActionProvider';

export const AdminReActionTestimonials = ({ onRefresh }) => {
    const { t } = useTranslation('reaction');
    const { getAdminTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } = useReAction();

    const [testimonials, setTestimonials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form state
    const [formClubName, setFormClubName] = useState('');
    const [formCity, setFormCity] = useState('');
    const [formQuote, setFormQuote] = useState('');
    const [formAuthorName, setFormAuthorName] = useState('');
    const [formIsApproved, setFormIsApproved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // ===================================
    // FETCH TESTIMONIALS
    // ===================================

    const fetchTestimonials = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getAdminTestimonials();
            setTestimonials(res?.testimonials || []);
        } catch (error) {
            console.error('Error fetching testimonials:', error);
        } finally {
            setIsLoading(false);
        }
    }, [getAdminTestimonials]);

    useEffect(() => {
        fetchTestimonials();
    }, [fetchTestimonials]);

    // ===================================
    // TRUNCATE
    // ===================================

    const truncate = (text, maxLength = 80) => {
        if (!text) return '-';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // ===================================
    // FORM HANDLERS
    // ===================================

    const resetForm = () => {
        setFormClubName('');
        setFormCity('');
        setFormQuote('');
        setFormAuthorName('');
        setFormIsApproved(false);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (testimonial) => {
        setFormClubName(testimonial.clubName || '');
        setFormCity(testimonial.city || '');
        setFormQuote(testimonial.quote || '');
        setFormAuthorName(testimonial.authorName || '');
        setFormIsApproved(testimonial.isApproved || false);
        setEditingId(testimonial.id);
        setShowForm(true);
    };

    const handleSubmit = async () => {
        if (!formQuote.trim() || !formClubName.trim()) return;

        setIsSaving(true);
        try {
            const data = {
                clubName: formClubName.trim(),
                city: formCity.trim(),
                quote: formQuote.trim(),
                authorName: formAuthorName.trim(),
                isApproved: formIsApproved,
            };

            if (editingId) {
                await updateTestimonial(editingId, data);
            } else {
                await createTestimonial(data);
            }

            resetForm();
            fetchTestimonials();
            onRefresh();
        } catch (error) {
            console.error('Error saving testimonial:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('admin.testimonials.confirmDelete'))) return;
        try {
            await deleteTestimonial(id);
            fetchTestimonials();
            onRefresh();
        } catch (error) {
            console.error('Error deleting testimonial:', error);
        }
    };

    const handleToggleApproval = async (testimonial) => {
        try {
            await updateTestimonial(testimonial.id, {
                isApproved: !testimonial.isApproved,
            });
            fetchTestimonials();
        } catch (error) {
            console.error('Error toggling approval:', error);
        }
    };

    // ===================================
    // RENDER
    // ===================================

    return (
        <div className="arat">
            {/* HEADER */}
            <div className="arat-header">
                <h2 className="arat-title">{t('admin.testimonials.title')}</h2>
                <button
                    className="arat-add-btn"
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    {t('admin.testimonials.add')}
                </button>
            </div>

            {/* ADD/EDIT FORM */}
            {showForm && (
                <div className="arat-form">
                    <h3 className="arat-form-title">
                        {editingId ? t('admin.testimonials.editTitle') : t('admin.testimonials.addTitle')}
                    </h3>
                    <div className="arat-form-grid">
                        <div className="arat-form-field">
                            <label className="arat-form-label">{t('admin.testimonials.clubName')}</label>
                            <input
                                type="text"
                                className="arat-form-input"
                                value={formClubName}
                                onChange={(e) => setFormClubName(e.target.value)}
                                placeholder={t('admin.testimonials.clubNamePlaceholder')}
                            />
                        </div>
                        <div className="arat-form-field">
                            <label className="arat-form-label">{t('admin.testimonials.city')}</label>
                            <input
                                type="text"
                                className="arat-form-input"
                                value={formCity}
                                onChange={(e) => setFormCity(e.target.value)}
                                placeholder={t('admin.testimonials.cityPlaceholder')}
                            />
                        </div>
                        <div className="arat-form-field">
                            <label className="arat-form-label">{t('admin.testimonials.authorName')}</label>
                            <input
                                type="text"
                                className="arat-form-input"
                                value={formAuthorName}
                                onChange={(e) => setFormAuthorName(e.target.value)}
                                placeholder={t('admin.testimonials.authorNamePlaceholder')}
                            />
                        </div>
                    </div>
                    <div className="arat-form-field">
                        <label className="arat-form-label">{t('admin.testimonials.quote')}</label>
                        <textarea
                            className="arat-form-textarea"
                            value={formQuote}
                            onChange={(e) => setFormQuote(e.target.value)}
                            placeholder={t('admin.testimonials.quotePlaceholder')}
                            rows="4"
                        />
                    </div>
                    <div className="arat-form-field arat-form-field--inline">
                        <label className="arat-form-checkbox-label">
                            <input
                                type="checkbox"
                                className="arat-form-checkbox"
                                checked={formIsApproved}
                                onChange={(e) => setFormIsApproved(e.target.checked)}
                            />
                            {t('admin.testimonials.approved')}
                        </label>
                    </div>
                    <div className="arat-form-actions">
                        <button className="arat-form-cancel" onClick={resetForm}>
                            {t('admin.testimonials.cancel')}
                        </button>
                        <button
                            className="arat-form-save"
                            onClick={handleSubmit}
                            disabled={isSaving || !formQuote.trim() || !formClubName.trim()}
                        >
                            {isSaving ? '...' : t('admin.testimonials.save')}
                        </button>
                    </div>
                </div>
            )}

            {/* TABLE (desktop) */}
            {isLoading ? (
                <div className="arat-loading">
                    <div className="arat-spinner"></div>
                </div>
            ) : testimonials.length > 0 ? (
                <>
                    <div className="arat-table-wrapper">
                        <table className="arat-table">
                            <thead>
                                <tr>
                                    <th>{t('admin.testimonials.colClub')}</th>
                                    <th>{t('admin.testimonials.colCity')}</th>
                                    <th>{t('admin.testimonials.colQuote')}</th>
                                    <th>{t('admin.testimonials.colAuthor')}</th>
                                    <th>{t('admin.testimonials.colStatus')}</th>
                                    <th>{t('admin.testimonials.colActions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {testimonials.map((item) => (
                                    <tr key={item.id} className="arat-row">
                                        <td className="arat-cell-club">{item.clubName}</td>
                                        <td className="arat-cell-city">{item.city || '-'}</td>
                                        <td className="arat-cell-quote">{truncate(item.quote)}</td>
                                        <td className="arat-cell-author">{item.authorName || '-'}</td>
                                        <td>
                                            <span
                                                className={`arat-approval-badge ${item.isApproved ? 'arat-approval-badge--approved' : 'arat-approval-badge--pending'}`}
                                            >
                                                {item.isApproved
                                                    ? t('admin.testimonials.statusApproved')
                                                    : t('admin.testimonials.statusPending')}
                                            </span>
                                        </td>
                                        <td className="arat-cell-actions">
                                            <button
                                                className={`arat-action-btn ${item.isApproved ? 'arat-action-btn--reject' : 'arat-action-btn--approve'}`}
                                                onClick={() => handleToggleApproval(item)}
                                                title={item.isApproved ? t('admin.testimonials.reject') : t('admin.testimonials.approve')}
                                            >
                                                {item.isApproved ? (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="18" y1="6" x2="6" y2="18" />
                                                        <line x1="6" y1="6" x2="18" y2="18" />
                                                    </svg>
                                                ) : (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                            </button>
                                            <button
                                                className="arat-action-btn arat-action-btn--edit"
                                                onClick={() => handleEdit(item)}
                                                title={t('admin.testimonials.edit')}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button
                                                className="arat-action-btn arat-action-btn--delete"
                                                onClick={() => handleDelete(item.id)}
                                                title={t('admin.testimonials.delete')}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE CARDS */}
                    <div className="arat-cards">
                        {testimonials.map((item) => (
                            <div key={item.id} className="arat-card">
                                <div className="arat-card-header">
                                    <span className="arat-card-club">{item.clubName}</span>
                                    <span
                                        className={`arat-approval-badge ${item.isApproved ? 'arat-approval-badge--approved' : 'arat-approval-badge--pending'}`}
                                    >
                                        {item.isApproved
                                            ? t('admin.testimonials.statusApproved')
                                            : t('admin.testimonials.statusPending')}
                                    </span>
                                </div>
                                {item.city && <div className="arat-card-city">{item.city}</div>}
                                <div className="arat-card-quote">"{truncate(item.quote, 120)}"</div>
                                {item.authorName && (
                                    <div className="arat-card-author">— {item.authorName}</div>
                                )}
                                <div className="arat-card-actions">
                                    <button
                                        className={`arat-action-btn ${item.isApproved ? 'arat-action-btn--reject' : 'arat-action-btn--approve'}`}
                                        onClick={() => handleToggleApproval(item)}
                                    >
                                        {item.isApproved ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </button>
                                    <button
                                        className="arat-action-btn arat-action-btn--edit"
                                        onClick={() => handleEdit(item)}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    <button
                                        className="arat-action-btn arat-action-btn--delete"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="arat-empty">
                    <div className="arat-empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <h3>{t('admin.testimonials.empty')}</h3>
                </div>
            )}
        </div>
    );
};
