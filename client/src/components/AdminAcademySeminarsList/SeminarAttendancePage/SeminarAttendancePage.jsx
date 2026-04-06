// src/components/AdminAcademySeminarsList/SeminarAttendancePage/SeminarAttendancePage.jsx
// Prefix: satp-

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import { ArrowLeft, BookOpen, Users, ChevronDown, QrCode, Download } from 'lucide-react';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { QRCodeSVG } from 'qrcode.react';
import AttendanceForm from './AttendanceForm/AttendanceForm';
import AttendanceListUpload from './AttendanceListUpload/AttendanceListUpload';
import './seminarAttendancePage.css';

const SeminarAttendancePage = () => {
    const { t } = useTranslation('academy-admin');
    const navigate = useLocalizedNavigate();
    const { getAdminSeminars, getSeminarSessions } = useAcademyCourses();

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const [seminars, setSeminars] = useState([]);
    const [selectedSeminar, setSelectedSeminar] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getAdminSeminars({ limit: 100, sortBy: 'upcoming' });
                setSeminars(data.seminars || []);
            } catch (err) {
                console.error('Error loading seminars:', err);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('bg-BG', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <>
            <div className="satp-page-bg">
                <div className="satp-glow-orb" />
            </div>

            <div className="satp-container">
                {/* Header */}
                <div className="satp-header">
                    <button className="satp-back-btn" onClick={() => navigate('/academy/admin/seminars')}>
                        <ArrowLeft size={18} />
                        {t('seminarAttendance.backToList', 'Към семинари')}
                    </button>
                    <h1 className="satp-title">
                        <Users size={28} />
                        {t('seminarAttendance.title', 'Присъствие на')}{' '}
                        <span>{t('seminarAttendance.titleAccent', 'семинари')}</span>
                    </h1>
                    <p className="satp-subtitle">
                        {t('seminarAttendance.subtitle', 'Маркирайте присъстващи — потребители от платформата и гости')}
                    </p>
                </div>

                {/* Seminar selector */}
                <div className="satp-selector">
                    <label className="satp-selector-label">
                        {t('seminarAttendance.selectSeminar', 'Изберете семинар')}
                    </label>

                    {isLoading ? (
                        <div className="satp-selector-loading">
                            <div className="satp-spinner" />
                        </div>
                    ) : (
                        <div className="satp-dropdown-wrapper">
                            <button
                                className="satp-dropdown-trigger"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                {selectedSeminar ? (
                                    <div className="satp-selected-info">
                                        <span className="satp-selected-title">{selectedSeminar.title}</span>
                                        <span className="satp-selected-date">{formatDate(selectedSeminar.scheduledDate)}</span>
                                    </div>
                                ) : (
                                    <span className="satp-placeholder">
                                        {t('seminarAttendance.chooseSeminar', '— Изберете семинар —')}
                                    </span>
                                )}
                                <ChevronDown size={18} className={showDropdown ? 'satp-chevron-open' : ''} />
                            </button>

                            {showDropdown && (
                                <div className="satp-dropdown-list">
                                    {seminars.length === 0 ? (
                                        <div className="satp-dropdown-empty">
                                            {t('seminarAttendance.noSeminars', 'Няма семинари')}
                                        </div>
                                    ) : (
                                        seminars.map((sem) => (
                                            <button
                                                key={sem.id}
                                                className={`satp-dropdown-item ${selectedSeminar?.id === sem.id ? 'satp-dropdown-item-active' : ''}`}
                                                onClick={async () => {
                                                    setSelectedSeminar(sem);
                                                    setShowDropdown(false);
                                                    setSelectedSession(null);
                                                    try {
                                                        const sessData = await getSeminarSessions(sem.id);
                                                        setSessions(sessData || []);
                                                    } catch { setSessions([]); }
                                                }}
                                            >
                                                <div className="satp-dropdown-item-info">
                                                    <span className="satp-dropdown-item-title">{sem.title}</span>
                                                    <span className="satp-dropdown-item-meta">
                                                        {formatDate(sem.scheduledDate)}
                                                        {sem.location && ` · ${sem.location}`}
                                                    </span>
                                                </div>
                                                <span className={`satp-dropdown-item-status satp-status-${sem.status}`}>
                                                    {sem.status}
                                                </span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* QR + Attendance form */}
                {selectedSeminar && (
                    <div className="satp-actions-row">
                        <button className="satp-qr-btn" onClick={() => setShowQR(true)}>
                            <QrCode size={16} />
                            {t('seminarAttendance.showQR', 'Покажи QR')}
                        </button>
                        <button
                            className="satp-download-btn"
                            onClick={async () => {
                                try {
                                    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
                                    const res = await fetch(`${import.meta.env.VITE_API_URL}/academy/seminars/admin/export-attendees/${selectedSeminar.id}`, {
                                        headers: { Authorization: `Bearer ${auth.token}` },
                                        credentials: 'include',
                                    });
                                    const blob = await res.blob();
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `attendees-${selectedSeminar.id}.pdf`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                } catch { /* ignore */ }
                            }}
                        >
                            <Download size={16} />
                            {t('seminarAttendance.downloadList', 'Свали списък')}
                        </button>
                    </div>
                )}

                {/* Session selector */}
                {selectedSeminar && sessions.length > 0 && (
                    <div className="satp-session-selector">
                        <label className="satp-selector-label">
                            {t('seminarAttendance.selectSession', 'Изберете ден')}
                        </label>
                        <div className="satp-session-tabs">
                            <button
                                className={`satp-session-tab ${!selectedSession ? 'satp-session-tab-active' : ''}`}
                                onClick={() => setSelectedSession(null)}
                            >
                                Всички дни
                            </button>
                            {sessions.map(s => (
                                <button
                                    key={s.id}
                                    className={`satp-session-tab ${selectedSession?.id === s.id ? 'satp-session-tab-active' : ''}`}
                                    onClick={() => setSelectedSession(s)}
                                >
                                    {new Date(s.date).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })}
                                    <span className="satp-session-tab-time">{s.startTime}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {selectedSeminar && (
                    <AttendanceForm seminar={selectedSeminar} session={selectedSession} />
                )}

                {selectedSeminar && (
                    <AttendanceListUpload seminarId={selectedSeminar.id} seminarTitle={selectedSeminar.title} />
                )}
            </div>

            {showQR && selectedSeminar && (
                <div className="satp-qr-overlay" onClick={() => setShowQR(false)}>
                    <div className="satp-qr-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="satp-qr-title">{t('seminarAttendance.qrTitle', 'QR код за присъствие')}</h3>
                        <p className="satp-qr-subtitle">{selectedSeminar.title}</p>
                        <div className="satp-qr-code">
                            <QRCodeSVG
                                value={`https://pensa.club/academy/seminars/${selectedSeminar.id}/checkin`}
                                size={280}
                                bgColor="transparent"
                                fgColor="#ffffff"
                                level="M"
                            />
                        </div>
                        <p className="satp-qr-hint">{t('seminarAttendance.qrHint', 'Участниците сканират с телефон за бързо записване на присъствие')}</p>
                        <button className="satp-qr-close" onClick={() => setShowQR(false)}>
                            {t('seminarAttendance.close', 'Затвори')}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default SeminarAttendancePage;