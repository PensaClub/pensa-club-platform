// src/components/ForgetPassword/ResetPasswordPage.jsx
// Prefix: rpp-

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LocalizedLink as Link } from '../LocalizedLink/LocalizedLink';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { useAuthContext } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';
import {
    Loader2, Eye, EyeOff, CheckCircle, AlertCircle, Phone, Mail,
    Home, Lock, Shield, KeyRound,
} from 'lucide-react';
import './resetPasswordPage.css';

const CONTACT_PHONE = '+359 89 579 4214';
const CONTACT_EMAIL = 'pensa.club@gmail.com';

export const ResetPasswordPage = () => {
    const { t } = useTranslation('auth');
    const { onPasswordReset, getResetTokenInfo } = useAuthContext();
    const navigate = useLocalizedNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    // Token info state
    const [tokenInfo, setTokenInfo] = useState(null);
    const [tokenInfoLoading, setTokenInfoLoading] = useState(true);
    const [tokenInfoError, setTokenInfoError] = useState('');

    // Form state
    const [smsCode, setSmsCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [reNewPassword, setReNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const [smsAttemptsLeft, setSmsAttemptsLeft] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [smsError, setSmsError] = useState('');

    // ─── Scroll to top on mount ───
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // ─── Load token info on mount ───
    useEffect(() => {
        if (!token) {
            setTokenInfoLoading(false);
            setTokenInfoError('missing');
            return;
        }
        (async () => {
            try {
                const info = await getResetTokenInfo(token);
                setTokenInfo(info);
                if (info?.attemptsLeft != null) {
                    setSmsAttemptsLeft(info.attemptsLeft);
                }
            } catch (err) {
                const msg = (err?.message || '').toLowerCase();
                if (msg.includes('expired')) {
                    setTokenInfoError('expired');
                } else {
                    setTokenInfoError('invalid');
                }
            } finally {
                setTokenInfoLoading(false);
            }
        })();
    }, [token]);

    // ─── Validation ───
    const validateForm = () => {
        setFormError('');
        setSmsError('');

        // SMS code validation (only if required)
        if (tokenInfo?.requiresSms) {
            if (!smsCode) {
                setSmsError(t('form.smsCodeMissing', 'Моля въведете SMS кода, който получихте на телефона си.'));
                return false;
            }
            if (smsCode.length !== 6) {
                setSmsError(t('form.smsCodeIncomplete', 'SMS кодът трябва да съдържа точно 6 цифри.'));
                return false;
            }
        }

        // Password validation
        if (!newPassword || newPassword.length < 8) {
            setFormError(t('form.passwordTooShort', 'Паролата трябва да е поне 8 символа.'));
            return false;
        }
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword)) {
            setFormError(t('form.passwordWeak', 'Паролата трябва да съдържа поне една буква и една цифра.'));
            return false;
        }
        if (newPassword !== reNewPassword) {
            setFormError(t('form.passwordMismatch', 'Паролите не съвпадат.'));
            return false;
        }
        return true;
    };

    // ─── Submit ───
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            await onPasswordReset({
                newPassword,
                reNewPassword,
                token,
                tokenType: 'reset',
                ...(tokenInfo?.requiresSms ? { smsCode } : {}),
            });
            navigate('/sign-up');
        } catch (err) {
            const msg = (err?.message || '').toLowerCase();
            if (err?.attemptsLeft != null) {
                setSmsAttemptsLeft(err.attemptsLeft);
            }
            if (msg.includes('sms code')) {
                if (msg.includes('required')) {
                    setSmsError(t('form.smsCodeMissing', 'Моля въведете SMS кода, който получихте на телефона си.'));
                } else if (msg.includes('invalid')) {
                    setSmsError(t('form.smsCodeInvalid', 'Грешен SMS код. Опитайте отново.'));
                } else {
                    setSmsError(err.message);
                }
            } else if (msg.includes('too many')) {
                setSmsError(t('form.smsNoAttemptsLeft', 'Превишен лимит. Свържете се с админ за нов линк.'));
            } else if (msg.includes('expired')) {
                setFormError(t('form.tokenExpiredInline', 'Линкът е изтекъл. Свържете се с админ за нов.'));
            } else {
                setFormError(err?.message || t('form.genericError', 'Възникна грешка при смяна на паролата.'));
            }
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Helpers ───
    const formatDate = (isoStr) => {
        if (!isoStr) return '';
        try {
            return new Date(isoStr).toLocaleString('bg-BG', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });
        } catch {
            return '';
        }
    };

    // =========================================================
    //                       RENDER
    // =========================================================

    // Loading state
    if (tokenInfoLoading) {
        return (
            <div className="rpp-wrapper">
                <div className="rpp-card rpp-card-center">
                    <Loader2 size={48} className="rpp-spin rpp-loading-icon" />
                    <p className="rpp-loading-text">{t('form.checkingToken', 'Проверка на линка...')}</p>
                </div>
            </div>
        );
    }

    // Error state — invalid/expired/missing token
    if (tokenInfoError) {
        const errorTitles = {
            expired: t('form.tokenExpiredTitle', 'Линкът вече не е валиден'),
            missing: t('form.tokenMissingTitle', 'Липсва линк за смяна на парола'),
            invalid: t('form.invalidTokenTitle', 'Невалиден линк'),
        };
        const errorTexts = {
            expired: t('form.tokenExpiredText', 'Този линк за смяна на парола е изтекъл. Моля свържете се с нас, за да получите нов.'),
            missing: t('form.tokenMissingText', 'Линкът за смяна на парола липсва. Моля използвайте линка от имейла, който получихте.'),
            invalid: t('form.invalidTokenText', 'Този линк за смяна на парола е невалиден или вече е използван.'),
        };

        return (
            <div className="rpp-wrapper">
                <div className="rpp-card rpp-card-error">
                    <div className="rpp-error-icon">
                        <AlertCircle size={48} />
                    </div>
                    <h2 className="rpp-title">{errorTitles[tokenInfoError]}</h2>
                    <p className="rpp-description">{errorTexts[tokenInfoError]}</p>
                    <div className="rpp-contact-box">
                        <h3 className="rpp-contact-title">{t('form.contactTitle', 'Свържете се с нас:')}</h3>
                        <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="rpp-contact-link">
                            <Phone size={16} />
                            <span>{CONTACT_PHONE}</span>
                        </a>
                        <a href={`mailto:${CONTACT_EMAIL}`} className="rpp-contact-link">
                            <Mail size={16} />
                            <span>{CONTACT_EMAIL}</span>
                        </a>
                    </div>
                    <Link to="/" className="rpp-btn rpp-btn-secondary">
                        <Home size={16} />
                        <span>{t('form.backHome', 'Към началната страница')}</span>
                    </Link>
                </div>
            </div>
        );
    }

    // Form
    return (
        <div className="rpp-wrapper">
            <div className="rpp-card">
                {/* Header */}
                <div className="rpp-header">
                    <img src="/images/homePage/logo.png" alt="Pensa Club" className="rpp-logo" />
                    <h1 className="rpp-brand">Pensa Club</h1>
                    <p className="rpp-brand-subtitle">{t('form.passwordReset', 'Смяна на парола')}</p>
                </div>

                {/* Welcome */}
                <div className="rpp-welcome">
                    <h2 className="rpp-title">{t('form.reset-password', 'Нулиране на паролата')}</h2>
                    {tokenInfo?.email && (
                        <p className="rpp-email-info">
                            <Mail size={14} /> {tokenInfo.email}
                        </p>
                    )}
                    <p className="rpp-description">
                        {tokenInfo?.requiresSms
                            ? t('form.enterPasswordAndSms', 'Въведете SMS кода от телефона си и изберете нова парола.')
                            : t('form.enter-new-password', 'Въведете новата си парола по-долу.')}
                    </p>
                </div>

                {/* SMS notice (admin-initiated only) */}
                {tokenInfo?.requiresSms && (
                    <div className="rpp-sms-info">
                        <Shield size={16} />
                        <div>
                            <strong>{t('form.smsRequiredTitle', 'Допълнителна сигурност')}</strong>
                            <p>{t('form.smsRequired', 'Този линк изисква 6-цифрен SMS код, който беше изпратен на телефона Ви.')}</p>
                        </div>
                    </div>
                )}

                <form className="rpp-form" onSubmit={handleSubmit}>
                    {/* SMS code field */}
                    {tokenInfo?.requiresSms && (
                        <div className="rpp-form-group">
                            <label className="rpp-label" htmlFor="rpp-smsCode">
                                <KeyRound size={14} /> {t('form.smsCode', 'SMS код (6 цифри)')}
                            </label>
                            <input
                                id="rpp-smsCode"
                                type="text"
                                className={`rpp-input rpp-input-sms ${smsError ? 'rpp-input-error' : ''}`}
                                value={smsCode}
                                onChange={(e) => {
                                    setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                    if (smsError) setSmsError('');
                                }}
                                placeholder="000000"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                            />
                            {smsError && (
                                <p className="rpp-field-error">
                                    <AlertCircle size={14} /> {smsError}
                                </p>
                            )}
                            {!smsError && smsAttemptsLeft != null && smsAttemptsLeft < 5 && (
                                <p className={`rpp-field-warning ${smsAttemptsLeft === 0 ? 'rpp-field-error' : ''}`}>
                                    {smsAttemptsLeft === 0
                                        ? t('form.smsNoAttemptsLeft', 'Превишен лимит. Свържете се с админ за нов линк.')
                                        : t('form.smsAttemptsLeftLabel', { count: smsAttemptsLeft, defaultValue: `Останали опити: ${smsAttemptsLeft}` })}
                                </p>
                            )}
                        </div>
                    )}

                    {/* New password */}
                    <div className="rpp-form-group">
                        <label className="rpp-label" htmlFor="rpp-newPassword">
                            <Lock size={14} /> {t('form.new-password', 'Нова парола')}
                        </label>
                        <div className="rpp-input-wrap">
                            <input
                                id="rpp-newPassword"
                                type={showPassword ? 'text' : 'password'}
                                className="rpp-input"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    if (formError) setFormError('');
                                }}
                                placeholder={t('form.passwordPlaceholder', 'Минимум 8 символа, буква + цифра')}
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                className="rpp-toggle-pass"
                                onClick={() => setShowPassword((s) => !s)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Repeat password */}
                    <div className="rpp-form-group">
                        <label className="rpp-label" htmlFor="rpp-reNewPassword">
                            <Lock size={14} /> {t('form.confirm-new-password', 'Потвърди новата парола')}
                        </label>
                        <div className="rpp-input-wrap">
                            <input
                                id="rpp-reNewPassword"
                                type={showRePassword ? 'text' : 'password'}
                                className="rpp-input"
                                value={reNewPassword}
                                onChange={(e) => {
                                    setReNewPassword(e.target.value);
                                    if (formError) setFormError('');
                                }}
                                placeholder={t('form.repeatPasswordPlaceholder', 'Повторете същата парола')}
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                className="rpp-toggle-pass"
                                onClick={() => setShowRePassword((s) => !s)}
                                tabIndex={-1}
                            >
                                {showRePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {formError && (
                        <div className="rpp-form-error">
                            <AlertCircle size={14} />
                            <span>{formError}</span>
                        </div>
                    )}

                    <button type="submit" className="rpp-btn rpp-btn-primary" disabled={submitting}>
                        {submitting ? (
                            <Loader2 size={16} className="rpp-spin" />
                        ) : (
                            <CheckCircle size={16} />
                        )}
                        <span>{t('form.submitReset', 'Смени паролата')}</span>
                    </button>

                    {tokenInfo?.expiresAt && (
                        <p className="rpp-expiry">
                            ⏱ {t('form.validUntil', 'Линкът е валиден до:')} {formatDate(tokenInfo.expiresAt)}
                        </p>
                    )}
                </form>

                <div className="rpp-footer-links">
                    <Link to="/sign-up">{t('form.back-to-login', 'Обратно към Вход')}</Link>
                </div>

                <div className="rpp-footer-contact">
                    <p className="rpp-footer-title">{t('form.needHelp', 'Нуждаете се от помощ?')}</p>
                    <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="rpp-contact-link">
                        <Phone size={14} />
                        <span>{CONTACT_PHONE}</span>
                    </a>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="rpp-contact-link">
                        <Mail size={14} />
                        <span>{CONTACT_EMAIL}</span>
                    </a>
                </div>
            </div>
        </div>
    );
};
