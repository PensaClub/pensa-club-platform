// src/components/SeminarCreateForm/SeminarSettings/ExternalLecturerModal/ExternalLecturerModal.jsx
// Prefix: elm-

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { X, Save, Globe, Loader } from 'lucide-react';
import { useAcademyCourses } from '../../../contexts/AcademyCoursesProvider';
import './externalLecturerModal.css';

const EMPTY_FORM = {
    name: '',
    email: '',
    phone: '',
    organization: '',
    bio: '',
};

const ExternalLecturerModal = ({ isOpen, onClose, onSelect }) => {
    const { t } = useTranslation('academy-admin');
    const { getExternalLecturers, createExternalLecturer } = useAcademyCourses();

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const debounceRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setForm(EMPTY_FORM);
            setErrors({});
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [isOpen]);

    // Esc to close
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    // Click outside suggestion list closes it
    useEffect(() => {
        const onClick = (e) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const runSuggest = useCallback(async (q) => {
        if (!q || q.trim().length < 2) {
            setSuggestions([]);
            return;
        }
        setIsSearching(true);
        try {
            const list = await getExternalLecturers(q.trim());
            setSuggestions(Array.isArray(list) ? list.slice(0, 6) : []);
        } catch (err) {
            console.error('Error loading external lecturers:', err);
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    }, [getExternalLecturers]);

    const handleNameChange = (e) => {
        const val = e.target.value;
        setForm(prev => ({ ...prev, name: val }));
        setShowSuggestions(true);
        if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => runSuggest(val), 300);
    };

    const handleFieldChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const handlePickSuggestion = (lecturer) => {
        setShowSuggestions(false);
        onSelect(lecturer);
    };

    const validate = () => {
        const next = {};
        if (!form.name.trim()) {
            next.name = t('externalLecturerModal.errors.nameRequired', 'Името е задължително');
        } else if (form.name.trim().length < 2) {
            next.name = t('externalLecturerModal.errors.nameMin', 'Минимум 2 символа');
        }
        if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            next.email = t('externalLecturerModal.errors.emailInvalid', 'Невалиден имейл');
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                email: form.email.trim() || null,
                phone: form.phone.trim() || null,
                organization: form.organization.trim() || null,
                bio: form.bio.trim() || null,
            };
            const lecturer = await createExternalLecturer(payload);
            if (lecturer) {
                toast.success(t('externalLecturerModal.created', 'Външният лектор е създаден'));
                onSelect(lecturer);
            } else {
                toast.error(t('externalLecturerModal.errors.createFailed', 'Грешка при създаване'));
            }
        } catch (err) {
            console.error('Error creating external lecturer:', err);
            toast.error(err?.errors?.[0] || t('externalLecturerModal.errors.createFailed', 'Грешка при създаване'));
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="elm-overlay" onClick={onClose}>
            <div className="elm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="elm-header">
                    <div className="elm-header-title">
                        <Globe size={20} />
                        <h2>{t('externalLecturerModal.title', 'Външен лектор')}</h2>
                    </div>
                    <button type="button" className="elm-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <p className="elm-subtitle">
                    {t('externalLecturerModal.subtitle', 'Добави нов външен лектор или избери от съществуващите.')}
                </p>

                <form className="elm-form" onSubmit={handleSubmit}>
                    <div className={`elm-field ${errors.name ? 'elm-field-error' : ''}`} ref={suggestionsRef}>
                        <label className="elm-label" htmlFor="elm-name">
                            {t('externalLecturerModal.name', 'Име')} <span className="elm-required">*</span>
                        </label>
                        <input
                            id="elm-name"
                            type="text"
                            className="elm-input"
                            value={form.name}
                            onChange={handleNameChange}
                            onFocus={() => form.name && setShowSuggestions(true)}
                            placeholder={t('externalLecturerModal.namePlaceholder', 'Иван Иванов')}
                            autoComplete="off"
                        />
                        {errors.name && <span className="elm-error">{errors.name}</span>}

                        {showSuggestions && (suggestions.length > 0 || isSearching) && (
                            <div className="elm-suggestions">
                                <div className="elm-suggestions-title">
                                    {t('externalLecturerModal.existingMatches', 'Съществуващи лектори:')}
                                </div>
                                {isSearching && (
                                    <div className="elm-suggestion-loading">
                                        <Loader size={14} className="elm-spin" />
                                    </div>
                                )}
                                {suggestions.map((lect) => (
                                    <button
                                        key={lect.id}
                                        type="button"
                                        className="elm-suggestion-item"
                                        onClick={() => handlePickSuggestion(lect)}
                                    >
                                        <div className="elm-suggestion-info">
                                            <span className="elm-suggestion-name">{lect.name}</span>
                                            {(lect.organization || lect.email) && (
                                                <span className="elm-suggestion-sub">
                                                    {lect.organization || lect.email}
                                                </span>
                                            )}
                                        </div>
                                        {lect.timesUsed > 0 && (
                                            <span className="elm-suggestion-badge">
                                                {t('externalLecturerModal.timesUsed', { count: lect.timesUsed, defaultValue: '{{count}}× ползван' })}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="elm-row">
                        <div className={`elm-field ${errors.email ? 'elm-field-error' : ''}`}>
                            <label className="elm-label" htmlFor="elm-email">
                                {t('externalLecturerModal.email', 'Имейл')}
                            </label>
                            <input
                                id="elm-email"
                                type="email"
                                className="elm-input"
                                value={form.email}
                                onChange={handleFieldChange('email')}
                                placeholder="ivan@example.com"
                                autoComplete="off"
                            />
                            {errors.email && <span className="elm-error">{errors.email}</span>}
                        </div>

                        <div className="elm-field">
                            <label className="elm-label" htmlFor="elm-phone">
                                {t('externalLecturerModal.phone', 'Телефон')}
                            </label>
                            <input
                                id="elm-phone"
                                type="tel"
                                className="elm-input"
                                value={form.phone}
                                onChange={handleFieldChange('phone')}
                                placeholder="+359..."
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className="elm-field">
                        <label className="elm-label" htmlFor="elm-org">
                            {t('externalLecturerModal.organization', 'Организация')}
                        </label>
                        <input
                            id="elm-org"
                            type="text"
                            className="elm-input"
                            value={form.organization}
                            onChange={handleFieldChange('organization')}
                            placeholder={t('externalLecturerModal.organizationPlaceholder', 'Университет, фирма...')}
                            autoComplete="off"
                        />
                    </div>

                    <div className="elm-field">
                        <label className="elm-label" htmlFor="elm-bio">
                            {t('externalLecturerModal.bio', 'Кратка биография')}
                        </label>
                        <textarea
                            id="elm-bio"
                            className="elm-textarea"
                            value={form.bio}
                            onChange={handleFieldChange('bio')}
                            placeholder={t('externalLecturerModal.bioPlaceholder', 'Опит, специализация, постижения...')}
                            rows={4}
                        />
                    </div>

                    <div className="elm-footer">
                        <button type="button" className="elm-btn elm-btn-cancel" onClick={onClose} disabled={isSaving}>
                            {t('externalLecturerModal.cancel', 'Отказ')}
                        </button>
                        <button type="submit" className="elm-btn elm-btn-save" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader size={16} className="elm-spin" />
                                    {t('externalLecturerModal.saving', 'Запазване...')}
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    {t('externalLecturerModal.save', 'Запази и добави')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExternalLecturerModal;
