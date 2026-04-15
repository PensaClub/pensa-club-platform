// src/components/AcademySeminars/SeminarCatalogCard/SeminarCatalogCard.jsx
// Prefix: ascc-

import { useTranslation } from 'react-i18next';
import { MapPin, Wifi, Clock, Users, Award, Calendar } from 'lucide-react';
import './seminarCatalogCard.css';

const SeminarCatalogCard = ({ seminar, status, categoryColor, onClick }) => {
    const { t } = useTranslation('academy');

    const totalCredits = (seminar.creditsForAttendance || 0) +
        (seminar.creditsForParticipation || 0) +
        (seminar.creditsForTest || 0);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('bg-BG', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusLabel = () => {
        switch (status) {
            case 'live': return t('seminarCard.statusLive', 'В МОМЕНТА');
            case 'upcoming': return t('seminarCard.statusUpcoming', 'Предстои');
            case 'completed': return t('seminarCard.statusCompleted', 'Приключил');
            case 'cancelled': return t('seminarCard.statusCancelled', 'Отменен');
            default: return '';
        }
    };

    const getButtonLabel = () => {
        switch (status) {
            case 'live': return t('seminarCard.btnLive', 'Виж повече');
            case 'upcoming': return t('seminarCard.btnUpcoming', 'Запиши се');
            case 'completed': return t('seminarCard.btnCompleted', 'Детайли');
            case 'cancelled': return t('seminarCard.btnCancelled', 'Преглед');
            default: return t('seminarCard.btnDefault', 'Виж');
        }
    };

    const spotsUsed = seminar.registeredCount || seminar.attendedCount || 0;
    const spotsTotal = seminar.maxParticipants || 0;
    const spotsFill = spotsTotal > 0 ? Math.min((spotsUsed / spotsTotal) * 100, 100) : 0;

    return (
        <article
            className={`ascc-card ascc-card--${status}`}
            style={{ '--card-color': categoryColor.primary, '--card-gradient': categoryColor.gradient }}
            onClick={onClick}
        >
            {/* Thumbnail / Header */}
            <div className="ascc-thumb">
                {seminar.thumbnailUrl ? (
                    <img src={seminar.thumbnailUrl} alt={seminar.title} className="ascc-thumb-img" />
                ) : (
                    <div className="ascc-thumb-fallback" style={{ background: categoryColor.gradient }}>
                        <span className="ascc-thumb-fallback-icon">{categoryColor.icon}</span>
                    </div>
                )}
                <div className="ascc-thumb-overlay" />

                {/* Status badge */}
                <div className={`ascc-status ascc-status--${status}`}>
                    {status === 'live' && <span className="ascc-status-dot" />}
                    {getStatusLabel()}
                </div>

                {/* Credits */}
                {totalCredits > 0 && (
                    <div className="ascc-credits">
                        <span>🪙</span>
                        <span>+{totalCredits}</span>
                    </div>
                )}

                {/* Duration */}
                {seminar.durationMinutes && (
                    <div className="ascc-duration">
                        <Clock size={12} />
                        <span>{seminar.durationMinutes} {t('seminarCard.min', 'мин')}</span>
                    </div>
                )}

                {/* Location indicator */}
                <div className={`ascc-location-badge ${seminar.isOnline ? 'ascc-location-online' : 'ascc-location-offline'}`}>
                    {seminar.isOnline ? <Wifi size={12} /> : <MapPin size={12} />}
                    <span>{seminar.isOnline ? t('seminarCard.online', 'Онлайн') : t('seminarCard.inPerson', 'Присъствено')}</span>
                </div>
            </div>

            {/* Content */}
            <div className="ascc-content">
                {/* Category */}
                <div className="ascc-category" style={{ color: categoryColor.primary }}>
                    <span>{categoryColor.icon}</span>
                    <span>{seminar.category || t('seminarCard.uncategorized', 'Семинар')}</span>
                </div>

                {/* Title */}
                <h3 className="ascc-title">{seminar.title}</h3>

                {/* Description */}
                {seminar.shortDescription && (
                    <p className="ascc-desc">{seminar.shortDescription}</p>
                )}

                {/* Date + Time */}
                {seminar.scheduledDate && (
                    <div className="ascc-date-row">
                        <Calendar size={14} />
                        <span className="ascc-date">{formatDate(seminar.scheduledDate)}</span>
                        <span className="ascc-time">{formatTime(seminar.scheduledDate)}</span>
                    </div>
                )}

                {/* Location */}
                {!seminar.isOnline && seminar.location && (
                    <div className="ascc-location-row">
                        <MapPin size={14} />
                        <span>{seminar.location}</span>
                    </div>
                )}

                {/* Tags */}
                {seminar.tags && seminar.tags.length > 0 && (
                    <div className="ascc-tags">
                        {(Array.isArray(seminar.tags) ? seminar.tags : []).slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="ascc-tag">#{tag}</span>
                        ))}
                    </div>
                )}

                {/* Lead facilitator + extra count */}
                {(() => {
                    const facs = Array.isArray(seminar.facilitators) && seminar.facilitators.length > 0
                        ? seminar.facilitators
                        : seminar.facilitator
                            ? [{ type: 'mentor', name: seminar.facilitator.name, photoUrl: seminar.facilitator.photoUrl, isLead: true }]
                            : [];
                    if (facs.length === 0) return null;
                    const lead = facs.find(f => f.isLead) || facs[0];
                    const extra = facs.length - 1;
                    const roleLabel = lead.type === 'admin'
                        ? t('seminarCard.admin', 'Администратор')
                        : lead.type === 'external'
                            ? t('seminarCard.externalLecturer', 'Външен лектор')
                            : t('seminarCard.mentor', 'Ментор');
                    return (
                        <div className="ascc-mentor">
                            <div className="ascc-mentor-avatar">
                                {lead.photoUrl ? (
                                    <img src={lead.photoUrl} alt={lead.name} />
                                ) : (
                                    <span>👤</span>
                                )}
                            </div>
                            <div className="ascc-mentor-info">
                                <span className="ascc-mentor-name">
                                    {lead.name}
                                    {extra > 0 && (
                                        <span className="ascc-mentor-extra">
                                            {t('seminarCard.plusMore', { count: extra, defaultValue: '+{{count}}' })}
                                        </span>
                                    )}
                                </span>
                                <span className="ascc-mentor-role">{roleLabel}</span>
                            </div>
                        </div>
                    );
                })()}

                {/* Footer */}
                <div className="ascc-footer">
                    {/* Spots bar */}
                    {status === 'upcoming' && spotsTotal > 0 && (
                        <div className="ascc-spots">
                            <div className="ascc-spots-bar">
                                <div className="ascc-spots-fill" style={{ width: `${spotsFill}%` }} />
                            </div>
                            <span className="ascc-spots-text">
                                <Users size={12} />
                                {spotsUsed}/{spotsTotal}
                            </span>
                        </div>
                    )}

                    {/* Test badge */}
                    {seminar.hasTest && (
                        <span className="ascc-test-badge">📝 {t('seminarCard.hasTest', 'Тест')}</span>
                    )}

                    {/* CTA button */}
                    <button className={`ascc-btn ascc-btn--${status}`}>
                        {getButtonLabel()}
                    </button>
                </div>
            </div>
        </article>
    );
};

export default SeminarCatalogCard;