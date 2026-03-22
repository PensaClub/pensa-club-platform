// src/components/AdminAcademySeminarsList/SeminarAttendancePage/AttendanceForm/AttendanceForm.jsx
// Prefix: satf-

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademyCourses } from '../../../contexts/AcademyCoursesProvider';
import {
    Search, UserPlus, Loader2, Users,
    CheckCircle, Globe, User, AlertCircle,
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

    // Separate lists: registered (not attended) and attended
    const [participants, setParticipants] = useState([]); // registered, not yet attended
    const [attendedList, setAttendedList] = useState([]); // already attended
    const [isLoading, setIsLoading] = useState(true);

    // Participation level saving
    const [savingLevelId, setSavingLevelId] = useState(null);

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

    const handleAddGuest = async () => {
        if (!guestFirstName.trim() || !guestLastName.trim()) return;
        setIsAddingGuest(true);
        try {
            await bulkMixedAttendance(seminar.id, {
                platformAttendees: [],
                guests: [{
                    firstName: guestFirstName.trim(),
                    lastName: guestLastName.trim(),
                    phone: guestPhone.trim() || null,
                    email: guestEmail.trim() || null,
                    participationLevel: 'passive',
                }],
            });
            await loadParticipants();
            setGuestFirstName('');
            setGuestLastName('');
            setGuestPhone('');
            setGuestEmail('');
        } catch (err) {
            console.error('Error adding guest:', err);
        } finally {
            setIsAddingGuest(false);
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
                                <input
                                    type="text"
                                    value={guestFirstName}
                                    onChange={(e) => setGuestFirstName(e.target.value)}
                                    placeholder={t('attendanceForm.firstName', 'Име') + ' *'}
                                    className="satf-guest-input"
                                />
                                <input
                                    type="text"
                                    value={guestLastName}
                                    onChange={(e) => setGuestLastName(e.target.value)}
                                    placeholder={t('attendanceForm.lastName', 'Фамилия') + ' *'}
                                    className="satf-guest-input"
                                />
                            </div>
                            <div className="satf-guest-row">
                                <input
                                    type="email"
                                    value={guestEmail}
                                    onChange={(e) => setGuestEmail(e.target.value)}
                                    placeholder={t('attendanceForm.email', 'Имейл (незадължителен)')}
                                    className="satf-guest-input"
                                />
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
                                    disabled={!guestFirstName.trim() || !guestLastName.trim() || isAddingGuest}
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
               
            </div>
        </div>
    );
};

export default AttendanceForm;