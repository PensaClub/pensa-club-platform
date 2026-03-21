import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Wifi, Users, ChevronDown, ChevronUp, UserCheck, ClipboardList } from 'lucide-react';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import './digiMentorSeminars.css';

const DigiMentorSeminars = ({ seminars = [] }) => {
    const { t } = useTranslation('digibridge-mentor');
    const navigate = useLocalizedNavigate();
    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    const getStatusClass = (sem) => {
        if (sem.status === 'live') return 'dms-status-live';
        if (sem.status === 'completed') return 'dms-status-completed';
        if (sem.status === 'cancelled') return 'dms-status-cancelled';
        const now = new Date();
        const start = sem.scheduledDate ? new Date(sem.scheduledDate) : null;
        if (start && now < start) return 'dms-status-upcoming';
        return 'dms-status-scheduled';
    };

    const getStatusLabel = (sem) => {
        if (sem.status === 'live') return t('mentorSeminars.statusLive', 'На живо');
        if (sem.status === 'completed') return t('mentorSeminars.statusCompleted', 'Приключил');
        if (sem.status === 'cancelled') return t('mentorSeminars.statusCancelled', 'Отменен');
        const now = new Date();
        const start = sem.scheduledDate ? new Date(sem.scheduledDate) : null;
        if (start && now < start) return t('mentorSeminars.statusUpcoming', 'Предстои');
        return t('mentorSeminars.statusScheduled', 'Насрочен');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('bg-BG', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getLevelLabel = (level) => {
        if (level === 'active') return t('mentorSeminars.levelActive', 'Активно');
        if (level === 'moderate') return t('mentorSeminars.levelModerate', 'Умерено');
        return t('mentorSeminars.levelPassive', 'Пасивно');
    };

    const attendances = (sem) => sem.attendances || [];

    const isAttendedBeforeToday = (a) => {
        if (!a.attended || !a.attendedAt) return false;
        const attendedDate = new Date(a.attendedAt);
        const today = new Date();
        return attendedDate.toDateString() !== today.toDateString();
    };

    // Attended before today = truly "already attended"
    const attendedList = (sem) => attendances(sem).filter(a => isAttendedBeforeToday(a));
    // Everyone else = current participants (registered + attended today)
    const registeredList = (sem) => attendances(sem).filter(a => !isAttendedBeforeToday(a));

    if (!seminars.length) {
        return (
            <div className="dms-section">
                <h3 className="dms-title">
                    <Calendar size={20} />
                    {t('mentorSeminars.title', 'Моите семинари')}
                </h3>
                <div className="dms-empty">
                    <ClipboardList size={32} />
                    <p>{t('mentorSeminars.noSeminars', 'Нямате назначени семинари.')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dms-section">
            <div className="dms-header">
                <h3 className="dms-title">
                    <Calendar size={20} />
                    {t('mentorSeminars.title', 'Моите семинари')}
                    <span className="dms-count">{seminars.length}</span>
                </h3>
                <button className="dms-attendance-btn" onClick={() => navigate('/academy/admin/seminar-attendance')}>
                    <UserCheck size={15} />
                    {t('mentorSeminars.markAttendance', 'Запиши присъствие')}
                </button>
            </div>

            <div className="dms-list">
                {seminars.map(sem => {
                    const isExpanded = expandedId === sem.id;
                    const attended = attendedList(sem);
                    const registered = registeredList(sem);

                    return (
                        <div key={sem.id} className={`dms-card ${isExpanded ? 'dms-card-expanded' : ''}`}>
                            <div className="dms-card-header" onClick={() => toggleExpand(sem.id)}>
                                <div className="dms-card-info">
                                    <div className="dms-card-title-row">
                                        <span className="dms-card-title">{sem.title}</span>
                                        <span className={`dms-status ${getStatusClass(sem)}`}>{getStatusLabel(sem)}</span>
                                    </div>
                                    <div className="dms-card-meta">
                                        <span className="dms-card-date">
                                            <Calendar size={13} />
                                            {formatDate(sem.scheduledDate)}
                                        </span>
                                        <span className="dms-card-location">
                                            {sem.isOnline ? <Wifi size={13} /> : <MapPin size={13} />}
                                            {sem.isOnline ? t('mentorSeminars.online', 'Онлайн') : (sem.location || '')}
                                        </span>
                                    </div>
                                    <div className="dms-card-stats">
                                        <span className="dms-stat">
                                            <Users size={13} />
                                            {t('mentorSeminars.registered', 'Записани')}: {registered.length}
                                        </span>
                                        <span className="dms-stat dms-stat-attended">
                                            <UserCheck size={13} />
                                            {t('mentorSeminars.attended', 'Присъствали')}: {attended.length}
                                        </span>
                                    </div>
                                </div>
                                <div className="dms-card-toggle">
                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="dms-card-body">
                                    {attended.length > 0 && (
                                        <div className="dms-attendees">
                                            <h4 className="dms-attendees-title">
                                                {t('mentorSeminars.attendedList', 'Присъствали')}
                                                <span className="dms-attendees-count">{attended.length}</span>
                                            </h4>
                                            <div className="dms-attendees-list">
                                                {attended.map(a => (
                                                    <div key={a.id} className="dms-attendee-row">
                                                        {a.avatar && <img src={a.avatar} alt="" className="dms-attendee-avatar" />}
                                                        <div className="dms-attendee-info">
                                                            <span className="dms-attendee-name">{a.name || `Студент #${a.studentId}`}</span>
                                                            {a.email && <span className="dms-attendee-email">{a.email}</span>}
                                                        </div>
                                                        <span className="dms-attendee-level">{getLevelLabel(a.participationLevel)}</span>
                                                        {a.earnedCredits > 0 && (
                                                            <span className="dms-attendee-credits">{a.earnedCredits} 🪙</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {registered.length > 0 && (
                                        <div className="dms-attendees">
                                            <h4 className="dms-attendees-title">
                                                {t('mentorSeminars.currentParticipants', 'Текущи участници')}
                                                <span className="dms-attendees-count">{registered.length}</span>
                                            </h4>
                                            <div className="dms-attendees-list">
                                                {registered.map(a => (
                                                    <div key={a.id} className="dms-attendee-row">
                                                        {a.avatar && <img src={a.avatar} alt="" className="dms-attendee-avatar" />}
                                                        <div className="dms-attendee-info">
                                                            <span className="dms-attendee-name">{a.name || `Студент #${a.studentId}`}</span>
                                                            {a.email && <span className="dms-attendee-email">{a.email}</span>}
                                                        </div>
                                                        {a.attended
                                                            ? <span className="dms-attendee-level">{getLevelLabel(a.participationLevel)}</span>
                                                            : <span className="dms-attendee-status">{t('mentorSeminars.registered', 'Записан')}</span>
                                                        }
                                                        {a.earnedCredits > 0 && (
                                                            <span className="dms-attendee-credits">{a.earnedCredits} 🪙</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {attended.length === 0 && registered.length === 0 && (
                                        <p className="dms-no-attendees">{t('mentorSeminars.noAttendees', 'Все още няма записани участници.')}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DigiMentorSeminars;
