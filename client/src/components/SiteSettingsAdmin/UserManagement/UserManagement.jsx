// src/components/SiteSettingsAdmin/UserManagement/UserManagement.jsx
// Prefix: umng-

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminContext } from '../../contexts/AdminContext';
import {
    Search, UserPlus, Mail, Phone, Send, AlertCircle, AlertTriangle,
    CheckCircle, Loader2, Shield, GraduationCap, Calendar, Info,
} from 'lucide-react';
import './userManagement.css';

const TABS = [
    { key: 'register', label: 'Регистрирай потребител', icon: UserPlus },
    { key: 'reset', label: 'Смяна на парола', icon: Shield },
];

const UserManagement = () => {
    const { t } = useTranslation('admin');
    const { lookupUserByEmail, inviteUser, sendResetLink } = useAdminContext();

    // Tab
    const [activeTab, setActiveTab] = useState('register');

    // Email lookup
    const [email, setEmail] = useState('');
    const [isLooking, setIsLooking] = useState(false);
    const [lookupResult, setLookupResult] = useState(null); // null | { exists, user? }
    const [lookupError, setLookupError] = useState('');

    // Register form (when user not found)
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [registerErrors, setRegisterErrors] = useState({});

    // Reset form (when user found)
    const [phone, setPhone] = useState('');
    const [sendSms, setSendSms] = useState(true);
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(null); // { smsSent, emailSent, expiresAt }

    // ─── Helpers ───

    const resetState = () => {
        setLookupResult(null);
        setLookupError('');
        setFirstName('');
        setLastName('');
        setRegisterErrors({});
        setPhone('');
        setSendSms(true);
        setResetSuccess(null);
    };

    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        // Don't clear email — admin may want to use the same email in another tab
        setLookupResult(null);
        setResetSuccess(null);
        setRegisterErrors({});
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (lookupResult) {
            // Clear previous lookup when email changes
            setLookupResult(null);
            setResetSuccess(null);
        }
    };

    // ─── Lookup ───

    const handleLookup = async () => {
        setLookupError('');
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setLookupError(t('userManagement.errors.emailRequired', 'Имейлът е задължителен'));
            return;
        }
        if (!trimmedEmail.includes('@')) {
            setLookupError(t('userManagement.errors.emailInvalid', 'Невалиден имейл формат'));
            return;
        }

        setIsLooking(true);
        try {
            const result = await lookupUserByEmail(trimmedEmail);
            setLookupResult(result);
            // Pre-fill phone for reset tab if user has one
            if (result?.exists && result.user?.details?.phoneNumber) {
                setPhone(result.user.details.phoneNumber);
                setSendSms(true);
            } else {
                setPhone('');
                setSendSms(false);
            }
        } catch {
            // toast already shown by provider
        } finally {
            setIsLooking(false);
        }
    };

    const handleEmailKeyDown = (e) => {
        if (e.key === 'Enter') handleLookup();
    };

    // ─── Register / Invite ───

    const validateRegisterForm = () => {
        const errors = {};
        if (firstName.trim() && firstName.trim().length < 3) {
            errors.firstName = t('userManagement.errors.firstNameMin', 'Името трябва да е поне 3 символа');
        }
        if (lastName.trim() && lastName.trim().length < 3) {
            errors.lastName = t('userManagement.errors.lastNameMin', 'Фамилията трябва да е поне 3 символа');
        }
        setRegisterErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInvite = async () => {
        if (!validateRegisterForm()) return;
        setIsInviting(true);
        try {
            await inviteUser({
                email: email.trim(),
                firstName: firstName.trim() || null,
                lastName: lastName.trim() || null,
            });
            // Success — clear form
            setEmail('');
            setFirstName('');
            setLastName('');
            setLookupResult(null);
        } catch {
            // toast already shown
        } finally {
            setIsInviting(false);
        }
    };

    // ─── Reset password ───

    const handleSendReset = async () => {
        // Validate phone if SMS is enabled
        if (sendSms && !phone.trim()) {
            return; // button is disabled anyway
        }
        setIsSendingReset(true);
        setResetSuccess(null);
        try {
            const result = await sendResetLink({
                email: email.trim(),
                phone: phone.trim() || null,
                sendSms,
            });
            setResetSuccess({
                smsSent: result?.smsSent || false,
                emailSent: result?.emailSent || false,
                expiresAt: result?.expiresAt,
            });
        } catch {
            // toast already shown
        } finally {
            setIsSendingReset(false);
        }
    };

    // ─── Helpers for rendering ───

    const formatDate = (isoStr) => {
        if (!isoStr) return '—';
        try {
            return new Date(isoStr).toLocaleString('bg-BG', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });
        } catch {
            return isoStr;
        }
    };

    const getRoleLabel = (role) => {
        const labels = {
            admin: t('userManagement.roles.admin', 'Администратор'),
            moderator: t('userManagement.roles.moderator', 'Модератор'),
            mentor: t('userManagement.roles.mentor', 'Ментор'),
            student: t('userManagement.roles.student', 'Студент'),
            user: t('userManagement.roles.user', 'Потребител'),
            guest: t('userManagement.roles.guest', 'Гост'),
            limited: t('userManagement.roles.limited', 'Ограничен'),
        };
        return labels[role] || role;
    };

    const getRoleClass = (role) => {
        return `umng-role-badge umng-role-${role}`;
    };

    // =========================================================
    //                       RENDER
    // =========================================================

    return (
        <div className="umng-wrapper">
            {/* Tabs */}
            <div className="umng-tabs">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        className={`umng-tab ${activeTab === key ? 'umng-tab-active' : ''}`}
                        onClick={() => handleTabChange(key)}
                    >
                        <Icon size={16} />
                        <span>{t(`userManagement.tabs.${key}`, label)}</span>
                    </button>
                ))}
            </div>

            {/* Email lookup */}
            <div className="umng-search-section">
                <label className="umng-label">
                    {t('userManagement.emailLabel', 'Имейл на потребителя')}
                </label>
                <div className="umng-search-box">
                    <Mail size={16} className="umng-search-icon" />
                    <input
                        type="email"
                        className={`umng-search-input ${lookupError ? 'umng-input-error' : ''}`}
                        placeholder={t('userManagement.emailPlaceholder', 'name@example.com')}
                        value={email}
                        onChange={handleEmailChange}
                        onKeyDown={handleEmailKeyDown}
                        disabled={isLooking}
                    />
                    <button
                        className="umng-btn umng-btn-primary"
                        onClick={handleLookup}
                        disabled={isLooking || !email.trim()}
                    >
                        {isLooking ? <Loader2 size={14} className="umng-spin" /> : <Search size={14} />}
                        <span>{t('userManagement.lookupBtn', 'Провери')}</span>
                    </button>
                </div>
                {lookupError && (
                    <p className="umng-error-text">
                        <AlertCircle size={12} /> {lookupError}
                    </p>
                )}
            </div>

            {/* User found — show profile */}
            {lookupResult?.exists && lookupResult.user && (
                <div className="umng-profile-card">
                    <div className="umng-profile-header">
                        <div className="umng-profile-avatar">
                            {lookupResult.user.details?.imageURL ? (
                                <img src={lookupResult.user.details.imageURL} alt="" />
                            ) : (
                                <div className="umng-profile-avatar-placeholder">
                                    {(lookupResult.user.details?.firstName || lookupResult.user.email)[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="umng-profile-main">
                            <div className="umng-profile-name">
                                {lookupResult.user.details?.firstName || ''} {lookupResult.user.details?.lastName || ''}
                                {!lookupResult.user.details?.firstName && !lookupResult.user.details?.lastName && (
                                    <span className="umng-no-name">{t('userManagement.noName', '(без име)')}</span>
                                )}
                            </div>
                            <div className="umng-profile-email">{lookupResult.user.email}</div>
                            <div className="umng-profile-badges">
                                <span className={getRoleClass(lookupResult.user.role)}>
                                    {getRoleLabel(lookupResult.user.role)}
                                </span>
                                {lookupResult.user.isMentor && (
                                    <span className="umng-role-badge umng-role-mentor">
                                        <GraduationCap size={11} /> {t('userManagement.mentorBadge', 'Ментор')}
                                    </span>
                                )}
                                {lookupResult.user.isStudent && (
                                    <span className="umng-role-badge umng-role-student">
                                        <GraduationCap size={11} /> {t('userManagement.studentBadge', 'Студент')}
                                    </span>
                                )}
                                {!lookupResult.user.finished && (
                                    <span className="umng-role-badge umng-role-pending">
                                        {t('userManagement.notFinishedBadge', 'Незавършена регистрация')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="umng-profile-details">
                        <div className="umng-profile-detail">
                            <Phone size={12} />
                            <span>{lookupResult.user.details?.phoneNumber || t('userManagement.noPhone', 'Без телефон')}</span>
                        </div>
                        <div className="umng-profile-detail">
                            <Calendar size={12} />
                            <span>{t('userManagement.registeredOn', 'Регистриран на')}: {formatDate(lookupResult.user.createdAt)}</span>
                        </div>
                        {lookupResult.user.details?.username && (
                            <div className="umng-profile-detail">
                                <Info size={12} />
                                <span>@{lookupResult.user.details.username}</span>
                            </div>
                        )}
                    </div>

                    {/* Tab-specific actions */}
                    {activeTab === 'register' && (
                        <div className="umng-warning-box">
                            <AlertTriangle size={16} />
                            <div>
                                <strong>{t('userManagement.alreadyRegistered', 'Този имейл вече е регистриран')}</strong>
                                <p>{t('userManagement.alreadyRegisteredDesc', 'Не може да изпратите нова покана. Ако потребителят има проблем с достъпа, превключете на таба "Смяна на парола".')}</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reset' && !resetSuccess && (
                        <div className="umng-reset-form">
                            <h4 className="umng-section-title">
                                <Shield size={14} /> {t('userManagement.sendResetTitle', 'Изпрати reset линк')}
                            </h4>

                            <div className="umng-form-row">
                                <label className="umng-label">
                                    {t('userManagement.phoneForSms', 'Телефон за SMS')}
                                </label>
                                <input
                                    type="tel"
                                    className="umng-input"
                                    placeholder={t('userManagement.phonePlaceholder', '+359...')}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                                <p className="umng-hint">
                                    {t('userManagement.phoneHint', 'Ако оставите празно, ще се изпрати само email (без SMS код).')}
                                </p>
                            </div>

                            <label className="umng-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={sendSms && !!phone.trim()}
                                    onChange={(e) => setSendSms(e.target.checked)}
                                    disabled={!phone.trim()}
                                />
                                <span>
                                    {t('userManagement.sendSmsLabel', 'Изпрати SMS код за допълнителна сигурност')}
                                    <small>{t('userManagement.sendSmsHint', '(препоръчително — иначе всеки с достъп до имейла може да смени паролата)')}</small>
                                </span>
                            </label>

                            <button
                                className="umng-btn umng-btn-warning"
                                onClick={handleSendReset}
                                disabled={isSendingReset}
                            >
                                {isSendingReset ? (
                                    <Loader2 size={14} className="umng-spin" />
                                ) : (
                                    <Send size={14} />
                                )}
                                <span>{t('userManagement.sendResetBtn', 'Изпрати reset линк')}</span>
                            </button>
                        </div>
                    )}

                    {activeTab === 'reset' && resetSuccess && (
                        <div className="umng-success-box">
                            <CheckCircle size={20} />
                            <div>
                                <strong>{t('userManagement.resetLinkSent', 'Reset линкът е изпратен')}</strong>
                                <ul>
                                    <li>
                                        {resetSuccess.emailSent
                                            ? `✅ ${t('userManagement.emailSentTo', 'Email изпратен на')}: ${lookupResult.user.email}`
                                            : `❌ ${t('userManagement.emailNotSent', 'Email НЕ е изпратен')}`}
                                    </li>
                                    {sendSms && (
                                        <li>
                                            {resetSuccess.smsSent
                                                ? `✅ ${t('userManagement.smsSentTo', 'SMS изпратен на')}: ${phone}`
                                                : `❌ ${t('userManagement.smsNotSent', 'SMS НЕ е изпратен')}`}
                                        </li>
                                    )}
                                    {resetSuccess.expiresAt && (
                                        <li>
                                            ⏱ {t('userManagement.linkValidUntil', 'Линкът е валиден до')}: {formatDate(resetSuccess.expiresAt)}
                                        </li>
                                    )}
                                </ul>
                                <button
                                    className="umng-btn umng-btn-secondary umng-btn-sm"
                                    onClick={() => { resetState(); setEmail(''); }}
                                >
                                    {t('userManagement.startOver', 'Започни нова заявка')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* User NOT found — show register form (only on register tab) */}
            {lookupResult && !lookupResult.exists && activeTab === 'register' && (
                <div className="umng-register-card">
                    <h4 className="umng-section-title">
                        <UserPlus size={14} /> {t('userManagement.registerNewUser', 'Регистрирай нов потребител')}
                    </h4>
                    <p className="umng-hint">
                        {t('userManagement.registerHint', 'Имейлът')} <strong>{email}</strong> {t('userManagement.notRegisteredYet', 'не съществува в системата. Можете да го поканите за регистрация.')}
                    </p>

                    <div className="umng-form-row-double">
                        <div className="umng-form-field">
                            <label className="umng-label">{t('userManagement.firstName', 'Име (опционално)')}</label>
                            <input
                                type="text"
                                className={`umng-input ${registerErrors.firstName ? 'umng-input-error' : ''}`}
                                placeholder={t('userManagement.firstNamePlaceholder', 'Иван')}
                                value={firstName}
                                onChange={(e) => {
                                    setFirstName(e.target.value);
                                    if (registerErrors.firstName) setRegisterErrors(prev => ({ ...prev, firstName: '' }));
                                }}
                            />
                            {registerErrors.firstName && (
                                <span className="umng-error-text"><AlertCircle size={12} /> {registerErrors.firstName}</span>
                            )}
                        </div>

                        <div className="umng-form-field">
                            <label className="umng-label">{t('userManagement.lastName', 'Фамилия (опционално)')}</label>
                            <input
                                type="text"
                                className={`umng-input ${registerErrors.lastName ? 'umng-input-error' : ''}`}
                                placeholder={t('userManagement.lastNamePlaceholder', 'Петров')}
                                value={lastName}
                                onChange={(e) => {
                                    setLastName(e.target.value);
                                    if (registerErrors.lastName) setRegisterErrors(prev => ({ ...prev, lastName: '' }));
                                }}
                            />
                            {registerErrors.lastName && (
                                <span className="umng-error-text"><AlertCircle size={12} /> {registerErrors.lastName}</span>
                            )}
                        </div>
                    </div>

                    <button
                        className="umng-btn umng-btn-primary umng-btn-full"
                        onClick={handleInvite}
                        disabled={isInviting}
                    >
                        {isInviting ? <Loader2 size={14} className="umng-spin" /> : <Send size={14} />}
                        <span>{t('userManagement.sendInvite', 'Изпрати покана')}</span>
                    </button>
                </div>
            )}

            {/* User NOT found — error on reset tab */}
            {lookupResult && !lookupResult.exists && activeTab === 'reset' && (
                <div className="umng-warning-box">
                    <AlertTriangle size={16} />
                    <div>
                        <strong>{t('userManagement.userNotFound', 'Потребителят не е намерен')}</strong>
                        <p>{t('userManagement.userNotFoundDesc', 'Няма потребител с този имейл. Превключете на таба "Регистрирай потребител" за да изпратите покана.')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
