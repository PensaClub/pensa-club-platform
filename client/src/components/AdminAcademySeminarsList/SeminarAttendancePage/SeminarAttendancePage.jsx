// src/components/AdminAcademySeminarsList/SeminarAttendancePage/SeminarAttendancePage.jsx
// Prefix: satp-

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import { ArrowLeft, BookOpen, Users, ChevronDown } from 'lucide-react';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import AttendanceForm from './AttendanceForm/AttendanceForm';
import './seminarAttendancePage.css';

const SeminarAttendancePage = () => {
    const { t } = useTranslation('academy-admin');
    const navigate = useLocalizedNavigate();
    const { getAdminSeminars } = useAcademyCourses();

    const [seminars, setSeminars] = useState([]);
    const [selectedSeminar, setSelectedSeminar] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);

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
                                                onClick={() => { setSelectedSeminar(sem); setShowDropdown(false); }}
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

                {/* Attendance form */}
                {selectedSeminar && (
                    <AttendanceForm seminar={selectedSeminar} />
                )}
            </div>
        </>
    );
};

export default SeminarAttendancePage;