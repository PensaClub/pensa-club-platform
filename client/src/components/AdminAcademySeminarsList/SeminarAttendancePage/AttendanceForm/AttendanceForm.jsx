// src/components/AdminAcademySeminarsList/SeminarAttendancePage/AttendanceForm/AttendanceForm.jsx
// Prefix: satf-

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademyCourses } from '../../../contexts/AcademyCoursesProvider';
import {
    Search, UserPlus, Loader2, Users,
    CheckCircle, Globe, User, AlertCircle, Send, Info, X, Trash2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import './attendanceForm.css';

const PARTICIPATION_LEVELS = ['active', 'moderate', 'passive'];

const AttendanceForm = ({ seminar }) => {
    const { t } = useTranslation('academy-admin');
    const {
        searchSeminarStudents,
        bulkMixedAttendance,
        markSeminarAttended,
        getFullAttendance,
        inviteGuestToRegister,
        removePlatformAttendee,
        removeGuestAttendee,
    } = useAcademyCourses();

    // Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [addingStudentId, setAddingStudentId] = useState(null);

    // Guest form
    const [guestFirstName, setGuestFirstName] = useState('');
    const [guestLastName, setGuestLastName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [isAddingGuest, setIsAddingGuest] = useState(false);
    const [guestErrors, setGuestErrors] = useState({ firstName: '', lastName: '', email: '' });

    // Separate lists: registered (not attended) and attended
    const [participants, setParticipants] = useState([]); // registered, not yet attended
    const [attendedList, setAttendedList] = useState([]); // already attended
    const [isLoading, setIsLoading] = useState(true);

    // Participation level saving
    const [savingLevelId, setSavingLevelId] = useState(null);

    // Guest invitation
    const [invitingGuestId, setInvitingGuestId] = useState(null);
    const [existingUserModal, setExistingUserModal] = useState(null);

    // Guest email conflict (existing user found during add-guest)
    const [guestConflictModal, setGuestConflictModal] = useState(null);
    const [registeringExistingUser, setRegisteringExistingUser] = useState(false);

    // Remove participant confirmation
    const [removeConfirm, setRemoveConfirm] = useState(null); // { participant, onConfirm }
    const [removingId, setRemovingId] = useState(null);

    // =========================================================
    //                    LOAD PARTICIPANTS
    // =========================================================

    const loadParticipants = useCallback(async () => {
        try {
            const data = await getFullAttendance(seminar.id);
            setParticipants(data.registered || []);
            setAttendedList(data.attended || []);
        } catch (err) {
            console.error('Error loading participants:', err);
        }
    }, [seminar.id, getFullAttendance]);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            await loadParticipants();
            setIsLoading(false);
        };
        load();
        setSearchQuery('');
        setSearchResults([]);
    }, [seminar.id]);

    // =========================================================
    //                    SEARCH
    // =========================================================

    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        const timeout = setTimeout(async () => {
            setIsSearching(true);
            try {
                const data = await searchSeminarStudents(seminar.id, searchQuery.trim());
                setSearchResults(data.students || []);
            } catch (err) {
                console.error('Error searching:', err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchQuery, seminar.id]);

    // =========================================================
    //                    ADD PLATFORM USER — instant
    // =========================================================

    const handleAddPlatformUser = async (student) => {
        const id = student.studentId || student.userId;
        if (participants.some(p => p.type === 'platform' && (p.studentId === student.studentId || p.userId === student.userId))) {
            toast.info(t('attendanceForm.alreadyInList', 'Вече е в списъка'));
            return;
        }
        setAddingStudentId(id);
        try {
            await bulkMixedAttendance(seminar.id, {
                platformAttendees: [{ studentId: student.studentId, userId: student.userId, participationLevel: 'passive' }],
                guests: [],
            });
            await loadParticipants();
            setSearchQuery('');
            setSearchResults([]);
        } catch (err) {
            console.error('Error adding platform user:', err);
        } finally {
            setAddingStudentId(null);
        }
    };

    // =========================================================
    //                    ADD GUEST — instant
    // =========================================================

    const clearGuestForm = () => {
        setGuestFirstName('');
        setGuestLastName('');
        setGuestPhone('');
        setGuestEmail('');
        setGuestErrors({ firstName: '', lastName: '', email: '' });
    };

    const validateGuestForm = () => {
        const errors = { firstName: '', lastName: '', email: '' };

        if (!guestFirstName.trim()) {
            errors.firstName = t('attendanceForm.errors.firstNameRequired', 'Името е задължително.');
        } else if (guestFirstName.trim().length < 3) {
            errors.firstName = t('attendanceForm.errors.firstNameMin', 'Името трябва да е поне 3 символа.');
        } else if (guestFirstName.trim().length > 20) {
            errors.firstName = t('attendanceForm.errors.firstNameMax', 'Името трябва да е до 20 символа.');
        }

        if (!guestLastName.trim()) {
            errors.lastName = t('attendanceForm.errors.lastNameRequired', 'Фамилията е задължителна.');
        } else if (guestLastName.trim().length < 3) {
            errors.lastName = t('attendanceForm.errors.lastNameMin', 'Фамилията трябва да е поне 3 символа.');
        } else if (guestLastName.trim().length > 20) {
            errors.lastName = t('attendanceForm.errors.lastNameMax', 'Фамилията трябва да е до 20 символа.');
        }

        if (guestEmail.trim() && !guestEmail.includes('@')) {
            errors.email = t('attendanceForm.errors.emailInvalid', 'Невалиден имейл (липсва @).');
        }

        setGuestErrors(errors);
        return !errors.firstName && !errors.lastName && !errors.email;
    };

    const handleAddGuest = async () => {
        if (!validateGuestForm()) return;
        setIsAddingGuest(true);
        try {
            const result = await bulkMixedAttendance(seminar.id, {
                platformAttendees: [],
                guests: [{
                    firstName: guestFirstName.trim(),
                    lastName: guestLastName.trim(),
                    phone: guestPhone.trim() || null,
                    email: guestEmail.trim() || null,
                    participationLevel: 'passive',
                }],
            });

            // If email matches an existing user → show modal instead of adding as guest
            if (result?.existingUserConflicts && result.existingUserConflicts.length > 0) {
                setGuestConflictModal(result.existingUserConflicts[0]);
                // NOTE: do not clear form — admin may want to edit and retry
            } else {
                await loadParticipants();
                clearGuestForm();
            }
        } catch (err) {
            console.error('Error adding guest:', err);
        } finally {
            setIsAddingGuest(false);
        }
    };

    // Admin confirmed: register the existing user as a platform attendee
    const handleRegisterExistingUser = async () => {
        if (!guestConflictModal) return;
        setRegisteringExistingUser(true);
        try {
            await bulkMixedAttendance(seminar.id, {
                platformAttendees: [{
                    userId: guestConflictModal.userId,
                    participationLevel: 'passive',
                }],
                guests: [],
            });
            await loadParticipants();
            clearGuestForm();
            setGuestConflictModal(null);
            toast.success(t('attendanceForm.conflictRegisteredAsPlatform', 'Потребителят е добавен към регистрираните участници.'));
        } catch (err) {
            console.error('Error registering existing user:', err);
            toast.error(t('attendanceForm.conflictRegisterError', 'Грешка при регистриране на потребителя.'));
        } finally {
            setRegisteringExistingUser(false);
        }
    };

    // =========================================================
    //                    UPDATE PARTICIPATION LEVEL
    // =========================================================

    const handleUpdateLevel = async (participant, newLevel) => {
        const key = `${participant.type}-${participant.id}`;
        setSavingLevelId(key);
        try {
            if (participant.type === 'platform') {
                await markSeminarAttended(seminar.id, participant.studentId, { participationLevel: newLevel });
            }
            // За гости — TODO: отделен endpoint за update на guest participation
            await loadParticipants();
        } catch (err) {
            console.error('Error updating level:', err);
        } finally {
            setSavingLevelId(null);
        }
    };

    // =========================================================
    //                    HELPERS
    // =========================================================

    const getTypeLabel = (p) => {
        if (p.type === 'guest') return t('attendanceForm.typeGuest', 'Гост');
        if (p.seminarStatus === 'registered' || p.seminarStatus === 'approved') return t('attendanceForm.typeOnline', 'Онлайн');
        return t('attendanceForm.typePlatform', 'Платформа');
    };

    const getTypeClass = (p) => {
        if (p.type === 'guest') return 'satf-type-guest';
        if (p.seminarStatus === 'registered' || p.seminarStatus === 'approved') return 'satf-type-online';
        return 'satf-type-platform';
    };

    const getTypeIcon = (p) => {
        if (p.type === 'guest') return <UserPlus size={12} />;
        if (p.seminarStatus === 'registered' || p.seminarStatus === 'approved') return <Globe size={12} />;
        return <User size={12} />;
    };

    // =========================================================
    //                    GUEST INVITATION
    // =========================================================

    const handleInviteGuest = async (guestAttendanceId) => {
        setInvitingGuestId(guestAttendanceId);
        try {
            const result = await inviteGuestToRegister(guestAttendanceId);
            if (result.scenario === 'existing_user') {
                setExistingUserModal({
                    email: result.existingUserEmail,
                    roleUpgraded: result.roleUpgraded,
                    alreadyAttended: false,
                });
            } else if (result.scenario === 'already_registered') {
                setExistingUserModal({
                    email: result.existingUserEmail,
                    roleUpgraded: false,
                    alreadyAttended: true,
                });
            } else if (result.scenario === 'new_user' && result.emailSent) {
                toast.success(t('attendanceForm.inviteSent', 'Гостът е регистриран. Поканата е изпратена на имейла.'));
            } else if (result.scenario === 'new_user' && !result.emailSent) {
                toast.warning(t('attendanceForm.inviteNoEmail', 'Гостът е регистриран, но имейлът не се изпрати. Свържете се ръчно.'));
            }
            await loadParticipants();
        } catch {
            // toast вече е показан от provider-а
        } finally {
            setInvitingGuestId(null);
        }
    };

    // =========================================================
    //                    REMOVE PARTICIPANT
    // =========================================================

    const handleRemoveClick = (participant) => {
        setRemoveConfirm(participant);
    };

    const handleRemoveConfirm = async () => {
        if (!removeConfirm) return;
        const p = removeConfirm;
        const key = `${p.type}-${p.id}`;
        setRemovingId(key);
        try {
            if (p.type === 'guest') {
                await removeGuestAttendee(seminar.id, p.id);
            } else {
                await removePlatformAttendee(seminar.id, p.studentId);
            }
            await loadParticipants();
            setRemoveConfirm(null);
        } catch {
            // toast shown in provider
        } finally {
            setRemovingId(null);
        }
    };

    // =========================================================
    //                    RENDER
    // =========================================================

    return (
        <div className="satf-wrapper">
            {/* Info bar */}
            <div className="satf-info-bar">
                <div className="satf-info-left">
                    <h3 className="satf-info-title">{seminar.title}</h3>
                    <span className="satf-info-meta">
                        {seminar.location && `${seminar.location} · `}
                        {seminar.scheduledDate && new Date(seminar.scheduledDate).toLocaleDateString('bg-BG')}
                    </span>
                </div>
                <div className="satf-info-right">
                    <div className="satf-info-stat">
                        <Users size={16} />
                        <span>{participants.length} {t('attendanceForm.totalParticipants', 'участници')}</span>
                    </div>
                </div>
            </div>

            <div className="satf-columns">
                {/* ========== LEFT — Add people ========== */}
                <div className="satf-col-left">

                    {/* Search */}
                    <div className="satf-section">
                        <h4 className="satf-section-title">
                            <Search size={16} />
                            {t('attendanceForm.searchTitle', 'Запиши потребител от платформата')}
                        </h4>

                        <div className="satf-search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('attendanceForm.searchPlaceholder', 'Търси по имейл или потребителско име...')}
                                className="satf-search-input"
                            />
                            {isSearching && <Loader2 size={16} className="satf-spin" />}
                        </div>

                        {searchResults.length > 0 && (
                            <div className="satf-results">
                                {searchResults.map((student) => {
                                    const uid = student.studentId || student.userId;
                                    const alreadyIn = student.alreadyAttended || student.seminarStatus === 'approved' ||
                                        participants.some(p => p.type === 'platform' && p.studentId && student.studentId && p.studentId === student.studentId);
                                    const isAdding = addingStudentId === uid;

                                    return (
                                        <div key={uid} className={`satf-result-row ${alreadyIn ? 'satf-result-saved' : ''}`}>
                                            <div className="satf-result-avatar">
                                                {student.avatar ? (
                                                    <img src={student.avatar} alt="" className="satf-avatar-img" />
                                                ) : (
                                                    <div className="satf-avatar-placeholder">{(student.name || '?')[0]}</div>
                                                )}
                                            </div>
                                            <div className="satf-result-info">
                                                <span className="satf-result-name">{student.name}</span>
                                                <span className="satf-result-email">{student.email}</span>
                                            </div>
                                            {alreadyIn ? (
                                                <span className="satf-result-badge-saved">
                                                    <CheckCircle size={14} />
                                                    {t('attendanceForm.alreadyInList', 'В списъка')}
                                                </span>
                                            ) : (
                                                <button
                                                    className="satf-btn-add"
                                                    onClick={() => handleAddPlatformUser(student)}
                                                    disabled={isAdding}
                                                >
                                                    {isAdding
                                                        ? <Loader2 size={15} className="satf-spin" />
                                                        : <UserPlus size={15} />
                                                    }
                                                    {t('attendanceForm.addNow', 'Запиши')}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {searchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
                            <p className="satf-no-results">{t('attendanceForm.noResults', 'Няма намерени потребители')}</p>
                        )}
                    </div>

                    {/* Add guest */}
                    <div className="satf-section">
                        <h4 className="satf-section-title">
                            <UserPlus size={16} />
                            {t('attendanceForm.guestTitle', 'Запиши гост без профил')}
                        </h4>

                        <div className="satf-guest-form">
                            <div className="satf-guest-row">
                                <div className="satf-guest-field">
                                    <input
                                        type="text"
                                        value={guestFirstName}
                                        onChange={(e) => {
                                            setGuestFirstName(e.target.value);
                                            if (guestErrors.firstName) setGuestErrors(prev => ({ ...prev, firstName: '' }));
                                        }}
                                        onBlur={() => {
                                            const v = guestFirstName.trim();
                                            if (!v) setGuestErrors(prev => ({ ...prev, firstName: t('attendanceForm.errors.firstNameRequired', 'Името е задължително.') }));
                                            else if (v.length < 3) setGuestErrors(prev => ({ ...prev, firstName: t('attendanceForm.errors.firstNameMin', 'Името трябва да е поне 3 символа.') }));
                                            else if (v.length > 20) setGuestErrors(prev => ({ ...prev, firstName: t('attendanceForm.errors.firstNameMax', 'Името трябва да е до 20 символа.') }));
                                        }}
                                        placeholder={t('attendanceForm.firstName', 'Име') + ' *'}
                                        className={`satf-guest-input ${guestErrors.firstName ? 'satf-guest-input-error' : ''}`}
                                    />
                                    {guestErrors.firstName && <span className="satf-guest-error">{guestErrors.firstName}</span>}
                                </div>
                                <div className="satf-guest-field">
                                    <input
                                        type="text"
                                        value={guestLastName}
                                        onChange={(e) => {
                                            setGuestLastName(e.target.value);
                                            if (guestErrors.lastName) setGuestErrors(prev => ({ ...prev, lastName: '' }));
                                        }}
                                        onBlur={() => {
                                            const v = guestLastName.trim();
                                            if (!v) setGuestErrors(prev => ({ ...prev, lastName: t('attendanceForm.errors.lastNameRequired', 'Фамилията е задължителна.') }));
                                            else if (v.length < 3) setGuestErrors(prev => ({ ...prev, lastName: t('attendanceForm.errors.lastNameMin', 'Фамилията трябва да е поне 3 символа.') }));
                                            else if (v.length > 20) setGuestErrors(prev => ({ ...prev, lastName: t('attendanceForm.errors.lastNameMax', 'Фамилията трябва да е до 20 символа.') }));
                                        }}
                                        placeholder={t('attendanceForm.lastName', 'Фамилия') + ' *'}
                                        className={`satf-guest-input ${guestErrors.lastName ? 'satf-guest-input-error' : ''}`}
                                    />
                                    {guestErrors.lastName && <span className="satf-guest-error">{guestErrors.lastName}</span>}
                                </div>
                            </div>
                            <div className="satf-guest-row">
                                <div className="satf-guest-field">
                                    <input
                                        type="email"
                                        value={guestEmail}
                                        onChange={(e) => {
                                            setGuestEmail(e.target.value);
                                            if (guestErrors.email) setGuestErrors(prev => ({ ...prev, email: '' }));
                                        }}
                                        onBlur={() => {
                                            const v = guestEmail.trim();
                                            if (v && !v.includes('@')) setGuestErrors(prev => ({ ...prev, email: t('attendanceForm.errors.emailInvalid', 'Невалиден имейл (липсва @).') }));
                                        }}
                                        placeholder={t('attendanceForm.email', 'Имейл (незадължителен)')}
                                        className={`satf-guest-input ${guestErrors.email ? 'satf-guest-input-error' : ''}`}
                                    />
                                    {guestErrors.email && <span className="satf-guest-error">{guestErrors.email}</span>}
                                </div>
                            </div>
                            <div className="satf-guest-row">
                                <input
                                    type="tel"
                                    value={guestPhone}
                                    onChange={(e) => setGuestPhone(e.target.value)}
                                    placeholder={t('attendanceForm.phone', 'Телефон (незадължителен)')}
                                    className="satf-guest-input"
                                />
                                <button
                                    className="satf-btn-add-guest"
                                    onClick={handleAddGuest}
                                    disabled={isAddingGuest}
                                >
                                    {isAddingGuest
                                        ? <Loader2 size={16} className="satf-spin" />
                                        : <UserPlus size={16} />
                                    }
                                    {t('attendanceForm.addGuest', 'Запиши гост')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========== RIGHT — Participants list ========== */}
                <div className="satf-col-right">
                    <div className="satf-section">
                        <h4 className="satf-section-title">
                            <Users size={16} />
                            {t('attendanceForm.listTitle', 'Участници в семинара')}
                            <span className="satf-count-badge">{participants.length}</span>
                        </h4>

                        {isLoading ? (
                            <div className="satf-loading-small">
                                <Loader2 size={24} className="satf-spin" />
                            </div>
                        ) : participants.length === 0 ? (
                            <div className="satf-list-empty">
                                <AlertCircle size={24} />
                                <p>{t('attendanceForm.noParticipants', 'Все още няма записани участници')}</p>
                            </div>
                        ) : (
                            <div className="satf-participants-list">
                                {participants.map((p, i) => {
                                    const key = `${p.type}-${p.id}`;
                                    const isSavingLevel = savingLevelId === key;

                                    return (
                                        <div key={key} className="satf-participant-row">
                                            {/* Avatar */}
                                            <div className="satf-participant-avatar">
                                                {p.avatar ? (
                                                    <img src={p.avatar} alt="" className="satf-avatar-img" />
                                                ) : (
                                                    <div className={`satf-avatar-placeholder ${p.type === 'guest' ? 'satf-avatar-guest' : ''}`}>
                                                        {(p.name || '?')[0]}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="satf-participant-info">
                                                <div className="satf-participant-name-row">
                                                    <span className="satf-participant-name">{p.name}</span>
                                                    <span className={`satf-type-badge ${getTypeClass(p)}`}>
                                                        {getTypeIcon(p)}
                                                        {getTypeLabel(p)}
                                                    </span>
                                                </div>
                                                <span className="satf-participant-meta">
                                                    {p.email && p.email}
                                                    {p.phone && (p.email ? ` · ${p.phone}` : p.phone)}
                                                </span>
                                            </div>

                                            {/* Participation level */}
                                            <div className="satf-participant-level">
                                                {isSavingLevel ? (
                                                    <Loader2 size={14} className="satf-spin" />
                                                ) : (
                                                    <div className="satf-level-pills">
                                                        {PARTICIPATION_LEVELS.map((lvl) => (
                                                            <button
                                                                key={lvl}
                                                                className={`satf-level-pill ${p.participationLevel === lvl ? 'satf-level-pill-active' : ''}`}
                                                                onClick={() => handleUpdateLevel(p, lvl)}
                                                                title={t(`attendanceForm.levels.${lvl}`, lvl)}
                                                            >
                                                                {t(`attendanceForm.levelsShort.${lvl}`, lvl[0].toUpperCase())}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Credits */}
                                            {p.earnedCredits > 0 && (
                                                <span className="satf-participant-credits">+{p.earnedCredits}</span>
                                            )}

                                            {/* Guest invitation button */}
                                            {p.type === 'guest' && p.email && !p.convertedToUserId && (
                                                <button
                                                    className="satf-btn-invite-guest"
                                                    onClick={() => handleInviteGuest(p.id)}
                                                    disabled={invitingGuestId === p.id}
                                                    title={t('attendanceForm.inviteGuest', 'Регистрирай гост')}
                                                >
                                                    {invitingGuestId === p.id
                                                        ? <Loader2 size={14} className="satf-spin" />
                                                        : <Send size={14} />}
                                                    <span>{t('attendanceForm.inviteGuest', 'Регистрирай гост')}</span>
                                                </button>
                                            )}
                                            {p.type === 'guest' && p.convertedToUserId && (
                                                <span className="satf-badge-converted">
                                                    <CheckCircle size={12} />
                                                    {t('attendanceForm.alreadyRegistered', 'Регистриран')}
                                                </span>
                                            )}

                                            {/* Remove button */}
                                            <button
                                                className="satf-btn-remove"
                                                onClick={() => handleRemoveClick(p)}
                                                disabled={removingId === key}
                                                title={t('attendanceForm.remove', 'Премахни от списъка')}
                                                aria-label={t('attendanceForm.remove', 'Премахни от списъка')}
                                            >
                                                {removingId === key
                                                    ? <Loader2 size={14} className="satf-spin" />
                                                    : <X size={14} />}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                     {/* Already attended — info for mentor */}
                    {attendedList.length > 0 && (
                        <div className="satf-section satf-section-attended">
                            <h4 className="satf-section-title">
                                <CheckCircle size={16} />
                                {t('attendanceForm.attendedTitle', 'Вече присъствали')}
                                <span className="satf-count-badge satf-count-attended">{attendedList.length}</span>
                            </h4>
                            <p className="satf-attended-hint">
                                {t('attendanceForm.attendedHint', 'При повторно записване не се дават нови кредити.')}
                            </p>
                            <div className="satf-attended-list">
                                {attendedList.map((p, i) => (
                                    <div key={`att-${p.type}-${p.id}-${i}`} className="satf-attended-row">
                                        <div className="satf-participant-avatar">
                                            {p.avatar ? (
                                                <img src={p.avatar} alt="" className="satf-avatar-img" />
                                            ) : (
                                                <div className={`satf-avatar-placeholder ${p.type === 'guest' ? 'satf-avatar-guest' : ''}`}>
                                                    {(p.name || '?')[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="satf-attended-info">
                                            <span className="satf-attended-name">{p.name}</span>
                                            <span className="satf-attended-meta">
                                                {getTypeLabel(p)}
                                                {p.email && ` · ${p.email}`}
                                                {p.participationLevel && ` · ${t(`attendanceForm.levels.${p.participationLevel}`, p.participationLevel)}`}
                                            </span>
                                        </div>
                                        {p.earnedCredits > 0 && (
                                            <span className="satf-attended-credits">{p.earnedCredits} 🪙</span>
                                        )}

                                        {/* Guest invitation button */}
                                        {p.type === 'guest' && p.email && !p.convertedToUserId && (
                                            <button
                                                className="satf-btn-invite-guest"
                                                onClick={() => handleInviteGuest(p.id)}
                                                disabled={invitingGuestId === p.id}
                                                title={t('attendanceForm.inviteGuest', 'Регистрирай гост')}
                                            >
                                                {invitingGuestId === p.id
                                                    ? <Loader2 size={14} className="satf-spin" />
                                                    : <Send size={14} />}
                                                <span>{t('attendanceForm.inviteGuest', 'Регистрирай гост')}</span>
                                            </button>
                                        )}
                                        {p.type === 'guest' && p.convertedToUserId && (
                                            <span className="satf-badge-converted">
                                                <CheckCircle size={12} />
                                                {t('attendanceForm.alreadyRegistered', 'Регистриран')}
                                            </span>
                                        )}

                                        {/* Remove button */}
                                        <button
                                            className="satf-btn-remove"
                                            onClick={() => handleRemoveClick(p)}
                                            disabled={removingId === `${p.type}-${p.id}`}
                                            title={t('attendanceForm.remove', 'Премахни от списъка')}
                                            aria-label={t('attendanceForm.remove', 'Премахни от списъка')}
                                        >
                                            {removingId === `${p.type}-${p.id}`
                                                ? <Loader2 size={14} className="satf-spin" />
                                                : <X size={14} />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Modal: Email entered for guest already belongs to a platform user */}
            {guestConflictModal && (
                <div className="satf-modal-overlay" onClick={() => !registeringExistingUser && setGuestConflictModal(null)}>
                    <div className="satf-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="satf-modal-icon">
                            <Info size={32} />
                        </div>
                        <h3 className="satf-modal-title">
                            {t('attendanceForm.conflictTitle', 'Този имейл вече има регистрация')}
                        </h3>
                        <p className="satf-modal-text">
                            {t('attendanceForm.conflictText1', 'Имейлът')}{' '}
                            <strong>{guestConflictModal.email}</strong>{' '}
                            {t('attendanceForm.conflictText2', 'е регистриран в платформата Pensa Club като')}{' '}
                            <strong>{`${guestConflictModal.firstName} ${guestConflictModal.lastName}`.trim()}</strong>.
                        </p>
                        <p className="satf-modal-text">
                            {t('attendanceForm.conflictText3', 'Вместо да добавяте този участник като гост, можете да го запишете директно като пълноправен потребител на семинара.')}
                        </p>
                        <div className="satf-modal-actions">
                            <button
                                className="satf-modal-btn satf-modal-btn-secondary"
                                onClick={() => setGuestConflictModal(null)}
                                disabled={registeringExistingUser}
                            >
                                {t('attendanceForm.cancel', 'Отказ')}
                            </button>
                            <button
                                className="satf-modal-btn"
                                onClick={handleRegisterExistingUser}
                                disabled={registeringExistingUser}
                            >
                                {registeringExistingUser
                                    ? <Loader2 size={14} className="satf-spin" />
                                    : <CheckCircle size={14} />}
                                <span>{t('attendanceForm.conflictRegisterBtn', 'Регистрирай като потребител')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Guest already registered as platform user */}
            {existingUserModal && (
                <div className="satf-modal-overlay" onClick={() => setExistingUserModal(null)}>
                    <div className="satf-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="satf-modal-icon">
                            <Info size={32} />
                        </div>
                        <h3 className="satf-modal-title">
                            {existingUserModal.alreadyAttended
                                ? t('attendanceForm.alreadyAttendedTitle', 'Участникът вече е в регистрираните')
                                : t('attendanceForm.existingUserTitle', 'Потребителят вече е регистриран')}
                        </h3>
                        <p className="satf-modal-text">
                            {t('attendanceForm.existingUserText1', 'Имейлът')}{' '}
                            <strong>{existingUserModal.email}</strong>{' '}
                            {t('attendanceForm.existingUserText2', 'вече съществува като регистриран потребител в Pensa Club.')}
                        </p>
                        {existingUserModal.alreadyAttended ? (
                            <>
                                <p className="satf-modal-text">
                                    {t('attendanceForm.alreadyAttendedText', 'Този потребител вече е в списъка с регистрирани участници на семинара и е получил кредитите си. Дублиращият запис като гост беше изчистен.')}
                                </p>
                                <p className="satf-modal-text satf-modal-text-secondary">
                                    {t('attendanceForm.alreadyAttendedNoAction', 'Не е необходимо допълнително действие.')}
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="satf-modal-text">
                                    {t('attendanceForm.existingUserText3', 'Гостът беше автоматично преместен в списъка с регистрирани участници на семинара')}
                                    {existingUserModal.roleUpgraded && (
                                        <>{', '}{t('attendanceForm.existingUserRoleUpgraded', 'а ролята му беше обновена на student')}</>
                                    )}
                                    .
                                </p>
                                <p className="satf-modal-text satf-modal-text-secondary">
                                    {t('attendanceForm.existingUserNoInvite', 'Няма нужда от покана — потребителят вече има достъп до платформата.')}
                                </p>
                            </>
                        )}
                        <button className="satf-modal-btn" onClick={() => setExistingUserModal(null)}>
                            {t('attendanceForm.understood', 'Разбрах')}
                        </button>
                    </div>
                </div>
            )}

            {/* Modal: Confirm remove participant */}
            {removeConfirm && (
                <div className="satf-modal-overlay" onClick={() => !removingId && setRemoveConfirm(null)}>
                    <div className="satf-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="satf-modal-icon satf-modal-icon-danger">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="satf-modal-title">
                            {t('attendanceForm.removeTitle', 'Премахване на участник')}
                        </h3>
                        <p className="satf-modal-text">
                            {t('attendanceForm.removeText', 'Сигурни ли сте, че искате да премахнете')}{' '}
                            <strong>{removeConfirm.name}</strong>{' '}
                            {t('attendanceForm.removeTextSuffix', 'от списъка?')}
                        </p>
                        {removeConfirm.earnedCredits > 0 && (
                            <p className="satf-modal-text satf-modal-text-secondary">
                                {t('attendanceForm.removeCreditsWarning', 'Този участник е получил')}{' '}
                                <strong>{removeConfirm.earnedCredits}</strong>{' '}
                                {t('attendanceForm.removeCreditsWarningSuffix', 'кредита, които ще бъдат премахнати заедно със записа.')}
                            </p>
                        )}
                        <div className="satf-modal-actions">
                            <button
                                className="satf-modal-btn satf-modal-btn-secondary"
                                onClick={() => setRemoveConfirm(null)}
                                disabled={!!removingId}
                            >
                                {t('attendanceForm.cancel', 'Отказ')}
                            </button>
                            <button
                                className="satf-modal-btn satf-modal-btn-danger"
                                onClick={handleRemoveConfirm}
                                disabled={!!removingId}
                            >
                                {removingId
                                    ? <Loader2 size={14} className="satf-spin" />
                                    : <Trash2 size={14} />}
                                <span>{t('attendanceForm.removeBtn', 'Премахни')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceForm;