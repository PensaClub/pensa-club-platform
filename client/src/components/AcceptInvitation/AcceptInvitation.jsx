// src/components/AcceptInvitation/AcceptInvitation.jsx
// Prefix: aci-

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LocalizedLink as Link } from '../LocalizedLink/LocalizedLink';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { useAuthContext } from '../contexts/UserContext';
import { toast } from 'react-toastify';
import {
    Loader2, Eye, EyeOff, CheckCircle, AlertCircle, Phone, Mail,
    Home, Clock, BookOpen,
} from 'lucide-react';
import './acceptInvitation.css';

const CONTACT_PHONE = '+359 89 579 4214';
const CONTACT_EMAIL = 'pensa.club@gmail.com';

const AcceptInvitation = () => {
    const { t } = useTranslation('acceptInvitation');
    const { getInvitation, acceptInvitation } = useAuthContext();
    const navigate = useLocalizedNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    // States
    const [loading, setLoading] = useState(true);
    const [invitationData, setInvitationData] = useState(null);
    const [error, setError] = useState(null);

    // Form
    const [newPassword, setNewPassword] = useState('');
    const [reNewPassword, setReNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    // Validate invitation on mount
    useEffect(() => {
        if (!token) {
            setError('missing');
            setLoading(false);
            return;
        }
        (async () => {
            try {
                const data = await getInvitation(token);
                setInvitationData(data);
            } catch (err) {
                const msg = err?.response?.data?.message || err?.message || '';
                if (msg.toLowerCase().includes('expired')) {
                    setError('expired');
                } else {
                    setError('invalid');
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    const formatDate = (isoStr) => {
        if (!isoStr) return '—';
        try {
            return new Date(isoStr).toLocaleString('bg-BG', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });
        } catch {
            return isoStr;
        }
    };

    const validateForm = () => {
        if (!newPassword || newPassword.length < 8) {
            setFormError(t('errors.passwordTooShort', 'Паролата трябва да е поне 8 символа.'));
            return false;
        }
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword)) {
            setFormError(t('errors.passwordWeak', 'Паролата трябва да съдържа поне една буква и една цифра.'));
            return false;
        }
        if (newPassword !== reNewPassword) {
            setFormError(t('errors.passwordMismatch', 'Паролите не съвпадат.'));
            return false;
        }
        if (!agreeTerms) {
            setFormError(t('errors.termsRequired', 'Трябва да приемете условията за ползване.'));
            return false;
        }
        setFormError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSubmitting(true);
        try {
            await acceptInvitation({ token, newPassword, reNewPassword });
            toast.success(t('form.success', 'Регистрацията е успешна! Добре дошли в Pensa Club.'));
            navigate('/');
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || t('errors.generic', 'Грешка при приемане на поканата.');
            setFormError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================
    //                    RENDER
    // =========================================================

    // Loading state
    if (loading) {
        return (
            <div className="aci-wrapper">
                <div className="aci-card aci-card-center">
                    <Loader2 size={48} className="aci-spin aci-loading-icon" />
                    <p className="aci-loading-text">{t('loading', 'Проверка на поканата...')}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="aci-wrapper">
                <div className="aci-card aci-card-error">
                    <div className="aci-error-icon">
                        <AlertCircle size={48} />
                    </div>
                    <h2 className="aci-title">
                        {error === 'expired'
                            ? t('error.expiredTitle', 'Линкът вече не е валиден')
                            : error === 'missing'
                                ? t('error.missingTitle', 'Липсва линк за регистрация')
                                : t('error.invalidTitle', 'Невалиден линк')}
                    </h2>
                    <p className="aci-description">
                        {error === 'expired'
                            ? t('error.expiredText', 'Този линк за регистрация е изтекъл. Моля свържете се с нас, за да получите нов.')
                            : error === 'missing'
                                ? t('error.missingText', 'Линкът за регистрация липсва. Моля използвайте линка от имейла, който получихте.')
                                : t('error.invalidText', 'Този линк за регистрация е невалиден или вече е използван.')}
                    </p>
                    <div className="aci-contact-box">
                        <h3 className="aci-contact-title">{t('error.contactTitle', 'Свържете се с нас:')}</h3>
                        <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="aci-contact-link">
                            <Phone size={16} />
                            <span>{CONTACT_PHONE}</span>
                        </a>
                        <a href={`mailto:${CONTACT_EMAIL}`} className="aci-contact-link">
                            <Mail size={16} />
                            <span>{CONTACT_EMAIL}</span>
                        </a>
                    </div>
                    <Link to="/" className="aci-btn aci-btn-secondary">
                        <Home size={16} />
                        <span>{t('error.backHome', 'Към началната страница')}</span>
                    </Link>
                </div>
            </div>
        );
    }

    // Success state — form
    return (
        <div className="aci-wrapper">
            <div className="aci-card">
                <div className="aci-header">
                    <img src="/images/homePage/logo.png" alt="Pensa Club" className="aci-logo" />
                    <h1 className="aci-brand">Pensa Club</h1>
                    <p className="aci-brand-subtitle">{t('header.subtitle', 'DigiBridge Academy')}</p>
                </div>

                <div className="aci-welcome">
                    <h2 className="aci-title">
                        {t('welcome.hello', 'Здравейте')}, {invitationData?.firstName} {invitationData?.lastName}!
                    </h2>
                    {invitationData?.seminarTitle && (
                        <p className="aci-seminar-info">
                            <BookOpen size={14} />
                            <span>
                                {t('welcome.thankYou', 'Благодарим Ви за участието в семинар')}{' '}
                                <strong>{invitationData.seminarTitle}</strong>
                            </span>
                        </p>
                    )}
                    <p className="aci-description">
                        {t('welcome.instruction', 'За да завършите регистрацията си в Pensa Club, моля изберете парола:')}
                    </p>
                </div>

                <form className="aci-form" onSubmit={handleSubmit}>
                    <div className="aci-form-group">
                        <label className="aci-label">{t('form.email', 'Имейл')}</label>
                        <input
                            type="email"
                            className="aci-input aci-input-readonly"
                            value={invitationData?.email || ''}
                            readOnly
                            disabled
                        />
                    </div>

                    <div className="aci-form-group">
                        <label className="aci-label" htmlFor="aci-newPassword">
                            {t('form.password', 'Парола')}
                        </label>
                        <div className="aci-input-wrap">
                            <input
                                id="aci-newPassword"
                                type={showPassword ? 'text' : 'password'}
                                className="aci-input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder={t('form.passwordPlaceholder', 'Минимум 8 символа, буква + цифра')}
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                className="aci-toggle-pass"
                                onClick={() => setShowPassword((s) => !s)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="aci-form-group">
                        <label className="aci-label" htmlFor="aci-reNewPassword">
                            {t('form.repeatPassword', 'Повторете паролата')}
                        </label>
                        <div className="aci-input-wrap">
                            <input
                                id="aci-reNewPassword"
                                type={showRePassword ? 'text' : 'password'}
                                className="aci-input"
                                value={reNewPassword}
                                onChange={(e) => setReNewPassword(e.target.value)}
                                placeholder={t('form.repeatPasswordPlaceholder', 'Повторете същата парола')}
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                className="aci-toggle-pass"
                                onClick={() => setShowRePassword((s) => !s)}
                                tabIndex={-1}
                            >
                                {showRePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <label className="aci-terms">
                        <input
                            type="checkbox"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                        />
                        <span>
                            {t('form.agreeTerms1', 'Съгласен съм с')}{' '}
                            <Link to="/terms">{t('form.terms', 'Условията за ползване')}</Link>
                            {' '}{t('form.agreeTerms2', 'и')}{' '}
                            <Link to="/privacy">{t('form.privacy', 'Политиката за поверителност')}</Link>
                        </span>
                    </label>

                    {formError && (
                        <div className="aci-form-error">
                            <AlertCircle size={14} />
                            <span>{formError}</span>
                        </div>
                    )}

                    <button type="submit" className="aci-btn aci-btn-primary" disabled={submitting}>
                        {submitting ? (
                            <Loader2 size={16} className="aci-spin" />
                        ) : (
                            <CheckCircle size={16} />
                        )}
                        <span>{t('form.submit', 'Завърши регистрацията')}</span>
                    </button>

                    {invitationData?.expiresAt && (
                        <p className="aci-expiry">
                            <Clock size={12} />
                            <span>
                                {t('form.validUntil', 'Линкът е валиден до:')} {formatDate(invitationData.expiresAt)}
                            </span>
                        </p>
                    )}
                </form>

                <div className="aci-footer-contact">
                    <p className="aci-footer-title">{t('footer.needHelp', 'Нуждаете се от помощ?')}</p>
                    <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="aci-contact-link">
                        <Phone size={14} />
                        <span>{CONTACT_PHONE}</span>
                    </a>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="aci-contact-link">
                        <Mail size={14} />
                        <span>{CONTACT_EMAIL}</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AcceptInvitation;
